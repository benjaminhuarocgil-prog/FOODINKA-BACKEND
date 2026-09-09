import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import * as ctrl from './drivers.controller.js'

const router = Router()
router.use(authenticate)

// Cualquier usuario puede solicitar ser repartidor
router.post('/register',           ctrl.register)

// Solo repartidores verificados
router.get('/orders/available',    authorize('DELIVERY'), ctrl.availableOrders)
router.get('/orders/active',       authorize('DELIVERY'), ctrl.activeOrders)
router.patch('/location',          authorize('DELIVERY'), ctrl.updateLocation)
router.patch('/status',            authorize('DELIVERY'), ctrl.updateStatus)
router.patch('/vehicle',           authorize('DELIVERY'), ctrl.updateVehicle)

export default router
