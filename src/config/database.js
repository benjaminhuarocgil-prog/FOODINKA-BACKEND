import { PrismaClient } from '@prisma/client'

// ── Connection pool ───────────────────────────────────────────────
// Supabase Free tiene un límite de ~60 conexiones directas.
// Con connection_limit=10 por proceso y hasta 4 workers (cluster),
// usamos max 40 conexiones — seguro para el plan gratuito.
// En producción con Supabase Pro sube a 20-25 por proceso.
const CONNECTION_LIMIT = parseInt(process.env.DB_POOL_SIZE || '10')

// La DATABASE_URL debe incluir el pooler de Supabase para producción:
// postgresql://user:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true
// ⚠️  Usar puerto 6543 (Transaction Pooler), NO 5432.
// ⚠️  El parámetro pgbouncer=true desactiva prepared statements en Prisma,
//     lo que es obligatorio cuando se usa PgBouncer (Supabase Pooler).
//
// connection_limit se agrega programáticamente abajo — antes este valor
// solo se usaba para el mensaje de log, pero nunca se aplicaba de verdad,
// así que Prisma usaba su propio default (num_cpus*2+1, ~3-5 en instancias
// pequeñas) en vez del valor configurado. Con 100 usuarios concurrentes,
// ese pool por defecto se agota rápido y las queries empiezan a hacer cola.
function buildDatabaseUrl() {
  const base = process.env.DATABASE_URL
  if (!base) return base
  const url = new URL(base)
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', String(CONNECTION_LIMIT))
  }
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '20') // segundos de espera antes de error
  }
  return url.toString()
}

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
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