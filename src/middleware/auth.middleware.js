import { verifyToken } from '../config/auth0.js'
import { prisma } from '../config/database.js'

export { verifyToken }

export async function loadUser(req, res, next) {
  try {
    const auth0Id = req.auth.payload.sub
    const email   = req.auth.payload['email']   || ''
    const name    = req.auth.payload['name']    || email.split('@')[0] || 'Usuario'
    const picture = req.auth.payload['picture'] || null

    const include = {
      restaurant:      { select: { id: true, status: true } },
      driverProfile:   { select: { id: true, status: true, isVerified: true } },
      consumerProfile: { select: { id: true } },
    }

    // 1. Buscar por auth0Id
    let user = await prisma.user.findUnique({ where: { auth0Id }, include })

    // 2. Si no existe, buscar por email (usuario del seed u otro proveedor)
    if (!user && email) {
      const byEmail = await prisma.user.findUnique({ where: { email } })
      if (byEmail) {
        // Vincular el auth0Id al usuario existente
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data:  { auth0Id, avatarUrl: byEmail.avatarUrl || picture },
          include,
        })
      }
    }

    // 3. Si aún no existe, crearlo con upsert (evita race conditions)
    if (!user) {
      user = await prisma.user.upsert({
        where:  { auth0Id },
        update: { name, avatarUrl: picture },
        create: { auth0Id, email, name, avatarUrl: picture, role: 'CONSUMER' },
        include,
      })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Cuenta suspendida. Contacta soporte.' })
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' })
    }
    next()
  }
}

export const authenticate = [verifyToken, loadUser]