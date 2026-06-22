import axios from 'axios'
import jwt from 'jsonwebtoken'

// ── OAuth de Mercado Pago — conexión de cuentas de restaurantes ──────
// A diferencia de mercadopago.service.js (que cobra usando el token del
// PROPIO restaurante), este archivo solo maneja el flujo de autorización:
// llevar al dueño del restaurante a aprobar el acceso, y canjear el código
// que devuelve MP por un access_token + refresh_token de SU cuenta.
//
// Requiere una Aplicación tipo "Marketplace" creada en el panel de MP
// (distinta del Access Token simple que se usaba antes):
// https://www.mercadopago.com.pe/developers/panel/app
//   → Crear aplicación → Modelo de integración: "Marketplace"
//   → Configurar "URL de redirect" = {BACKEND_URL}/api/v1/restaurants/mercadopago/callback
//   → De ahí sacas MERCADOPAGO_CLIENT_ID y MERCADOPAGO_CLIENT_SECRET

function getStateSecret() {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY no está configurado en el .env')
  }
  return process.env.ENCRYPTION_KEY
}

function getRedirectUri() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
  return `${backendUrl}/api/v1/restaurants/mercadopago/callback`
}

/**
 * Construye la URL a la que se redirige al dueño del restaurante para que
 * autorice la conexión. `state` lleva el restaurantId firmado (JWT corto,
 * 5 min) — así no necesitamos guardar nada en BD para validar el callback,
 * y nos protegemos de que alguien intente forjar el restaurantId.
 */
export function getAuthorizationUrl(restaurantId) {
  if (!process.env.MERCADOPAGO_CLIENT_ID) {
    throw new Error('MERCADOPAGO_CLIENT_ID no está configurado en el .env')
  }
  const state = jwt.sign({ restaurantId }, getStateSecret(), { expiresIn: '5m' })

  const params = new URLSearchParams({
    client_id:     process.env.MERCADOPAGO_CLIENT_ID,
    response_type: 'code',
    platform_id:   'mp',
    state,
    redirect_uri:  getRedirectUri(),
  })

  return `https://auth.mercadopago.com/authorization?${params.toString()}`
}

/** Verifica y decodifica el `state` recibido en el callback. */
export function verifyState(state) {
  try {
    const { restaurantId } = jwt.verify(state, getStateSecret())
    return restaurantId
  } catch {
    throw new Error('El enlace de conexión con Mercado Pago expiró o es inválido. Intenta de nuevo.')
  }
}

/** Canjea el código de autorización por access_token + refresh_token. */
export async function exchangeCodeForToken(code) {
  const { data } = await axios.post('https://api.mercadopago.com/oauth/token', {
    client_id:     process.env.MERCADOPAGO_CLIENT_ID,
    client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
    code,
    grant_type:    'authorization_code',
    redirect_uri:  getRedirectUri(),
  })

  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    mpUserId:     String(data.user_id),
    expiresIn:    data.expires_in, // segundos (~180 días)
  }
}

/** Renueva un access_token usando el refresh_token guardado. */
export async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post('https://api.mercadopago.com/oauth/token', {
    client_id:     process.env.MERCADOPAGO_CLIENT_ID,
    client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  })

  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresIn:    data.expires_in,
  }
}