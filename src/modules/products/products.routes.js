import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import * as ctrl from './products.controller.js'

const router = Router()

// ── Públicas ──────────────────────────────────────────────────
router.get('/restaurant/:restaurantId', ctrl.listByRestaurant)
router.get('/:id', ctrl.getOne)

// ── Dueño / Admin ─────────────────────────────────────────────
router.post('/restaurant/:restaurantId',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.create
)

router.put('/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.update
)

// Aplicar o quitar descuento
router.patch('/:id/discount',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.applyDiscount
)

// Habilitar / deshabilitar producto del menú
router.patch('/:id/availability',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.toggleAvailability
)

router.delete('/:id',
  authenticate,
  authorize('RESTAURANT_OWNER', 'ADMIN'),
  ctrl.remove
)

export default router