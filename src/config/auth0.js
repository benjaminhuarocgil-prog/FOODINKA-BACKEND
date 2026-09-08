import { auth } from 'express-oauth2-jwt-bearer'

export const verifyToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
})

// Auth0 exige un namespace para los claims personalizados incluidos en
// access tokens destinados a una API. Mantener la lectura aquí evita que
// cada middleware tenga que conocer el formato exacto del token.
export function getIdentityClaims(payload) {
  const audience  = String(process.env.AUTH0_AUDIENCE || '').replace(/\/$/, '')
  const namespace = `${audience}/`

  return {
    email:   payload.email   || payload[`${namespace}email`]   || '',
    name:      payload.name    || payload[`${namespace}name`]    || '',
    picture: payload.picture || payload[`${namespace}picture`] || null,
  }
}
