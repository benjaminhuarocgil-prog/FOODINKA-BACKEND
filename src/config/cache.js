// Cache en memoria liviana — sin dependencias externas.
// Para escalar a 1000+ usuarios se puede reemplazar por Redis.

const store = new Map()

/**
 * @param {string} key
 * @param {any}    value
 * @param {number} ttlSeconds  — default 5 min
 */
export function cacheSet(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000
  store.set(key, { value, expiresAt })
}

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function cacheDel(key) {
  store.delete(key)
}

/** Invalida todas las claves que empiezan con un prefijo */
export function cacheDelPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

// Limpieza automática cada 10 min para no acumular entradas expiradas
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key)
  }
}, 10 * 60 * 1000)