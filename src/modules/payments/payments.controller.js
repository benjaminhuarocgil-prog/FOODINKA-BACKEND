import * as svc from './payments.service.js'

// POST /api/v1/payments/charge  (Yape / Efectivo al recibir)
export async function charge(req, res) {
  const { orderId, method, phoneNumber } = req.body

  if (!orderId || !method) {
    return res.status(400).json({
      success: false,
      message: 'Los campos orderId y method son requeridos',
    })
  }

  const data = await svc.charge({
    orderId,
    method,
    phoneNumber,
    userId: req.user.id,
  })

  res.status(201).json({
    success: true,
    message: 'Pago procesado exitosamente',
    data,
  })
}

// POST /api/v1/payments/mercadopago/preference
// Crea la preferencia de Checkout Pro y devuelve la URL a la que redirigir.
export async function createMpPreference(req, res) {
  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'El campo orderId es requerido' })
  }

  const data = await svc.createMercadoPagoPreference({ orderId, userId: req.user.id })

  res.status(201).json({ success: true, data })
}

// POST /api/v1/payments/mercadopago/sync
// Llamado por el frontend al volver de Mercado Pago (success/pending), para
// reflejar el estado real sin tener que esperar al webhook.
export async function syncMp(req, res) {
  const { orderId, mpPaymentId } = req.body
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'El campo orderId es requerido' })
  }

  const data = await svc.syncMercadoPago({ orderId, userId: req.user.id, mpPaymentId })

  res.json({ success: true, data })
}

// POST /api/v1/payments/mercadopago/webhook?restaurantId=...  (público — lo llama Mercado Pago)
// IMPORTANTE: esta ruta NO pasa por el middleware de autenticación.
// restaurantId viene en la query porque lo agregamos nosotros mismos al
// crear la preferencia (ver mercadopago.service.js) — así sabemos con el
// token de QUÉ restaurante hay que consultar este pago.
export async function mpWebhook(req, res) {
  try {
    const mpPaymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id
    const type = req.body?.type || req.query?.type || req.query?.topic
    const restaurantId = req.query?.restaurantId

    // Solo nos interesan notificaciones de tipo "payment"
    if (type === 'payment' && mpPaymentId && restaurantId) {
      await svc.processMercadoPagoUpdate(restaurantId, mpPaymentId)
    }

    // Mercado Pago solo necesita un 200 para no reintentar.
    res.sendStatus(200)
  } catch (error) {
    console.error('[payments.controller] Error en webhook de Mercado Pago:', error)
    // Igual respondemos 200: si devolvemos error, MP reintentará indefinidamente
    // con el mismo payload posiblemente inválido. El log ya quedó registrado.
    res.sendStatus(200)
  }
}

// GET /api/v1/payments/order/:orderId
export async function getByOrder(req, res) {
  const data = await svc.getByOrder(
    req.params.orderId,
    req.user.id,
    req.user.role
  )
  res.json({ success: true, data })
}