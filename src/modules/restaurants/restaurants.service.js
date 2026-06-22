import { prisma } from '../../config/database.js'
import { AppError } from '../../shared/utils/appError.js'
import { encrypt, decrypt } from '../../shared/utils/crypto.util.js'
import * as mpOauth from '../../shared/services/mercadopago-oauth.service.js'

// ── Helpers ───────────────────────────────────────────────────

// Campos que se devuelven en el listado
const RESTAURANT_SELECT = {
  id: true,
  name: true,
  description: true,
  category: true,
  logoUrl: true,
  bannerUrl: true,
  address: true,
  district: true,
  phone: true,
  openingHours: true,
  status: true,
  isDeliveryEnabled: true,
  isReservationEnabled: true,
  deliveryFee: true,
  minOrderAmount: true,
  estimatedTime: true,
  commissionRate: true,
  mpConnected: true, // el checkout lo usa para mostrar/ocultar la opción de Mercado Pago
  createdAt: true,
  _count: {
    select: { orders: true, products: true },
  },
}

// Construir filtros dinámicos para el listado
function buildFilters({ search, category, district, delivery, reservation }) {
  return {
    status: 'ACTIVE',
    ...(search && {
      OR: [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { district:    { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(category     && { category }),
    ...(district     && { district: { contains: district, mode: 'insensitive' } }),
    ...(delivery     === 'true' && { isDeliveryEnabled: true }),
    ...(reservation  === 'true' && { isReservationEnabled: true }),
  }
}

// ── Listar restaurantes ───────────────────────────────────────
export async function list(query) {
  const page  = parseInt(query.page)  || 1
  const limit = parseInt(query.limit) || 12
  const skip  = (page - 1) * limit

  const where = buildFilters(query)

  const [data, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      select: RESTAURANT_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.count({ where }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ── Detalle de un restaurante + su menú ──────────────────────
export async function getOne(id) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      ...RESTAURANT_SELECT,
      ruc: true,
      owner: { select: { id: true, name: true, email: true } },
      categories: {
        orderBy: { order: 'asc' },
        include: {
          products: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' },
          },
        },
      },
      // mpAccessToken / mpRefreshToken NUNCA deben salir de aquí — al usar
      // `select` explícito (en vez de `include`) quedan excluidos por defecto.
    },
  })

  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)
  return restaurant
}

// ── Crear restaurante ─────────────────────────────────────────
export async function create(ownerId, body) {
  // Verificar que el dueño no tenga ya un restaurante
  const existing = await prisma.restaurant.findUnique({ where: { ownerId } })
  if (existing) {
    throw new AppError('Ya tienes un restaurante registrado', 409, 'RESTAURANT_EXISTS')
  }

  // Verificar que el RUC no esté en uso
  const rucUsed = await prisma.restaurant.findUnique({ where: { ruc: body.ruc } })
  if (rucUsed) {
    throw new AppError('Este RUC ya está registrado', 409, 'RUC_TAKEN')
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      ...body,
      ownerId,
      status: 'PENDING_VERIFICATION',
    },
  })

  return restaurant
}

// ── Actualizar restaurante ────────────────────────────────────
export async function update(id, ownerId, role, body) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { ownerId: true },
  })

  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)

  // Solo el dueño o un admin pueden editar
  if (restaurant.ownerId !== ownerId && role !== 'ADMIN') {
    throw new AppError('No tienes permisos para editar este restaurante', 403)
  }

  // No permitir cambiar el RUC
  const { ruc, ...safeBody } = body

  return prisma.restaurant.update({
    where: { id },
    data: safeBody,
  })
}

// ── Verificar restaurante (admin) ─────────────────────────────
export async function verify(id) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)

  if (restaurant.status === 'ACTIVE') {
    throw new AppError('El restaurante ya está activo', 400)
  }

  return prisma.restaurant.update({
    where: { id },
    data: { status: 'ACTIVE' },
  })
}

// ── Suspender restaurante (admin) ─────────────────────────────
export async function suspend(id) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)

  return prisma.restaurant.update({
    where: { id },
    data: { status: 'SUSPENDED' },
  })
}

// ── Categorías del menú ───────────────────────────────────────
export async function listCategories(restaurantId) {
  return prisma.productCategory.findMany({
    where: { restaurantId },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  })
}

export async function createCategory(restaurantId, ownerId, role, { name, order }) {
  // Verificar que el restaurante pertenece al dueño
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  })

  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)

  if (restaurant.ownerId !== ownerId && role !== 'ADMIN') {
    throw new AppError('No tienes permisos sobre este restaurante', 403)
  }

  return prisma.productCategory.create({
    data: { name, order: order || 0, restaurantId },
  })
}

export async function deleteCategory(restaurantId, categoryId, ownerId, role) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  })

  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)

  if (restaurant.ownerId !== ownerId && role !== 'ADMIN') {
    throw new AppError('No tienes permisos sobre este restaurante', 403)
  }

  // Los productos de la categoría quedan sin categoría (SetNull en schema)
  await prisma.productCategory.delete({ where: { id: categoryId } })
}

// ═══════════════════════════════════════════════════════════════
// Conexión OAuth con Mercado Pago (split payments / marketplace)
// ═══════════════════════════════════════════════════════════════

// ── Iniciar conexión: devuelve la URL a la que redirigir al dueño ──
export async function getMpAuthUrl(restaurantId) {
  return mpOauth.getAuthorizationUrl(restaurantId)
}

// ── Callback de MP: canjea el código y guarda los tokens encriptados ──
export async function handleMpCallback(code, state) {
  const restaurantId = mpOauth.verifyState(state) // lanza si el state es inválido/expiró

  const { accessToken, refreshToken, mpUserId, expiresIn } =
    await mpOauth.exchangeCodeForToken(code)

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      mpConnected:      true,
      mpUserId,
      mpAccessToken:    encrypt(accessToken),
      mpRefreshToken:   encrypt(refreshToken),
      mpTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  })

  return restaurantId
}

// ── Desconectar (el dueño puede revocar el acceso) ────────────
export async function disconnectMp(restaurantId, ownerId) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  })
  if (!restaurant) throw new AppError('Restaurante no encontrado', 404)
  if (restaurant.ownerId !== ownerId) throw new AppError('Sin permisos', 403)

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      mpConnected:      false,
      mpUserId:         null,
      mpAccessToken:    null,
      mpRefreshToken:   null,
      mpTokenExpiresAt: null,
    },
  })
}

// ── Obtener un access_token válido para cobrar (lo refresca si está
//    por vencer) — usado por payments.service.js al crear preferencias
//    y al consultar pagos de este restaurante. ──────────────────
export async function getValidMpAccessToken(restaurantId) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      mpConnected: true,
      mpAccessToken: true,
      mpRefreshToken: true,
      mpTokenExpiresAt: true,
    },
  })

  if (!restaurant?.mpConnected || !restaurant.mpAccessToken) {
    throw new AppError(
      'Este restaurante todavía no conectó su cuenta de Mercado Pago.',
      400,
      'MP_NOT_CONNECTED'
    )
  }

  const expiresInMs = restaurant.mpTokenExpiresAt - Date.now()
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000

  // Tokens OAuth de MP duran ~180 días — refrescamos con margen amplio
  // (10 días antes de vencer) para no quedarnos sin acceso a mitad de cobro.
  if (expiresInMs > TEN_DAYS_MS) {
    return decrypt(restaurant.mpAccessToken)
  }

  const refreshToken = decrypt(restaurant.mpRefreshToken)
  const refreshed = await mpOauth.refreshAccessToken(refreshToken)

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      mpAccessToken:    encrypt(refreshed.accessToken),
      mpRefreshToken:   encrypt(refreshed.refreshToken),
      mpTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    },
  })

  return refreshed.accessToken
}