//  Pagos en efectivo / Yape: flujo simulado (sin pasarela real todavía).
//  Pagos con tarjeta: integrados con Mercado Pago (Checkout Pro).
// ─────────────────────────────────────────────────────────────
import { prisma } from '../../config/database.js'
import { AppError } from '../../shared/utils/appError.js'
import { createPreference, getPayment as getMpPayment, searchByExternalReference } from '../../shared/services/mercadopago.service.js'

// ── Simulador de pasarela de pago (Yape / Efectivo) ───────────
// Retorna: { approved: true/false, transactionId, metadata }
async function procesarPago({ method, amount, phoneNumber }) {
  await new Promise(r => setTimeout(r, 500)) // simular delay de red

  return {
    approved:      true,
    transactionId: `SIM-${Date.now()}`,
    metadata: {
      note: 'Pago simulado',
      method,
      amount,
    },
  }
}

// ── Pagar un pedido (Yape / Efectivo al recibir) ──────────────
export async function charge({ orderId, method, phoneNumber, userId }) {
  const METHODS = ['YAPE', 'CASH_ON_DELIVERY']
  if (!METHODS.includes(method)) {
    throw new AppError(`Método inválido para este endpoint. Usa: ${METHODS.join(', ')} (para tarjeta usa /mercadopago/preference)`, 400)
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  })

  if (!order)                   throw new AppError('Pedido no encontrado', 404)
  if (order.userId !== userId)  throw new AppError('Sin permisos', 403)
  if (order.payment)            throw new AppError('Este pedido ya fue pagado', 409, 'ALREADY_PAID')
  if (order.status === 'CANCELLED') {
    throw new AppError('No se puede pagar un pedido cancelado', 400)
  }

  if (method === 'YAPE' && !phoneNumber && !order.user.phone) {
    throw new AppError('Se requiere el número de teléfono para Yape', 400)
  }

  const payment = await prisma.payment.create({
    data: {
      orderId,
      method,
      status:   'PENDING',
      amount:   order.total,
      currency: 'PEN',
    },
  })

  const result = await procesarPago({
    method,
    amount:      order.total,
    phoneNumber: phoneNumber || order.user.phone,
  })

  if (result.approved) {
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:        'PAID',
          transactionId: result.transactionId,
          metadata:      result.metadata,
          paidAt:        new Date(),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data:  { status: 'CONFIRMED' },
      }),
    ])
    return updatedPayment
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', metadata: result.metadata },
    })
    throw new AppError('Pago rechazado. Verifica tus datos e intenta de nuevo.', 402, 'PAYMENT_REJECTED')
  }
}

// ── Crear preferencia de Mercado Pago (Checkout Pro) ──────────
export async function createMercadoPagoPreference({ orderId, userId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })

  if (!order)                  throw new AppError('Pedido no encontrado', 404)
  if (order.userId !== userId) throw new AppError('Sin permisos', 403)
  if (order.payment)           throw new AppError('Este pedido ya fue pagado', 409, 'ALREADY_PAID')
  if (order.status === 'CANCELLED') {
    throw new AppError('No se puede pagar un pedido cancelado', 400)
  }

  // Registro PENDING — su id va como external_reference en MP para poder
  // identificar el pago cuando llegue el webhook o se haga el sync.
  const payment = await prisma.payment.create({
    data: {
      orderId,
      method:   'MERCADOPAGO',
      status:   'PENDING',
      amount:   order.total,
      currency: 'PEN',
    },
  })

  try {
    const { id: preferenceId, initPoint } = await createPreference({
      paymentId:   payment.id,
      orderId:     order.id,
      orderNumber: order.orderNumber,
      amount:      order.total,
      payer: {
        name:  order.user.name,
        email: order.user.email,
      },
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data:  { metadata: { preferenceId } },
    })

    return { paymentId: payment.id, initPoint, preferenceId }
  } catch (error) {
    // Si MP falla al crear la preferencia, no dejar un Payment huérfano
    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: 'FAILED', metadata: { error: error.message } },
    })
    console.error('[payments.service] Error creando preferencia de Mercado Pago:', error.message)
    throw new AppError('No se pudo iniciar el pago con Mercado Pago. Intenta de nuevo.', 503, 'MP_ERROR')
  }
}

// ── Mapeo de estados de Mercado Pago → nuestro PaymentStatus ──
function mapMpStatus(mpStatus) {
  switch (mpStatus) {
    case 'approved':              return 'PAID'
    case 'rejected':               return 'FAILED'
    case 'cancelled':              return 'FAILED'
    case 'refunded':
    case 'charged_back':           return 'REFUNDED'
    case 'pending':
    case 'in_process':
    case 'in_mediation':
    default:                       return 'PENDING'
  }
}

// ── Procesa una actualización de pago de Mercado Pago ─────────
// Usado tanto por el webhook como por el endpoint de sync manual.
// SIEMPRE re-consulta a la API de MP con el id recibido — nunca confía
// en datos que vengan solo del body de la notificación (evita spoofing).
export async function processMercadoPagoUpdate(mpPaymentId) {
  if (!mpPaymentId) return null

  const mpPayment = await getMpPayment(mpPaymentId)
  const ourPaymentId = mpPayment.external_reference
  if (!ourPaymentId) return null

  const payment = await prisma.payment.findUnique({ where: { id: ourPaymentId } })
  if (!payment) return null

  // Idempotencia: si ya estaba PAID/REFUNDED, no reprocesar
  if (['PAID', 'REFUNDED'].includes(payment.status)) return payment

  const newStatus = mapMpStatus(mpPayment.status)

  const updateData = {
    status:        newStatus,
    transactionId:  String(mpPayment.id),
    metadata: {
      ...(payment.metadata || {}),
      mpStatus:        mpPayment.status,
      mpStatusDetail:  mpPayment.status_detail,
      mpPaymentMethod: mpPayment.payment_method_id,
    },
    ...(newStatus === 'PAID' && { paidAt: new Date() }),
  }

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: updateData }),
    ...(newStatus === 'PAID'
      ? [prisma.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED' } })]
      : []),
  ])

  return updatedPayment
}

// ── Sincronizar manualmente el estado (usado al volver del checkout) ──
// mpPaymentId viene del query param `payment_id` que Mercado Pago agrega
// a la back_url al redirigir de vuelta — es la primera vez que lo conocemos,
// por eso no podemos depender únicamente de payment.transactionId.
export async function syncMercadoPago({ orderId, userId, mpPaymentId }) {
  const payment = await prisma.payment.findUnique({ where: { orderId } })
  if (!payment)                throw new AppError('Pago no encontrado', 404)

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (order.userId !== userId) throw new AppError('Sin permisos', 403)

  const idToCheck = mpPaymentId || payment.transactionId
  if (idToCheck) {
    return (await processMercadoPagoUpdate(idToCheck)) || payment
  }

  // Nunca volvimos por la back_url y el webhook tampoco llegó (típico en
  // desarrollo local sin ngrok) — buscamos directamente en MP por
  // external_reference, que es el id de nuestro propio registro Payment.
  const found = await searchByExternalReference(payment.id)
  if (!found) return payment

  return (await processMercadoPagoUpdate(found.id)) || payment
}

// ── Ver pago de un pedido ─────────────────────────────────────
export async function getByOrder(orderId, userId, role) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: { select: { userId: true, orderNumber: true, total: true } },
    },
  })

  if (!payment) throw new AppError('Pago no encontrado', 404)

  if (payment.order.userId !== userId && role !== 'ADMIN') {
    throw new AppError('Sin permisos', 403)
  }

  return payment
}