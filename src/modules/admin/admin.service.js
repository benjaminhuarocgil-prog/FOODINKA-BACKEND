import { prisma } from '../../config/database.js'
import { AppError } from '../../shared/utils/appError.js'

function paginate(query) {
  const page  = parseInt(query.page)  || 1
  const limit = parseInt(query.limit) || 20
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) }
}

// ── Métricas ──────────────────────────────────────────────────
export async function getMetrics() {
  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLast    = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalUsers, totalRestaurants, activeRestaurants, pendingRestaurants,
    totalOrders, ordersThisMonth, ordersLastMonth,
    revenueThisMonth, revenueLastMonth, avgTicket,
    topRestaurants, ordersByStatus, ordersByType,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { status: 'ACTIVE' } }),
    prisma.restaurant.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLast, lte: endOfLast }, status: { not: 'CANCELLED' } } }),
    prisma.payment.aggregate({ where: { status: 'PAID', createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'PAID', createdAt: { gte: startOfLast, lte: endOfLast } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _avg: { amount: true } }),
    prisma.restaurant.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true, name: true, category: true, logoUrl: true,
        _count: { select: { orders: { where: { status: { not: 'CANCELLED' } } } } },
      },
      orderBy: { orders: { _count: 'desc' } },
      take: 5,
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.groupBy({ by: ['type'],   _count: { _all: true } }),
  ])

  const revThisMonth = revenueThisMonth._sum.amount || 0
  const revLastMonth = revenueLastMonth._sum.amount || 0
  const revenueGrowth = revLastMonth > 0
    ? parseFloat((((revThisMonth - revLastMonth) / revLastMonth) * 100).toFixed(1)) : null
  const orderGrowth = ordersLastMonth > 0
    ? parseFloat((((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100).toFixed(1)) : null

  return {
    users:       { total: totalUsers },
    restaurants: { total: totalRestaurants, active: activeRestaurants, pending: pendingRestaurants },
    orders: {
      total: totalOrders, thisMonth: ordersThisMonth, growth: orderGrowth,
      byStatus: Object.fromEntries(ordersByStatus.map(s => [s.status, s._count._all])),
      byType:   Object.fromEntries(ordersByType.map(t => [t.type,   t._count._all])),
    },
    revenue: {
      thisMonth: parseFloat(revThisMonth.toFixed(2)),
      lastMonth: parseFloat(revLastMonth.toFixed(2)),
      growth:    revenueGrowth,
      avgTicket: parseFloat((avgTicket._avg.amount || 0).toFixed(2)),
    },
    topRestaurants: topRestaurants.map(r => ({ ...r, totalOrders: r._count.orders })),
  }
}

export async function getRevenueChart() {
  const results = await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', p."createdAt"), 'YYYY-MM') AS month,
      COUNT(*)::int                                           AS orders,
      COALESCE(SUM(p.amount), 0)::float                      AS revenue
    FROM payments p
    WHERE p.status = 'PAID'
      AND p."createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', p."createdAt")
    ORDER BY DATE_TRUNC('month', p."createdAt") ASC
  `
  return results
}

// ── Usuarios ──────────────────────────────────────────────────
// ⚠️ Campo corregido: auth0Id en lugar de oauthProvider
export async function listUsers(query) {
  const { page, limit, skip } = paginate(query)
  const { search, role } = query

  const where = {
    ...(role   && { role }),
    ...(search && {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isActive: true, avatarUrl: true,
        auth0Id: true,      // ← corregido (antes era oauthProvider)
        createdAt: true,
        _count: { select: { orders: true } },
      },
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return { data, pagination: paginationMeta(page, limit, total) }
}

export async function changeRole(userId, role) {
  const validRoles = ['CONSUMER', 'RESTAURANT_OWNER', 'DELIVERY', 'ADMIN']
  if (!validRoles.includes(role)) throw new AppError('Rol inválido', 400)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('Usuario no encontrado', 404)
  return prisma.user.update({
    where: { id: userId }, data: { role },
    select: { id: true, name: true, email: true, role: true },
  })
}

export async function toggleUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }, select: { isActive: true, role: true },
  })
  if (!user) throw new AppError('Usuario no encontrado', 404)
  if (user.role === 'ADMIN') throw new AppError('No puedes suspender a un administrador', 403)
  return prisma.user.update({
    where: { id: userId }, data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  })
}

// ── Restaurantes ──────────────────────────────────────────────
export async function listRestaurants(query) {
  const { page, limit, skip } = paginate(query)
  const { search, status, category } = query

  const where = {
    ...(status   && { status }),
    ...(category && { category }),
    ...(search   && {
      OR: [
        { name:     { contains: search, mode: 'insensitive' } },
        { ruc:      { contains: search } },
        { district: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [data, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { orders: true, products: true } },
      },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.count({ where }),
  ])

  return { data, pagination: paginationMeta(page, limit, total) }
}

export async function verifyRestaurant(id) {
  const r = await prisma.restaurant.findUnique({ where: { id } })
  if (!r) throw new AppError('Restaurante no encontrado', 404)
  if (r.status === 'ACTIVE') throw new AppError('El restaurante ya está activo', 400)
  return prisma.restaurant.update({ where: { id }, data: { status: 'ACTIVE' } })
}

export async function suspendRestaurant(id) {
  const r = await prisma.restaurant.findUnique({ where: { id } })
  if (!r) throw new AppError('Restaurante no encontrado', 404)
  return prisma.restaurant.update({ where: { id }, data: { status: 'SUSPENDED' } })
}

// ── Pedidos ───────────────────────────────────────────────────
export async function listOrders(query) {
  const { page, limit, skip } = paginate(query)
  const { status, type } = query

  const where = {
    ...(status && { status }),
    ...(type   && { type }),
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user:       { select: { id: true, name: true, email: true } },
        restaurant: { select: { id: true, name: true } },
        payment:    { select: { status: true, method: true, amount: true } },
        driver: { include: { user: { select: { name: true } } } },
        _count: { select: { items: true } },
      },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  return { data, pagination: paginationMeta(page, limit, total) }
}

// ── Pagos ─────────────────────────────────────────────────────
export async function listPayments(query) {
  const { page, limit, skip } = paginate(query)
  const { status, method } = query

  const where = {
    ...(status && { status }),
    ...(method && { method }),
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true, type: true, total: true,
            user:        { select: { name: true, email: true } },
            restaurant:  { select: { name: true } },
          },
        },
      },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ])

  return { data, pagination: paginationMeta(page, limit, total) }
}

// ── Repartidores ──────────────────────────────────────────────
export async function listDrivers(query) {
  const { page, limit, skip } = paginate(query)
  const { status, isVerified } = query

  const where = {
    ...(status     && { status }),
    ...(isVerified !== undefined && isVerified !== '' && {
      isVerified: isVerified === 'true',
    }),
  }

  const [data, total] = await Promise.all([
    prisma.deliveryDriver.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { orders: true } },
      },
      skip, take: limit, orderBy: { createdAt: 'desc' },
    }),
    prisma.deliveryDriver.count({ where }),
  ])

  return { data, pagination: paginationMeta(page, limit, total) }
}

export async function verifyDriver(id) {
  const driver = await prisma.deliveryDriver.findUnique({ where: { id } })
  if (!driver) throw new AppError('Repartidor no encontrado', 404)
  if (driver.isVerified) throw new AppError('El repartidor ya está verificado', 400)
  return prisma.deliveryDriver.update({
    where: { id }, data: { isVerified: true, status: 'AVAILABLE' },
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function suspendDriver(id) {
  const driver = await prisma.deliveryDriver.findUnique({ where: { id } })
  if (!driver) throw new AppError('Repartidor no encontrado', 404)
  return prisma.deliveryDriver.update({
    where: { id }, data: { status: 'SUSPENDED' },
    include: { user: { select: { name: true, email: true } } },
  })
}