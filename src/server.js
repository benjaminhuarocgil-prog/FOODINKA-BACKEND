
import 'dotenv/config'
import { connectDB, disconnectDB } from './config/database.js'

const PORT = process.env.PORT || 4000

async function bootstrap() {
  // 1. Conectar base de datos
  await connectDB()

  // 2. Importar app después de conectar
  const { default: app } = await import('./app.js')

  // 3. Iniciar servidor
  const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`)
  })

  // 4. Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} recibido. Cerrando servidor...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('uncaughtException', (error) => {
    console.error(' Excepción no capturada:', error)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    console.error(' Promesa rechazada sin manejar:', reason)
    process.exit(1)
  })
}

bootstrap()