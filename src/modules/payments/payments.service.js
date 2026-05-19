//  FLUJO SIMULADO — Reemplazar procesarPago() con Pay-me cuando esté listo
//  Todo lo demás (validaciones, BD, estados) queda igual
// ─────────────────────────────────────────────────────────────
import { prisma } from '../../config/database.js'
import { AppError } from '../../shared/utils/appError.js'
// import { chargeCard, chargeYape } from './payme.service.js'

// ── Simulador de pasarela de pago ─────────────────────────────
// Cuando integres Pay-me, reemplaza esta función por la llamada real
// Retorna: { approved: true/false, transactionId, metadata }
async function procesarPago({ method, amount, cardToken, phoneNumber }) {

  // Simular delay de red
  await new Promise(r => setTimeout(r, 500))

  // TODO: reemplazar con Pay-me API

  // Lógica de simulación:
  // - CARD  → aprobado siempre en desarrollo
  // - YAPE  → aprobado siempre en desarrollo
  // - CASH  → aprobado siempre (pago al recibir)
  return {
    approved:      true,
    transactionId: `SIM-${Date.now()}`,
    metadata: {
      note:   'Pago simulado — pendiente integración Pay-me',
      method,
      amount,
    },
  }
}

// ── Pagar un pedido ───────────────────────────────────────────
export async function charge({ orderId, method, cardToken, phoneNumber, userId }) {
  // Métodos válidos
  const METHODS = ['CARD', 'YAPE', 'CASH_ON_DELIVERY']
  if (!METHODS.includes(method)) {
    throw new AppError(`Método inválido. Usa: ${METHODS.join(', ')}`, 400)
  }

  // 1. Verificar pedido
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

  // 2. Validaciones por método
  if (method === 'CARD' && !cardToken) {
    throw new AppError('Se requiere el token de tarjeta', 400)
  }
  if (method === 'YAPE' && !phoneNumber && !order.user.phone) {
    throw new AppError('Se requiere el número de teléfono para Yape', 400)
  }

  // 3. Crear registro PENDING en BD
  const payment = await prisma.payment.create({
    data: {
      orderId,
      method,
      status:   'PENDING',
      amount:   order.total,
      currency: 'PEN',
    },
  })

  // 4. Llamar al procesador (simulado por ahora)
  const result = await procesarPago({
    method,
    amount:      order.total,
    cardToken,
    phoneNumber: phoneNumber || order.user.phone,
  })

  // 5. Actualizar BD según resultado
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
      data: {
        status:   'FAILED',
        metadata: result.metadata,
      },
    })
    throw new AppError('Pago rechazado. Verifica tus datos e intenta de nuevo.', 402, 'PAYMENT_REJECTED')
  }
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