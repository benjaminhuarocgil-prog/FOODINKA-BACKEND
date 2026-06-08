import 'dotenv/config'
import cluster from 'cluster'
import os      from 'os'

const PORT    = process.env.PORT    || 4000
const WORKERS = parseInt(process.env.WEB_CONCURRENCY || os.cpus().length)
// En Render Free / Railway Free solo hay 1 CPU — no penaliza.
// En un VPS con 2+ CPUs duplica/triplica el throughput.

// ─────────────────────────────────────────────────────────────
// PROCESO PRIMARIO — solo gestiona workers
// ─────────────────────────────────────────────────────────────
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`🚀 Master PID ${process.pid} — levantando ${WORKERS} workers`)

  for (let i = 0; i < WORKERS; i++) cluster.fork()

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️  Worker ${worker.process.pid} murió (${signal || code}). Reiniciando...`)
    cluster.fork()   // auto-restart
  })

// ─────────────────────────────────────────────────────────────
// PROCESO WORKER (o single process en dev)
// ─────────────────────────────────────────────────────────────
} else {
  const { connectDB, disconnectDB } = await import('./config/database.js')

  await connectDB()

  const { default: app } = await import('./app.js')

  const server = app.listen(PORT, () => {
    console.log(`✅ Worker ${process.pid} escuchando en :${PORT} [${process.env.NODE_ENV || 'development'}]`)
  })

  // Timeouts de servidor para liberar conexiones colgadas
  server.keepAliveTimeout  = 65_000   // ms — mayor al timeout de ALB/Nginx (60s)
  server.headersTimeout    = 70_000
  server.timeout          = 30_000   // 30s máx por request

  // Graceful shutdown — termina requests en curso antes de cerrar
  const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} recibido en worker ${process.pid}. Cerrando...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    // Forzar cierre si demora más de 15s
    setTimeout(() => process.exit(1), 15_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('uncaughtException', (err) => {
    console.error('💥 Excepción no capturada:', err)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    console.error('💥 Promesa rechazada:', reason)
    process.exit(1)
  })
}