import * as svc from './products.service.js'

// GET /api/v1/products/restaurant/:restaurantId
export async function listByRestaurant(req, res) {
  const data = await svc.listByRestaurant(req.params.restaurantId, req.query)
  res.json({ success: true, data })
}

// GET /api/v1/products/:id
export async function getOne(req, res) {
  const data = await svc.getOne(req.params.id)
  res.json({ success: true, data })
}

// POST /api/v1/products/restaurant/:restaurantId
export async function create(req, res) {
  const data = await svc.create(
    req.params.restaurantId,
    req.user.id,
    req.user.role,
    req.body
  )
  res.status(201).json({ success: true, message: 'Producto creado', data })
}

// PUT /api/v1/products/:id
export async function update(req, res) {
  const data = await svc.update(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  )
  res.json({ success: true, data })
}

// PATCH /api/v1/products/:id/discount
export async function applyDiscount(req, res) {
  const { discountPct } = req.body

  if (discountPct === undefined) {
    return res.status(400).json({ success: false, message: 'El campo discountPct es requerido' })
  }

  const data = await svc.applyDiscount(
    req.params.id,
    req.user.id,
    req.user.role,
    Number(discountPct)
  )

  const msg = discountPct === 0
    ? 'Descuento eliminado'
    : `Descuento de ${discountPct}% aplicado`

  res.json({ success: true, message: msg, data })
}

// PATCH /api/v1/products/:id/availability
export async function toggleAvailability(req, res) {
  const requestedAvailability = typeof req.body?.isAvailable === 'boolean'
    ? req.body.isAvailable
    : undefined
  const data = await svc.setAvailability(
    req.params.id,
    req.user.id,
    req.user.role,
    requestedAvailability
  )
  const msg = data.isAvailable ? 'Producto habilitado en el menú' : 'Producto ocultado del menú'
  res.json({ success: true, message: msg, data })
}

// DELETE /api/v1/products/:id
export async function remove(req, res) {
  await svc.remove(req.params.id, req.user.id, req.user.role)
  res.json({ success: true, message: 'Producto eliminado' })
}
