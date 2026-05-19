import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware.js'
import * as ctrl from './payments.controller.js'

const router = Router()
router.use(authenticate)

router.post('/charge',         ctrl.charge)      // pagar un pedido
router.get('/order/:orderId',  ctrl.getByOrder)  // ver pago de un pedido

export default router