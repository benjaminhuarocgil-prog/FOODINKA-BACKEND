import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// ── Cliente MP por restaurante ────────────────────────────────────
// Modelo Marketplace: cada cobro se hace con el access_token DEL
// RESTAURANTE (obtenido por OAuth — ver mercadopago-oauth.service.js),
// no con un token único de la plataforma. Por eso ya no existe un
// cliente global: se construye uno por llamada, con el token recibido.
function buildClient(accessToken) {
  if (!accessToken) {
    throw new Error('Falta el access_token de Mercado Pago del restaurante')
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

/**
 * Crea una preferencia de pago (Checkout Pro) en la cuenta del RESTAURANTE,
 * con un marketplace_fee que MP transfiere automáticamente a la cuenta de
 * la plataforma al momento del pago (split 1:1).
 *
 * @param {object} params
 * @param {string} params.accessToken     Access token del restaurante (OAuth)
 * @param {string} params.paymentId       ID de nuestro registro Payment (va como external_reference)
 * @param {string} params.orderId         ID del pedido (para las back_urls)
 * @param {string} params.orderNumber     Número del pedido, para mostrar en el resumen de MP
 * @param {number} params.amount          Monto total a cobrar (lo paga el cliente)
 * @param {number} params.marketplaceFee  Tu comisión — se descuenta del lado del restaurante
 *                                        y se acredita sola en TU cuenta de Mercado Pago.
 * @param {{name?:string, email?:string}} params.payer
 */
export async function createPreference({
  accessToken, paymentId, orderId, orderNumber, restaurantId, amount, marketplaceFee, payer,
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
      // restaurantId va en la query del webhook — así, cuando llegue la
      // notificación, sabemos de inmediato con el token de QUÉ restaurante
      // hay que consultar el pago (patrón recomendado por MP para
      // integraciones con múltiples cuentas conectadas vía OAuth).
      notification_url:     `${backendUrl}/api/v1/payments/mercadopago/webhook?restaurantId=${restaurantId}`,
      statement_descriptor: 'ANTOJIA',
      marketplace_fee:      Number(marketplaceFee.toFixed(2)),
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
 * Debe usarse el access_token del MISMO restaurante en cuya cuenta se creó
 * el pago (el de la plataforma ya no sirve para esto en el modelo Marketplace).
 */
export async function getPayment(accessToken, mpPaymentId) {
  const client = new Payment(buildClient(accessToken))
  return client.get({ id: mpPaymentId })
}