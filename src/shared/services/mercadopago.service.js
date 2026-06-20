import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// ── Cliente MP (lazy init para no romper el arranque si falta el token) ──
let _client = null
function getClient() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado en el .env')
  }
  if (!_client) {
    _client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 8000 },
    })
  }
  return _client
}

/**
 * Crea una preferencia de pago (Checkout Pro).
 * Devuelve { id, initPoint } — initPoint es la URL a la que se redirige al usuario.
 *
 * @param {object} params
 * @param {string} params.paymentId      ID de nuestro registro Payment (va como external_reference)
 * @param {string} params.orderNumber    Número del pedido, para mostrar en el resumen de MP
 * @param {number} params.amount         Monto total a cobrar
 * @param {{name?:string, email?:string}} params.payer
 */
export async function createPreference({ paymentId, orderId, orderNumber, amount, payer }) {
  const client = getClient()
  const preference = new Preference(client)

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const backendUrl  = process.env.BACKEND_URL  || 'http://localhost:4000'

  // Mercado Pago exige que back_urls.success sea una URL pública real para
  // poder usar auto_return — con localhost (desarrollo) lo rechaza con
  // "auto_return invalid. back_url.success must be defined" aunque la URL
  // sí esté definida. Por eso solo activamos auto_return si no es localhost.
  const isPublicUrl = !/localhost|127\.0\.0\.1/.test(frontendUrl)

  const result = await preference.create({
    body: {
      items: [
        {
          id:          orderNumber,
          title:       `Pedido Antojia #${orderNumber}`,
          quantity:    1,
          currency_id: 'PEN',
          unit_price:  Number(amount),
        },
      ],
      payer: {
        name:  payer?.name  || undefined,
        email: payer?.email || undefined,
      },
      back_urls: {
        success: `${frontendUrl}/payment/success?orderId=${orderId}`,
        failure: `${frontendUrl}/payment/failure?orderId=${orderId}`,
        pending: `${frontendUrl}/payment/pending?orderId=${orderId}`,
      },
      ...(isPublicUrl && { auto_return: 'approved' }),
      external_reference: paymentId,
      notification_url:   `${backendUrl}/api/v1/payments/mercadopago/webhook`,
      statement_descriptor: 'ANTOJIA',
    },
  })

  return { id: result.id, initPoint: result.init_point }
}

/**
 * Busca un pago en MP por external_reference (sin necesitar el id de MP).
 * Útil para un botón de "Verificar pago" manual: cubre el caso en que el
 * usuario nunca volvió por la back_url y el webhook tampoco llegó (típico
 * en desarrollo local sin ngrok).
 */
export async function searchByExternalReference(externalReference) {
  const client = new Payment(getClient())
  const result = await client.search({
    options: { external_reference: externalReference, sort: 'date_created', criteria: 'desc' },
  })
  return result.results?.[0] || null
}

/**
 * Obtiene el detalle real de un pago directamente desde los servidores de MP.
 * Nunca confiamos en el body del webhook por sí solo — siempre re-consultamos
 * con el id recibido, para evitar notificaciones falsificadas.
 */
export async function getPayment(mpPaymentId) {
  const client = new Payment(getClient())
  return client.get({ id: mpPaymentId })
}