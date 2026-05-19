import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Conectado a Supabase (PostgreSQL)')
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
  console.log('🔌 Desconectado de la base de datos')
}