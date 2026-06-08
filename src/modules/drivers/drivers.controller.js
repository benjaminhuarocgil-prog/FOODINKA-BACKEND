import * as svc from './drivers.service.js'

export async function register(req, res) {
  const data = await svc.register(req.user.id, req.body)
  res.status(201).json({
    success: true,
    message: 'Solicitud enviada. El administrador verificará tu perfil.',
    data,
  })
}

export async function availableOrders(req, res) {
  const driver = req.user.driverProfile
  if (!driver) return res.status(404).json({ success: false, message: 'Perfil de repartidor no encontrado' })
  const data = await svc.availableOrders(driver.id, req.query)
  res.json({ success: true, data })
}

export async function updateLocation(req, res) {
  const data = await svc.updateLocation(req.user.id, req.body)
  res.json({ success: true, data })
}

export async function updateStatus(req, res) {
  const { status } = req.body
  if (!status) return res.status(400).json({ success: false, message: 'El campo status es requerido' })
  const data = await svc.updateStatus(req.user.id, status)
  res.json({ success: true, message: `Estado actualizado a ${status}`, data })
}

export async function updateVehicle(req, res) {
  const data = await svc.updateVehicle(req.user.id, req.body)
  res.json({ success: true, message: 'Vehículo actualizado', data })
}