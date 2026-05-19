import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import 'express-async-errors'

import authRouter from './modules/auth/auth.routes.js'
import restaurantsRouter from './modules/restaurants/restaurants.routes.js'
import productsRouter from './modules/products/products.routes.js'
// import ordersRouter from './modules/orders/orders.routes.js'
import paymentsRouter from './modules/payments/payments.routes.js'
import adminRouter from './modules/admin/admin.routes.js'

const app = express()

// ── Seguridad y parsers ──────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/restaurants', restaurantsRouter)
app.use('/api/v1/products',    productsRouter)
// app.use('/api/v1/orders',      ordersRouter)
app.use('/api/v1/payments',    paymentsRouter)
app.use('/api/v1/admin',       adminRouter)

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
})

// ── Manejo de errores global ──────────────────────────────────
app.use((err, req, res, next) => {
  // Errores de Auth0
  if (err.status === 401) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' })
  }
  if (err.status === 403) {
    return res.status(403).json({ success: false, message: 'Sin permisos' })
  }

  // Errores de Prisma — registro duplicado
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Ya existe un registro con esos datos' })
  }

  // Errores operacionales (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    })
  }

  // Error inesperado
  console.error('Error inesperado:', err)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno' : err.message,
  })
})

export default app