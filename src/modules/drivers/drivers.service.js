import { prisma } from '../../config/database.js'
import { AppError } from '../../shared/utils/AppError.js'

// ── Registrarse como repartidor ───────────────────────────────
export async function register(userId, body) {
  const { vehicleType, licensePlate, dni, licenseNumber, licensePhotoUrl, dniPhotoUrl, vehiclePhotoUrl } = body

  // Verificar que no tenga ya un perfil
  const existing = await prisma.deliveryDriver.findUnique({ where: { userId } })
  if (existing) throw new AppError('Ya tienes un perfil de repartidor', 409)

  if (!licenseNumber) throw new AppError('El número de carné de conducir es requerido', 400)
  if (!licensePhotoUrl) throw new AppError('La foto del carné de conducir es requerida', 400)
  if (!dni) throw new AppError('El DNI es requerido', 400)

  // Cambiar rol del usuario
  await prisma.user.update({
    where: { id: userId },
    data:  { role: 'DELIVERY' },
  })

  return prisma.deliveryDriver.create({
    data: {
      userId,
      vehicleType:     vehicleType     || 'MOTORCYCLE',
      licensePlate:    licensePlate    || null,
      dni,
      licenseNumber,
      licensePhotoUrl,
      dniPhotoUrl:     dniPhotoUrl     || null,
      vehiclePhotoUrl: vehiclePhotoUrl || null,
      status:          'OFFLINE',
      isVerified:      false,
    },
  })
}

// ── Pedidos disponibles por zona ──────────────────────────────
export async function availableOrders(driverId, { district }) {
  if (!district) throw new AppError('Selecciona una zona para buscar pedidos', 400)

  return prisma.order.findMany({
    where: {
      type:     'DELIVERY',
      status:   'READY',          // listos para recoger
      driverId: null,             // sin repartidor asignado
      restaurant: {
        district: { contains: district, mode: 'insensitive' },
        status:   'ACTIVE',
      },
    },
    include: {
      restaurant: { select: { id: true, name: true, address: true, district: true, phone: true } },
      user:       { select: { name: true, phone: true } },
      items:      { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

// ── Actualizar ubicación ──────────────────────────────────────
export async function updateLocation(userId, { latitude, longitude }) {
  const driver = await prisma.deliveryDriver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Perfil de repartidor no encontrado', 404)

  return prisma.deliveryDriver.update({
    where: { userId },
    data:  { currentLatitude: latitude, currentLongitude: longitude, lastLocationAt: new Date() },
  })
}

// ── Cambiar estado (OFFLINE / AVAILABLE) ──────────────────────
export async function updateStatus(userId, status) {
  const driver = await prisma.deliveryDriver.findUnique({ where: { userId } })
  if (!driver) throw new AppError('Perfil de repartidor no encontrado', 404)
  if (!driver.isVerified) throw new AppError('Tu perfil aún no ha sido verificado por el administrador', 403)

  const valid = ['OFFLINE', 'AVAILABLE']
  if (!valid.includes(status)) throw new AppError('Estado inválido', 400)

  return prisma.deliveryDriver.update({ where: { userId }, data: { status } })
}