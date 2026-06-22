import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import * as ctrl from './restaurants.controller.js'
import { checkRuc } from './ruc.controller.js'

const router = Router()

// ── Verificación de RUC (pública) ────────────────────────────
router.get('/verify-ruc/:ruc', checkRuc)

// ── Conexión OAuth con Mercado Pago ──────────────────────────
// IMPORTANTE: deben ir ANTES de '/:id' para que Express no interprete
// "mercadopago" como si fuera un id de restaurante.
router.get('/mercadopago/connect',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  ctrl.connectMp
)
router.get('/mercadopago/callback', ctrl.mpCallback) // público — lo llama Mercado Pago
router.delete('/mercadopago/disconnect',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  ctrl.disconnectMp
)

// ── Públicas ──────────────────────────────────────────────────
router.get('/',    ctrl.list)
router.get('/:id', ctrl.getOne)

// ── Dueño de restaurante ──────────────────────────────────────
router.post('/',
  authenticate,
  authorize('RESTAURANT_OWNER'),
  ctrl.create
)
router.put('/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.update
)

// ── Categorías ────────────────────────────────────────────────
router.get('/:id/categories', ctrl.listCategories)
router.post('/:id/categories',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.createCategory
)
router.delete('/:id/categories/:categoryId',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.deleteCategory
)

// ── Admin ─────────────────────────────────────────────────────
router.patch('/:id/verify',  authenticate, authorize('ADMIN'), ctrl.verify)
router.patch('/:id/suspend', authenticate, authorize('ADMIN'), ctrl.suspend)

export default router