import axios from 'axios'
import { AppError } from '../utils/AppError.js'

export function validateRucFormat(ruc) {
  if (!/^\d{11}$/.test(ruc)) return false
  const prefix = parseInt(ruc.substring(0, 2))
  return [10, 15, 17, 20].includes(prefix)
}

export async function verifyRuc(ruc) {
  if (!validateRucFormat(ruc)) {
    throw new AppError('Formato de RUC inválido. Debe tener 11 dígitos.', 400, 'INVALID_RUC_FORMAT')
  }

  try {
    const response = await axios.get(
      `${process.env.SUNAT_API_URL}/${ruc}`,
      {
        headers: { Authorization: `Bearer ${process.env.SUNAT_API_TOKEN}` },
        timeout: 8000,
      }
    )

    const data = response.data?.data
    if (!data) throw new AppError('RUC no encontrado en SUNAT', 400, 'RUC_NOT_FOUND')

    if (data.estado !== 'ACTIVO') {
      throw new AppError(`RUC no activo (estado: ${data.estado})`, 400, 'RUC_INACTIVE')
    }
    if (data.condicion !== 'HABIDO') {
      throw new AppError(`RUC con condición ${data.condicion}`, 400, 'RUC_CONDITION')
    }

    return { ruc, razonSocial: data.razonSocial, estado: data.estado, condicion: data.condicion }
  } catch (error) {
    if (error instanceof AppError) throw error
    // En desarrollo, si no hay API de SUNAT configurada, simular respuesta
    if (process.env.NODE_ENV === 'development' && !process.env.SUNAT_API_URL) {
      return { ruc, razonSocial: 'EMPRESA DE PRUEBA SAC', estado: 'ACTIVO', condicion: 'HABIDO' }
    }
    throw new AppError('No se pudo verificar el RUC. Intenta más tarde.', 503, 'SUNAT_ERROR')
  }
}