import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// El access token pertenece a la cuenta central de la plataforma.
function buildClient(accessToken) {
  if (!accessToken) {
    throw new Error('Falta el access_token central de Mercado Pago')
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

/**
 * Crea una preferencia de Checkout Pro en la cuenta central.
 *
 * @param {object} params
 * @param {string} params.accessToken     Access token central
 * @param {string} params.paymentId       ID de nuestro registro Payment (va como external_reference)
 * @param {string} params.orderId         ID del pedido (para las back_urls)
 * @param {string} params.orderNumber     Número del pedido, para mostrar en el resumen de MP
 * @param {number} params.amount          Monto total a cobrar (lo paga el cliente)
 * @param {{name?:string, email?:string}} params.payer
 */
export async function createPreference({
  accessToken, paymentId, orderId, orderNumber, amount, payer,
  testMode = false,
}) {
  const client = buildClient(accessToken)
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
      external_reference:   paymentId,
      notification_url:     `${backendUrl}/api/v1/payments/mercadopago/webhook?mode=${testMode ? 'test' : 'production'}`,
      statement_descriptor: 'ANTOJIA',
    },
  })

  return {
    id: result.id,
    initPoint: testMode
      ? (result.sandbox_init_point || result.init_point)
      : result.init_point,
  }
}

/**
 * Busca un pago en MP por external_reference (sin necesitar el id de MP).
 * Útil para un botón de "Verificar pago" manual: cubre el caso en que el
 * usuario nunca volvió por la back_url y el webhook tampoco llegó (típico
 * en desarrollo local sin ngrok).
 */
export async function searchByExternalReference(accessToken, externalReference) {
  const client = new Payment(buildClient(accessToken))
  const result = await client.search({
    options: { external_reference: externalReference, sort: 'date_created', criteria: 'desc' },
  })
  return result.results?.[0] || null
}

/**
 * Obtiene el detalle real de un pago directamente desde los servidores de MP.
 * Nunca confiamos en el body del webhook por sí solo — siempre re-consultamos
 * con el id recibido, para evitar notificaciones falsificadas.
 *
 * Usa el mismo token central con el que se creó la preferencia.
 */
export async function getPayment(accessToken, mpPaymentId) {
  const client = new Payment(buildClient(accessToken))
  return client.get({ id: mpPaymentId })
}
