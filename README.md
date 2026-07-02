# 🍽️ Antojia — Backend

API REST del marketplace gastronómico **Antojia**, construida con Node.js, Express y Prisma sobre PostgreSQL (Supabase).

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4.x | Framework HTTP |
| Prisma | 6.x | ORM / migraciones |
| PostgreSQL | 15 | Base de datos (Supabase) |
| Auth0 | — | Autenticación JWT |
| Helmet | 7.x | Seguridad HTTP |
| express-rate-limit | 7.x | Rate limiting |
| compression | 1.x | Compresión gzip |
| Morgan | 1.x | Logging HTTP |

---

## 📁 Estructura del proyecto

```
backend/
├── prisma/
│   ├── schema.prisma        # Modelos de la BD
│   ├── seed.js              # Datos iniciales
│   └── seed_full.js         # Seed completo (15 restaurantes + 20 repartidores)
├── src/
│   ├── app.js               # Configuración Express (middlewares, rutas)
│   ├── server.js            # Entrada principal + cluster
│   ├── config/
│   │   ├── database.js      # Cliente Prisma + connection pool (compatible PgBouncer)
│   │   ├── auth0.js         # Verificación de tokens Auth0
│   │   └── cache.js         # Cache en memoria (user sessions)
│   ├── middleware/
│   │   └── auth.middleware.js  # authenticate + authorize + loadUser
│   ├── modules/
│   │   ├── auth/            # Gestión de usuarios y roles
│   │   ├── restaurants/     # CRUD restaurantes + categorías
│   │   ├── products/        # CRUD productos del menú
│   │   ├── orders/          # Pedidos delivery y reservas
│   │   ├── payments/        # Procesamiento de pagos
│   │   ├── drivers/         # Repartidores y asignación
│   │   └── admin/           # Panel administrativo
│   └── shared/
│       └── utils/           # AppError, helpers
└── package.json
```

---

## 🚀 Instalación y desarrollo

### 1. Requisitos previos
- Node.js ≥ 18
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Auth0](https://auth0.com)

### 2. Instalar dependencias
```bash
git clone <repo>
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

```env
# Base de datos — Transaction Pooler de Supabase (puerto 6543, NO 5432)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"

# Auth0
AUTH0_DOMAIN=dev-xxxx.us.auth0.com
AUTH0_AUDIENCE=https://tu-api-identifier

# Servidor
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> ⚠️ El parámetro `pgbouncer=true` es obligatorio. Sin él Prisma usa prepared statements que PgBouncer no soporta y el servidor lanza el error `42P05`.

### 4. Inicializar la base de datos
```bash
npm run db:push       # Crear tablas
npm run db:seed       # Datos básicos
node prisma/seed_full.js  # 15 restaurantes + 20 repartidores
```

### 5. Correr en desarrollo
```bash
npm run dev
```
El servidor inicia en `http://localhost:4000`

---

## 📡 Endpoints principales

Base URL: `http://localhost:4000/api/v1`

| Módulo | Base | Descripción |
|---|---|---|
| Auth | `/auth` | Perfil, sincronización, registro de restaurante |
| Restaurantes | `/restaurants` | CRUD + verificación RUC |
| Productos | `/products` | Menú del restaurante |
| Pedidos | `/orders` | Delivery y reservas |
| Pagos | `/payments` | Culqi, Yape, efectivo |
| Repartidores | `/drivers` | Pedidos, ubicación, vehículo |
| Admin | `/admin` | Panel de gestión completo |
| Health | `/health` | Estado del servidor |

---

## 🔑 Roles

| Rol | Acceso |
|---|---|
| `CONSUMER` | Crear pedidos, historial, perfil |
| `RESTAURANT_OWNER` | CRUD menú, gestionar pedidos entrantes |
| `DELIVERY` | Pedidos disponibles, ubicación, vehículo |
| `ADMIN` | Acceso completo |

---

## ⚡ Scripts

```bash
npm run dev          # Desarrollo con hot-reload
npm run start        # Producción
npm run db:push      # Aplicar schema
npm run db:seed      # Seed básico
npm run db:studio    # Prisma Studio (GUI de BD)
npm run db:generate  # Regenerar cliente Prisma
npm run db:reset     # Reset completo + seed
```

---

## 🚢 Despliegue en producción (Render)

### Variables de entorno en Render

```env
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=10
AUTH0_DOMAIN=dev-xxxx.us.auth0.com
AUTH0_AUDIENCE=https://tu-api-identifier
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://tu-app.netlify.app
DB_POOL_SIZE=10
```

> ⚠️ Render asigna el puerto automáticamente vía `process.env.PORT`. No uses un puerto fijo en producción.

### Start command en Render
```
node src/server.js
```

### Build command en Render
```
npm install && npx prisma generate
```

### Inicializar BD en Render (una sola vez)
Desde el Shell de Render:
```bash
npx prisma db push
node prisma/seed.js
node prisma/seed_full.js
```

---

## 📄 Licencia

Proyecto académico — Antojia © 2025