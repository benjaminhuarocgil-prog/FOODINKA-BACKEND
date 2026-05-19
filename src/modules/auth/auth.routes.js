import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth.middleware.js'
import * as ctrl from './auth.controller.js'

const router = Router()

// ── Sincronizar usuario tras login (requiere token Auth0) ────
// El frontend llama a este endpoint justo después del login
// Si el usuario no existe en BD lo crea automáticamente
router.post('/sync', authenticate, ctrl.sync)

// ── Obtener perfil del usuario autenticado ───────────────────
router.get('/me', authenticate, ctrl.me)

// ── Actualizar datos del perfil ──────────────────────────────
router.patch('/me', authenticate, ctrl.updateMe)

// ── Cambiar rol (solo admin) ─────────────────────────────────
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), ctrl.changeRole)

export default router