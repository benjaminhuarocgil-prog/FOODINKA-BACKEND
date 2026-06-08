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
| Zod | 3.x | Validación de esquemas |
| Winston | 3.x | Logging estructurado |
| Nodemailer | 8.x | Envío de emails |

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
│   │   ├── database.js      # Cliente Prisma + connection pool
│   │   ├── auth0.js         # Verificación de tokens Auth0
│   │   └── cache.js         # Cache en memoria (user sessions)
│   ├── middleware/
│   │   └── auth.middleware.js  # authenticate + authorize + loadUser
│   ├── modules/
│   │   ├── auth/            # Gestión de usuarios y roles
│   │   ├── restaurants/     # CRUD restaurantes + categorías
│   │   ├── products/        # CRUD productos del menú
│   │   ├── orders/          # Pedidos delivery y reservas
│   │   ├── payments/        # Procesamiento de pagos (Culqi / Yape)
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
- Cuenta en [Supabase](https://supabase.com) (PostgreSQL)
- Cuenta en [Auth0](https://auth0.com)

### 2. Clonar e instalar dependencias
```bash
git clone <repo>
cd backend
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos — usa el Transaction Pooler de Supabase (puerto 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Auth0
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_AUDIENCE=https://tu-api.com

# Servidor
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Inicializar la base de datos
```bash
# Crear tablas según el schema
npm run db:push

# Cargar datos de prueba básicos
npm run db:seed

# Cargar datos completos (15 restaurantes + 20 repartidores)
node prisma/seed_full.js
```

### 5. Correr en desarrollo
```bash
npm run dev
```

El servidor inicia en `http://localhost:4000`

---

## 📡 Endpoints de la API

Base URL: `http://localhost:4000/api/v1`

### 🔐 Auth — `/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/sync` | ✅ | Sincroniza usuario de Auth0 con la BD |
| GET | `/me` | ✅ | Perfil del usuario autenticado |
| PATCH | `/me` | ✅ | Actualizar nombre / teléfono |
| PATCH | `/users/:id/role` | ADMIN | Cambiar rol de usuario |
| POST | `/register-restaurant` | ✅ | Registrar restaurante (cambia rol a OWNER) |

### 🍽️ Restaurantes — `/restaurants`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Listar restaurantes activos |
| GET | `/:id` | — | Detalle de un restaurante |
| POST | `/` | OWNER | Crear restaurante |
| PUT | `/:id` | OWNER | Actualizar restaurante |
| GET | `/verify-ruc/:ruc` | — | Verificar RUC en SUNAT |
| GET | `/:id/categories` | — | Categorías del restaurante |
| POST | `/:id/categories` | OWNER | Crear categoría |
| DELETE | `/:id/categories/:catId` | OWNER | Eliminar categoría |
| PATCH | `/:id/verify` | ADMIN | Verificar restaurante |
| PATCH | `/:id/suspend` | ADMIN | Suspender restaurante |

### 🥗 Productos — `/products`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/restaurant/:id` | — | Listar productos de un restaurante |
| GET | `/:id` | — | Detalle de un producto |
| POST | `/restaurant/:id` | OWNER | Crear producto |
| PUT | `/:id` | OWNER | Actualizar producto |
| PATCH | `/:id/availability` | OWNER | Toggle disponibilidad |
| PATCH | `/:id/discount` | OWNER | Aplicar descuento |
| DELETE | `/:id` | OWNER | Eliminar producto |

### 📦 Pedidos — `/orders`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | ✅ | Crear pedido (delivery o reserva) |
| GET | `/my` | ✅ | Mis pedidos |
| GET | `/:id` | ✅ | Detalle de pedido |
| PATCH | `/:id/cancel` | ✅ | Cancelar pedido |
| GET | `/restaurant/:id` | OWNER | Pedidos del restaurante |
| PATCH | `/:id/status` | OWNER | Actualizar estado del pedido |
| PATCH | `/:id/assign-driver` | ADMIN | Asignar repartidor |

### 💳 Pagos — `/payments`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/charge` | ✅ | Procesar pago de un pedido |
| GET | `/order/:orderId` | ✅ | Ver pago de un pedido |

### 🏍️ Repartidores — `/drivers`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | ✅ | Registrarse como repartidor |
| GET | `/orders/available` | DELIVERY | Ver pedidos disponibles |
| PATCH | `/location` | DELIVERY | Actualizar ubicación GPS |
| PATCH | `/status` | DELIVERY | Cambiar estado (AVAILABLE/OFFLINE) |
| PATCH | `/vehicle` | DELIVERY | Actualizar tipo de vehículo y placa |

### ⚙️ Admin — `/admin`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/metrics` | ADMIN | Métricas generales |
| GET | `/metrics/revenue` | ADMIN | Gráfica de ingresos |
| GET | `/users` | ADMIN | Listar usuarios |
| PATCH | `/users/:id/role` | ADMIN | Cambiar rol |
| PATCH | `/users/:id/toggle` | ADMIN | Activar / suspender usuario |
| GET | `/restaurants` | ADMIN | Listar restaurantes |
| PATCH | `/restaurants/:id/verify` | ADMIN | Verificar restaurante |
| PATCH | `/restaurants/:id/suspend` | ADMIN | Suspender restaurante |
| GET | `/orders` | ADMIN | Listar todos los pedidos |
| GET | `/payments` | ADMIN | Listar todos los pagos |
| GET | `/drivers` | ADMIN | Listar repartidores |
| PATCH | `/drivers/:id/verify` | ADMIN | Verificar repartidor |
| PATCH | `/drivers/:id/suspend` | ADMIN | Suspender repartidor |

### 🩺 Health check
```
GET /health → { status: "ok", pid: 1234, timestamp: "..." }
```

---

## 🗄️ Modelos principales

```
User              → rol: CONSUMER | RESTAURANT_OWNER | DELIVERY | ADMIN
Restaurant        → pertenece a un User (OWNER), tiene Products y Orders
Product           → pertenece a un Restaurant, tiene ProductCategory
Order             → tipo DELIVERY | RESERVATION, estados: PENDING → DELIVERED
Payment           → métodos: CULQI_CARD | YAPE | CASH_ON_DELIVERY
DeliveryDriver    → perfil de repartidor vinculado a User
ConsumerProfile   → perfil de cliente con direcciones guardadas
```

---

## 🔑 Roles y permisos

| Rol | Acceso |
|---|---|
| `CONSUMER` | Crear pedidos, ver su historial, gestionar perfil |
| `RESTAURANT_OWNER` | CRUD de su restaurante y menú, gestionar pedidos entrantes |
| `DELIVERY` | Ver pedidos disponibles, actualizar ubicación y estado |
| `ADMIN` | Acceso completo al panel de administración |

---

## ⚡ Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload (nodemon)
npm run start        # Producción
npm run db:push      # Aplicar schema a la BD
npm run db:seed      # Seed básico
npm run db:studio    # Abrir Prisma Studio (GUI de BD)
npm run db:generate  # Regenerar cliente Prisma
npm run db:reset     # Reset completo de BD + seed
```

---

## 🚢 Despliegue en producción

### Variables de entorno requeridas
```env
DATABASE_URL=postgresql://...?pgbouncer=true    # Transaction Pooler Supabase
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_AUDIENCE=https://tu-api.com
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://tu-frontend.vercel.app
DB_POOL_SIZE=10
```

### Plataformas recomendadas
- **Railway** — despliegue directo desde GitHub, soporte a cluster
- **Render** — plan gratuito disponible
- **Fly.io** — bajo latencia en Latinoamérica

El servidor usa `cluster` de Node.js en producción para aprovechar todos los CPUs disponibles y reiniciar workers caídos automáticamente.

---

## 📄 Licencia

Proyecto — Qoribex © 2026