// prisma/seed.js
// Datos de prueba para desarrollo
// Los auth0Id son simulados — en producción los genera Auth0 automáticamente

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...\n')

  // ===========================================================
  //  USUARIOS
  //  En producción Auth0 crea el User automáticamente al
  //  primer login. Aquí los creamos manualmente para pruebas.
  // ===========================================================

  const admin = await prisma.user.upsert({
    where: { auth0Id: 'auth0|admin-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|admin-seed',
      email: 'admin@marketplace.com',
      name: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin: ${admin.email}`)

  const consumer1 = await prisma.user.upsert({
    where: { auth0Id: 'auth0|consumer1-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|consumer1-seed',
      email: 'juan@test.com',
      name: 'Juan Pérez',
      phone: '987654321',
      role: 'CONSUMER',
    },
  })

  const consumerProfile1 = await prisma.consumerProfile.upsert({
    where: { userId: consumer1.id },
    update: {},
    create: {
      userId: consumer1.id,
      favoriteCuisines: ['cevicheria', 'chifa'],
    },
  })

  await prisma.savedAddress.upsert({
    where: { id: 'addr-juan-casa' },
    update: {},
    create: {
      id: 'addr-juan-casa',
      profileId: consumerProfile1.id,
      label: 'Casa',
      address: 'Av. Benavides 1234',
      district: 'Miraflores',
      reference: 'Edificio azul, piso 4',
      isDefault: true,
    },
  })

  await prisma.savedAddress.upsert({
    where: { id: 'addr-juan-trabajo' },
    update: {},
    create: {
      id: 'addr-juan-trabajo',
      profileId: consumerProfile1.id,
      label: 'Trabajo',
      address: 'Calle Las Begonias 450',
      district: 'San Isidro',
      reference: 'Torre empresarial, piso 8',
      isDefault: false,
    },
  })
  console.log(`✅ Consumidor 1: ${consumer1.email} (2 direcciones)`)

  const consumer2 = await prisma.user.upsert({
    where: { auth0Id: 'auth0|consumer2-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|consumer2-seed',
      email: 'maria@test.com',
      name: 'María García',
      phone: '912345678',
      role: 'CONSUMER',
    },
  })

  const consumerProfile2 = await prisma.consumerProfile.upsert({
    where: { userId: consumer2.id },
    update: {},
    create: {
      userId: consumer2.id,
      favoriteCuisines: ['fast_food', 'pizzeria'],
      dietaryNotes: 'sin mariscos',
    },
  })

  await prisma.savedAddress.upsert({
    where: { id: 'addr-maria-casa' },
    update: {},
    create: {
      id: 'addr-maria-casa',
      profileId: consumerProfile2.id,
      label: 'Casa',
      address: 'Jr. Independencia 567',
      district: 'Barranco',
      reference: 'Casa amarilla con reja negra',
      isDefault: true,
    },
  })
  console.log(`✅ Consumidor 2: ${consumer2.email} (1 dirección)`)

  const owner1 = await prisma.user.upsert({
    where: { auth0Id: 'auth0|owner1-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|owner1-seed',
      email: 'cevicheria@test.com',
      name: 'Carlos Quispe',
      phone: '999111222',
      role: 'RESTAURANT_OWNER',
    },
  })
  console.log(`✅ Dueño 1: ${owner1.email}`)

  const owner2 = await prisma.user.upsert({
    where: { auth0Id: 'auth0|owner2-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|owner2-seed',
      email: 'chifa@test.com',
      name: 'Luis Wong',
      phone: '999333444',
      role: 'RESTAURANT_OWNER',
    },
  })
  console.log(`✅ Dueño 2: ${owner2.email}`)

  const owner3 = await prisma.user.upsert({
    where: { auth0Id: 'auth0|owner3-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|owner3-seed',
      email: 'pizzeria@test.com',
      name: 'Ana Torres',
      phone: '977888999',
      role: 'RESTAURANT_OWNER',
    },
  })
  console.log(`✅ Dueño 3: ${owner3.email}`)

  const driverUser = await prisma.user.upsert({
    where: { auth0Id: 'auth0|driver1-seed' },
    update: {},
    create: {
      auth0Id: 'auth0|driver1-seed',
      email: 'repartidor@test.com',
      name: 'Pedro Flores',
      phone: '988776655',
      role: 'DELIVERY',
    },
  })

  await prisma.deliveryDriver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      status: 'AVAILABLE',
      vehicleType: 'MOTORCYCLE',
      licensePlate: 'ABC-123',
      dni: '12345678',
      isVerified: true,
    },
  })
  console.log(`✅ Repartidor: ${driverUser.email}`)

  // ===========================================================
  //  RESTAURANTES
  // ===========================================================

  const restaurant1 = await prisma.restaurant.upsert({
    where: { ruc: '20123456789' },
    update: {},
    create: {
      name: 'La Cevichería de Carlos',
      ruc: '20123456789',
      description: 'Los mejores ceviches de Lima. Pescado fresco del día, limón de Chulucanas y ají limo.',
      category: 'cevicheria',
      address: 'Av. La Mar 770',
      district: 'Miraflores',
      phone: '014456789',
      status: 'ACTIVE',
      isDeliveryEnabled: true,
      isReservationEnabled: true,
      deliveryFee: 5.00,
      minOrderAmount: 25.00,
      estimatedTime: 35,
      ownerId: owner1.id,
      openingHours: {
        lun: '12:00-22:00', mar: '12:00-22:00', mie: '12:00-22:00',
        jue: '12:00-22:00', vie: '12:00-23:00', sab: '11:00-23:00', dom: '11:00-21:00',
      },
    },
  })
  console.log(`\n✅ Restaurante 1: ${restaurant1.name}`)

  const cat1Entradas = await prisma.productCategory.upsert({
    where: { id: 'cat1-entradas' },
    update: {},
    create: { id: 'cat1-entradas', name: 'Entradas', order: 1, restaurantId: restaurant1.id },
  })
  const cat1Fondos = await prisma.productCategory.upsert({
    where: { id: 'cat1-fondos' },
    update: {},
    create: { id: 'cat1-fondos', name: 'Platos de fondo', order: 2, restaurantId: restaurant1.id },
  })
  const cat1Bebidas = await prisma.productCategory.upsert({
    where: { id: 'cat1-bebidas' },
    update: {},
    create: { id: 'cat1-bebidas', name: 'Bebidas', order: 3, restaurantId: restaurant1.id },
  })

  const productos1 = [
    { id: 'p1-ceviche',    name: 'Ceviche clásico',      description: 'Pescado fresco, limón, ají limo y choclo',          type: 'DISH',  price: 35.00, discountPct: 0,  categoryId: cat1Fondos.id },
    { id: 'p1-tiradito',   name: 'Tiradito nikkei',       description: 'Láminas de pescado con leche de tigre al togarashi', type: 'DISH',  price: 38.00, discountPct: 10, categoryId: cat1Fondos.id },
    { id: 'p1-causa',      name: 'Causa limeña',          description: 'Papa amarilla, atún, mayonesa y palta',             type: 'DISH',  price: 22.00, discountPct: 0,  categoryId: cat1Entradas.id },
    { id: 'p1-chicharron', name: 'Chicharrón de calamar', description: 'Calamar frito con salsa criolla',                   type: 'DISH',  price: 28.00, discountPct: 0,  categoryId: cat1Entradas.id },
    { id: 'p1-leche',      name: 'Leche de tigre',        description: 'Repotenciador marino clásico',                      type: 'DRINK', price: 12.00, discountPct: 0,  categoryId: cat1Bebidas.id },
    { id: 'p1-chicha',     name: 'Chicha morada',         description: 'Maíz morado, canela y clavo',                       type: 'DRINK', price: 8.00,  discountPct: 0,  categoryId: cat1Bebidas.id },
    { id: 'p1-inca',       name: 'Inca Kola 500ml',       description: null,                                                 type: 'DRINK', price: 5.00,  discountPct: 0,  categoryId: cat1Bebidas.id },
  ]

  for (const p of productos1) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, restaurantId: restaurant1.id, isAvailable: true },
    })
  }
  console.log(`   └─ ${productos1.length} productos creados`)

  const restaurant2 = await prisma.restaurant.upsert({
    where: { ruc: '20987654321' },
    update: {},
    create: {
      name: 'Chifa Dragón de Oro',
      ruc: '20987654321',
      description: 'Auténtica cocina chino-peruana desde 1985.',
      category: 'chifa',
      address: 'Jr. Capón 345',
      district: 'Cercado de Lima',
      phone: '014123456',
      status: 'ACTIVE',
      isDeliveryEnabled: true,
      isReservationEnabled: true,
      deliveryFee: 4.00,
      minOrderAmount: 20.00,
      estimatedTime: 25,
      ownerId: owner2.id,
      openingHours: {
        lun: '11:00-22:00', mar: '11:00-22:00', mie: '11:00-22:00',
        jue: '11:00-22:00', vie: '11:00-23:00', sab: '10:00-23:00', dom: '10:00-22:00',
      },
    },
  })
  console.log(`✅ Restaurante 2: ${restaurant2.name}`)

  const cat2Arroces = await prisma.productCategory.upsert({
    where: { id: 'cat2-arroces' },
    update: {},
    create: { id: 'cat2-arroces', name: 'Arroces', order: 1, restaurantId: restaurant2.id },
  })
  const cat2Sopas = await prisma.productCategory.upsert({
    where: { id: 'cat2-sopas' },
    update: {},
    create: { id: 'cat2-sopas', name: 'Sopas', order: 2, restaurantId: restaurant2.id },
  })
  const cat2Bebidas = await prisma.productCategory.upsert({
    where: { id: 'cat2-bebidas' },
    update: {},
    create: { id: 'cat2-bebidas', name: 'Bebidas', order: 3, restaurantId: restaurant2.id },
  })

  const productos2 = [
    { id: 'p2-chaufa',    name: 'Arroz chaufa especial',     description: 'Arroz, pollo, res, mariscos, huevo y cebolla china', type: 'DISH',  price: 28.00, discountPct: 0,  categoryId: cat2Arroces.id },
    { id: 'p2-tallarin',  name: 'Tallarín saltado de pollo', description: 'Tallarines con pollo, verduras y salsa de ostión',    type: 'DISH',  price: 24.00, discountPct: 15, categoryId: cat2Arroces.id },
    { id: 'p2-wantan',    name: 'Sopa wantán',               description: 'Caldo con wantanes rellenos de cerdo',                type: 'DISH',  price: 18.00, discountPct: 0,  categoryId: cat2Sopas.id },
    { id: 'p2-te',        name: 'Té chino',                  description: 'Té de jazmín en tetera',                              type: 'DRINK', price: 6.00,  discountPct: 0,  categoryId: cat2Bebidas.id },
    { id: 'p2-agua',      name: 'Agua mineral 625ml',        description: null,                                                   type: 'DRINK', price: 4.00,  discountPct: 0,  categoryId: cat2Bebidas.id },
  ]

  for (const p of productos2) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, restaurantId: restaurant2.id, isAvailable: true },
    })
  }
  console.log(`   └─ ${productos2.length} productos creados`)

  await prisma.restaurant.upsert({
    where: { ruc: '20555666777' },
    update: {},
    create: {
      name: 'Pizzería Bella Napoli',
      ruc: '20555666777',
      description: 'Pizzas artesanales al horno de leña.',
      category: 'pizzeria',
      address: 'Av. Primavera 890',
      district: 'Surco',
      status: 'PENDING_VERIFICATION',
      isDeliveryEnabled: true,
      isReservationEnabled: false,
      deliveryFee: 6.00,
      estimatedTime: 40,
      ownerId: owner3.id,
    },
  })
  console.log(`✅ Restaurante 3: Pizzería Bella Napoli (pendiente verificación)`)

  // ===========================================================
  //  RESUMEN
  // ===========================================================
  console.log('\n' + '─'.repeat(52))
  console.log('🎉 Seed completado\n')
  console.log('Nota: estos usuarios existen en BD pero NO en Auth0.')
  console.log('Para probar el login real, crea usuarios desde el')
  console.log('dashboard de Auth0 o usando el flujo de la app.\n')
  console.log('Usuarios seed (solo para queries directas a BD):')
  console.log('  admin@marketplace.com   → auth0|admin-seed')
  console.log('  juan@test.com           → auth0|consumer1-seed')
  console.log('  maria@test.com          → auth0|consumer2-seed')
  console.log('  cevicheria@test.com     → auth0|owner1-seed')
  console.log('  chifa@test.com          → auth0|owner2-seed')
  console.log('  pizzeria@test.com       → auth0|owner3-seed')
  console.log('  repartidor@test.com     → auth0|driver1-seed')
  console.log('─'.repeat(52))
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())