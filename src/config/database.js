import { PrismaClient } from '@prisma/client'

// ── Connection pool ───────────────────────────────────────────────
// Supabase Free tiene un límite de ~60 conexiones directas.
// Con connection_limit=10 por proceso y hasta 4 workers (cluster),
// usamos max 40 conexiones — seguro para el plan gratuito.
// En producción con Supabase Pro sube a 20-25 por proceso.
const CONNECTION_LIMIT = parseInt(process.env.DB_POOL_SIZE || '10')

// La DATABASE_URL debe incluir el pooler de Supabase para producción:
// postgresql://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=10
// ⚠️  Usar puerto 6543 (Transaction Pooler), NO 5432.
// ⚠️  El parámetro pgbouncer=true desactiva prepared statements en Prisma,
//     lo que es obligatorio cuando se usa PgBouncer (Supabase Pooler).

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
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

    // ⚠️  NO usar $executeRawUnsafe con SET session_timeout aquí.
    // PgBouncer (Transaction Pooler de Supabase) no soporta prepared
    // statements ni comandos SET de sesión — causa el error 42P05.
    // Los timeouts se configuran desde la DATABASE_URL con pgbouncer=true.

    // Verificar conexión con un query simple sin prepared statements
    await prisma.$queryRaw`SELECT 1`

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