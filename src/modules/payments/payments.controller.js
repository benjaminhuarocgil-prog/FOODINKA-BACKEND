import * as svc from './payments.service.js'

// POST /api/v1/payments/charge
export async function charge(req, res) {
  const { orderId, method, cardToken, phoneNumber } = req.body

  if (!orderId || !method) {
    return res.status(400).json({
      success: false,
      message: 'Los campos orderId y method son requeridos',
    })
  }

  const data = await svc.charge({
    orderId,
    method,
    cardToken,
    phoneNumber,
    userId: req.user.id,
  })

  res.status(201).json({
    success: true,
    message: 'Pago procesado exitosamente',
    data,
  })
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