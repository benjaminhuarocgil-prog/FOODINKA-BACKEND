import { PrismaClient } from '@prisma/client'

// ── Connection pool ───────────────────────────────────────────────
// Supabase Free tiene un límite de ~60 conexiones directas.
// Con connection_limit=10 por proceso y hasta 4 workers (cluster),
// usamos max 40 conexiones — seguro para el plan gratuito.
// En producción con Supabase Pro sube a 20-25 por proceso.
const CONNECTION_LIMIT = parseInt(process.env.DB_POOL_SIZE || '10')

// La DATABASE_URL debe incluir el pooler de Supabase para producción:
// postgresql://user:pass@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=10
// En desarrollo se usa la conexión directa (puerto 5432).

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']       // quitar 'query' en dev — reduce noise y mejora perf
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDB() {
  try {
    await prisma.$connect()
    // Configurar timeouts a nivel de conexión
    await prisma.$executeRawUnsafe(`SET statement_timeout = '10s'`)
    await prisma.$executeRawUnsafe(`SET idle_in_transaction_session_timeout = '30s'`)
    console.log(`✅ BD conectada (pool: ${CONNECTION_LIMIT} conexiones por proceso)`)
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
  console.log('🔌 BD desconectada')
}