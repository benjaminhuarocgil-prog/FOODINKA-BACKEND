import * as svc from './restaurants.service.js'

// GET /api/v1/restaurants
export async function list(req, res) {
  const result = await svc.list(req.query)
  res.json({ success: true, ...result })
}

// GET /api/v1/restaurants/:id
export async function getOne(req, res) {
  const data = await svc.getOne(req.params.id)
  res.json({ success: true, data })
}

// POST /api/v1/restaurants
export async function create(req, res) {
  const {
    name, ruc, description, category,
    address, district, phone,
    isDeliveryEnabled, isReservationEnabled,
    deliveryFee, minOrderAmount, estimatedTime,
    openingHours,
  } = req.body

  // Validaciones básicas
  if (!name || !ruc || !category || !address || !district) {
    return res.status(400).json({
      success: false,
      message: 'Los campos name, ruc, category, address y district son requeridos',
    })
  }

  if (!/^\d{11}$/.test(ruc)) {
    return res.status(400).json({
      success: false,
      message: 'El RUC debe tener exactamente 11 dígitos',
    })
  }

  const data = await svc.create(req.user.id, {
    name, ruc, description, category,
    address, district, phone,
    isDeliveryEnabled:    isDeliveryEnabled    ?? true,
    isReservationEnabled: isReservationEnabled ?? true,
    deliveryFee:          deliveryFee          ?? 0,
    minOrderAmount:       minOrderAmount       ?? null,
    estimatedTime:        estimatedTime        ?? null,
    openingHours:         openingHours         ?? null,
  })

  res.status(201).json({
    success: true,
    message: 'Restaurante creado. Pendiente de verificación por el administrador.',
    data,
  })
}

// PUT /api/v1/restaurants/:id
export async function update(req, res) {
  const data = await svc.update(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  )
  res.json({ success: true, data })
}

// PATCH /api/v1/restaurants/:id/verify
export async function verify(req, res) {
  const data = await svc.verify(req.params.id)
  res.json({ success: true, message: 'Restaurante verificado y activado', data })
}

// PATCH /api/v1/restaurants/:id/suspend
export async function suspend(req, res) {
  const data = await svc.suspend(req.params.id)
  res.json({ success: true, message: 'Restaurante suspendido', data })
}

// GET /api/v1/restaurants/:id/categories
export async function listCategories(req, res) {
  const data = await svc.listCategories(req.params.id)
  res.json({ success: true, data })
}

// POST /api/v1/restaurants/:id/categories
export async function createCategory(req, res) {
  const { name, order } = req.body
  if (!name) {
    return res.status(400).json({ success: false, message: 'El nombre de la categoría es requerido' })
  }
  const data = await svc.createCategory(
    req.params.id,
    req.user.id,
    req.user.role,
    { name, order }
  )
  res.status(201).json({ success: true, data })
}

// DELETE /api/v1/restaurants/:id/categories/:categoryId
export async function deleteCategory(req, res) {
  await svc.deleteCategory(
    req.params.id,
    req.params.categoryId,
    req.user.id,
    req.user.role
  )
  res.json({ success: true, message: 'Categoría eliminada' })
}