import * as authService from './auth.service.js'
import { prisma } from '../../config/database.js'
import { getIdentityClaims } from '../../config/auth0.js'
import { AppError } from '../../shared/utils/appError.js'
import { invalidateUserCache } from '../../middleware/auth.middleware.js'
import { timingSafeEqual } from 'node:crypto'

function secureTokenMatches(received, expected) {
  const receivedBuffer = Buffer.from(received || '')
  const expectedBuffer = Buffer.from(expected || '')
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer)
}

// POST /api/v1/auth/sync
export async function sync(req, res) {
  const { sub: auth0Id } = req.auth.payload
  const { email, name, picture } = getIdentityClaims(req.auth.payload)

  const { user, isNew } = await authService.syncUser({
    auth0Id,
    email,
    name,
    avatarUrl: picture,
  })

  res.status(isNew ? 201 : 200).json({
    success: true,
    message: isNew ? 'Usuario creado' : 'Usuario sincronizado',
    data: user,
  })
}

// GET /api/v1/auth/me
export async function me(req, res) {
  const user = await authService.getProfile(req.user.id)
  res.json({ success: true, data: user })
}

// PATCH /api/v1/auth/me
export async function updateMe(req, res) {
  const { name, phone } = req.body
  const user = await authService.updateProfile(req.user.id, { name, phone })
  res.json({ success: true, data: user })
}

// PATCH /api/v1/auth/users/:id/role
export async function changeRole(req, res) {
  const { role } = req.body
  if (!role) {
    return res.status(400).json({ success: false, message: 'El campo role es requerido' })
  }
  const user = await authService.changeRole(req.params.id, role)
  res.json({ success: true, message: `Rol actualizado a ${role}`, data: user })
}

// POST /api/v1/auth/register-restaurant
export async function registerRestaurant(req, res) {
  const userId = req.user.id
  const {
    name, ruc, category, description,
    address, addressReference, district, phone, latitude, longitude, logoUrl,
  } = req.body
 
  // Validaciones
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!name || !ruc || !category || !address || !district || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, RUC, categoría, dirección, distrito y ubicación en el mapa son requeridos',
    })
  }
  if (!/^\d{11}$/.test(ruc)) {
    return res.status(400).json({
      success: false,
      message: 'El RUC debe tener exactamente 11 dígitos',
    })
  }
 
  // Verificar que el usuario no tenga ya un restaurante
  const existing = await prisma.restaurant.findUnique({ where: { ownerId: userId } })
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Ya tienes un restaurante registrado',
    })
  }
 
  // Verificar que el RUC no esté en uso
  const rucInUse = await prisma.restaurant.findUnique({ where: { ruc } })
  if (rucInUse) {
    return res.status(409).json({
      success: false,
      message: 'Este RUC ya está registrado en la plataforma',
    })
  }
 
  // Crear restaurante y actualizar rol en una sola transacción
  const [restaurant] = await prisma.$transaction([
    prisma.restaurant.create({
      data: {
        ownerId: userId,
        name, ruc, category, description,
        logoUrl: logoUrl || null,
        address, addressReference: addressReference || null, district, phone,
        latitude: lat, longitude: lng,
        status: 'PENDING_VERIFICATION',
        isDeliveryEnabled:    true,
        isReservationEnabled: true,
        deliveryFee:          0,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data:  { role: 'RESTAURANT_OWNER' },
    }),
  ])
 
  res.status(201).json({
    success: true,
    message: 'Restaurante registrado. Pendiente de verificación por el administrador.',
    data: restaurant,
  })
}

// POST /api/v1/auth/register-admin
// Solo se habilita mediante un enlace privado que incluye la clave configurada
// exclusivamente en ADMIN_INVITE_TOKEN dentro de Render.
export async function registerAdmin(req, res) {
  const expectedToken = process.env.ADMIN_INVITE_TOKEN
  const inviteToken = req.body?.inviteToken

  if (!expectedToken) throw new AppError('El alta de administradores no está configurada', 503)
  if (!secureTokenMatches(inviteToken, expectedToken)) throw new AppError('El enlace de administrador no es válido', 403)

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true },
  })
  invalidateUserCache(req.user.auth0Id)

  res.json({ success: true, message: 'Administrador registrado correctamente', data: user })
}
