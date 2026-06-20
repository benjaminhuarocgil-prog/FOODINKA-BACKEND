import axios from 'axios'
import { AppError } from '../utils/appError.js'

export function validateRucFormat(ruc) {
  if (!/^\d{11}$/.test(ruc)) return false
  const prefix = parseInt(ruc.substring(0, 2))
  return [10, 15, 17, 20].includes(prefix)
}

/**
 * Normaliza la respuesta de la API de SUNAT independientemente del proveedor.
 * Cada API externa devuelve el JSON con nombres de campo distintos:
 *   - apis.net.pe / decolecta.com: { razonSocial, estado, condicion }
 *                                  ó { nombre_o_razon_social, estado, condicion }
 *   - apiperu.dev / json.pe:       { data: { nombre_o_razon_social, estado, condicion } }
 *   - apidni.com:                  { data: { razon_social, activo, condicion } }
 *   - peruapi.com:                 { razon_social, estado, condicion }
 */
function normalizeRucData(responseData) {
  // Algunos proveedores envuelven en { data: {...} }, otros devuelven el objeto directo.
  const raw = responseData?.data ?? responseData

  if (!raw) return null

  const razonSocial =
    raw.razonSocial           ??   // apis.net.pe (razonSocial directo)
    raw.nombre_o_razon_social ??   // apiperu.dev, json.pe, decolecta
    raw.razon_social          ??   // peruapi.com, apidni.com
    raw.nombre                ??   // apis.net.pe (campo antiguo)
    null

  // Campo "estado" puede llamarse "activo" en algunos proveedores
  const estado = raw.estado ?? raw.activo ?? null
  const condicion = raw.condicion ?? null

  if (!razonSocial && !estado) return null

  return { razonSocial, estado, condicion }
}

export async function verifyRuc(ruc) {
  if (!validateRucFormat(ruc)) {
    throw new AppError('Formato de RUC inválido. Debe tener 11 dígitos y comenzar con 10, 15, 17 ó 20.', 400, 'INVALID_RUC_FORMAT')
  }

  // --- Modo desarrollo sin API configurada: devolver respuesta simulada ---
  if (!process.env.SUNAT_API_URL) {
    if (process.env.NODE_ENV !== 'production') {
      return { ruc, razonSocial: 'EMPRESA DE PRUEBA SAC', estado: 'ACTIVO', condicion: 'HABIDO' }
    }
    throw new AppError('Servicio de consulta RUC no configurado.', 503, 'SUNAT_NOT_CONFIGURED')
  }

  try {
    const response = await axios.post(
      process.env.SUNAT_API_URL,
      { ruc },
      {
        headers: {
          Authorization: `Bearer ${process.env.SUNAT_API_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    )

    const data = normalizeRucData(response.data)

    if (!data || !data.razonSocial) {
      throw new AppError('RUC no encontrado en SUNAT', 404, 'RUC_NOT_FOUND')
    }

    if (data.estado && data.estado !== 'ACTIVO') {
      throw new AppError(`RUC no activo (estado: ${data.estado})`, 400, 'RUC_INACTIVE')
    }
    if (data.condicion && data.condicion !== 'HABIDO') {
      throw new AppError(`RUC con condición ${data.condicion}`, 400, 'RUC_CONDITION')
    }

    return { ruc, razonSocial: data.razonSocial, estado: data.estado ?? 'ACTIVO', condicion: data.condicion ?? 'HABIDO' }
  } catch (error) {
    if (error instanceof AppError) throw error

    // Log completo en servidor para poder diagnosticar (no se envía al cliente)
    console.error('[sunat.service] Error al consultar RUC:', {
      ruc,
      url: process.env.SUNAT_API_URL,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    })

    const msg = error.response
      ? `SUNAT respondió con error ${error.response.status}`
      : 'No se pudo conectar con el servicio de SUNAT. Intenta más tarde.'
    throw new AppError(msg, 503, 'SUNAT_ERROR')
  }
}