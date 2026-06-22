import crypto from 'crypto'

// Encripta/desencripta datos sensibles (tokens OAuth de Mercado Pago de cada
// restaurante) antes de guardarlos en la BD. Esos tokens dan acceso directo
// a mover dinero de la cuenta del restaurante — nunca deben quedar en texto
// plano en la base de datos.
//
// ENCRYPTION_KEY debe ser una cadena hex de 64 caracteres (32 bytes).
// Generarla una vez con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Guárdala en tu .env y NUNCA la cambies una vez que haya datos encriptados
// con ella (perderías el acceso a esos datos — no hay forma de recuperarlos).

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY no está configurada o no tiene 64 caracteres hex (32 bytes). ' +
      'Genérala con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  return Buffer.from(keyHex, 'hex')
}

/**
 * Encripta un string. Devuelve "iv:authTag:ciphertext" en hex, todo en un
 * solo campo de texto para guardar directo en la BD.
 */
export function encrypt(plainText) {
  if (plainText === null || plainText === undefined) return null
  const iv = crypto.randomBytes(12) // 12 bytes recomendado para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Desencripta un string generado por encrypt(). Devuelve null si el input
 * es null/vacío (para poder encadenar sin chequeos extra en el caller).
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null
  const [ivHex, authTagHex, dataHex] = encryptedText.split(':')
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('Formato de dato encriptado inválido')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}