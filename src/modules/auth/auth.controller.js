import * as authService from './auth.service.js'

// POST /api/v1/auth/sync
export async function sync(req, res) {
  const { sub: auth0Id, email, name, picture } = req.auth.payload

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