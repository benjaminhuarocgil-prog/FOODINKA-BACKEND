// prisma/seed_full.js
// Ejecutar: node --experimental-vm-modules prisma/seed_full.js
// O agregar al package.json: "seed:full": "node prisma/seed_full.js"

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ── Helpers ────────────────────────────────────────────────────────
const upsertUser = (auth0Id, data) =>
  prisma.user.upsert({ where: { auth0Id }, update: {}, create: { auth0Id, ...data } })

const upsertRestaurant = (ruc, data) =>
  prisma.restaurant.upsert({ where: { ruc }, update: {}, create: { ruc, ...data } })

const upsertCat = (id, data) =>
  prisma.productCategory.upsert({ where: { id }, update: {}, create: { id, ...data } })

const upsertProduct = (id, data) =>
  prisma.product.upsert({ where: { id }, update: {}, create: { id, ...data } })

const upsertDriver = (userId, data) =>
  prisma.deliveryDriver.upsert({ where: { userId }, update: {}, create: { userId, ...data } })

// ── Banners de Unsplash (libres) ───────────────────────────────────
const BANNERS = {
  cevicheria: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=1200&q=80',
  chifa:      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
  parrilla:   'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80',
  fast_food:  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
  pizzeria:   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=80',
  cafe:       'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
  heladeria:  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&q=80',
  buffet:     'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=80',
  otro:       'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
}

// ──────────────────────────────────────────────────────────────────
//  DATOS DE RESTAURANTES
// ──────────────────────────────────────────────────────────────────
const RESTAURANTS = [
  {
    ownerIdx: 0,
    ruc: '20100000001',
    name: 'La Picantería de Lima',
    category: 'otro',
    description: 'Cocina criolla y regional peruana. Especialidad en ají de gallina y lomo saltado.',
    address: 'Av. Santa Cruz 771',  district: 'Miraflores',
    phone: '014456001', deliveryFee: 5, minOrderAmount: 25, estimatedTime: 35,
    products: [
      { id:'r1p01', type:'DISH',  name:'Lomo Saltado',           price:38, desc:'Lomo de res, tomate, cebolla y papas fritas' },
      { id:'r1p02', type:'DISH',  name:'Ají de Gallina',         price:32, desc:'Gallina deshilachada en salsa de ají amarillo' },
      { id:'r1p03', type:'DISH',  name:'Arroz con Leche',        price:14, desc:'Postre tradicional con canela y coco rallado' },
      { id:'r1p04', type:'DISH',  name:'Anticuchos de Corazón',  price:22, desc:'Corazón de res marinado al carbón con papas' },
      { id:'r1p05', type:'DISH',  name:'Seco de Res',            price:34, desc:'Estofado de res con culantro, arvejitas y arroz' },
      { id:'r1p06', type:'DISH',  name:'Carapulcra',             price:30, desc:'Papa seca guisada con cerdo y maní' },
      { id:'r1p07', type:'DISH',  name:'Papa a la Huancaína',    price:18, desc:'Papa amarilla con salsa huancaína y aceituna' },
      { id:'r1p08', type:'DISH',  name:'Tallarin Verde con Bistec', price:36, desc:'Pasta al pesto de albahaca con bistec apanado' },
      { id:'r1p09', type:'DISH',  name:'Arroz con Mariscos',     price:42, desc:'Arroz cremoso con choros, conchas y langostinos' },
      { id:'r1p10', type:'DISH',  name:'Causa Rellena',          price:20, desc:'Papa amarilla rellena de atún y palta' },
      { id:'r1p11', type:'DISH',  name:'Escabeche de Pollo',     price:28, desc:'Pollo en escabeche con cebolla encurtida' },
      { id:'r1p12', type:'DISH',  name:'Cau Cau',                price:30, desc:'Mondongo con papas y ají amarillo' },
      { id:'r1p13', type:'DRINK', name:'Chicha Morada',          price:8,  desc:'Maíz morado con frutas y especias' },
      { id:'r1p14', type:'DRINK', name:'Maracuyá Frozen',        price:10, desc:'Jugo de maracuyá con hielo frappé' },
      { id:'r1p15', type:'DRINK', name:'Pisco Sour',             price:22, desc:'Pisco quebranta, limón, clara de huevo' },
      { id:'r1p16', type:'DRINK', name:'Inca Kola 500ml',        price:5,  desc:null },
      { id:'r1p17', type:'DRINK', name:'Agua Mineral 625ml',     price:4,  desc:null },
      { id:'r1p18', type:'COMBO', name:'Combo Criollo Personal', price:45, desc:'Lomo saltado + chicha morada' },
      { id:'r1p19', type:'COMBO', name:'Combo Familiar x4',      price:150,desc:'4 platos de fondo + 4 bebidas + postre' },
      { id:'r1p20', type:'DISH',  name:'Mazamorra Morada',       price:12, desc:'Postre de maíz morado con frutas' },
    ],
  },
  {
    ownerIdx: 1,
    ruc: '20100000002',
    name: 'Nikkei & Mar',
    category: 'cevicheria',
    description: 'Fusión japonesa-peruana. Tiraditos, ceviches nikkei y sushi con sabor local.',
    address: 'Calle Las Begonias 512', district: 'San Isidro',
    phone: '014456002', deliveryFee: 7, minOrderAmount: 40, estimatedTime: 30,
    products: [
      { id:'r2p01', type:'DISH',  name:'Ceviche Nikkei',          price:42, desc:'Pescado con leche de tigre de miso y togarashi' },
      { id:'r2p02', type:'DISH',  name:'Tiradito de Atún',        price:45, desc:'Láminas de atún con salsa ponzu y trufa' },
      { id:'r2p03', type:'DISH',  name:'Causita Nikkei',          price:28, desc:'Papa amarilla con tartar de salmón' },
      { id:'r2p04', type:'DISH',  name:'Tataki de Res',           price:48, desc:'Lomo fino sellado con salsa teriyaki casera' },
      { id:'r2p05', type:'DISH',  name:'Arroz Chaufa Nikkei',     price:35, desc:'Arroz con mariscos y salsa de soya y miso' },
      { id:'r2p06', type:'DISH',  name:'Chicharrón de Calamar',   price:30, desc:'Calamar frito con rocoto y cebolla' },
      { id:'r2p07', type:'DISH',  name:'Roll Acevichado',         price:38, desc:'Roll de camarón con leche de tigre encima' },
      { id:'r2p08', type:'DISH',  name:'Conchitas a la Parmesana',price:32, desc:'Conchas de abanico al horno con parmesano' },
      { id:'r2p09', type:'DISH',  name:'Pulpo al Olivo',          price:52, desc:'Pulpo cocido con crema de aceitunas botija' },
      { id:'r2p10', type:'DISH',  name:'Sopa Miso con Wantán',    price:22, desc:'Miso suave con wantanes peruanos y alga' },
      { id:'r2p11', type:'DISH',  name:'Gyozas al Vapor',         price:24, desc:'8 gyozas de camarón y cilantro' },
      { id:'r2p12', type:'DISH',  name:'Edamame al Ajo',          price:16, desc:'Edamame salteado con ajo dorado' },
      { id:'r2p13', type:'DRINK', name:'Sake de la Casa',         price:28, desc:'Sake caliente o frío, media porción' },
      { id:'r2p14', type:'DRINK', name:'Leche de Tigre Nikkei',   price:18, desc:'Licuado de leche de tigre con mariscos' },
      { id:'r2p15', type:'DRINK', name:'Limonada Frozen',         price:10, desc:'Limón sutíl con hielo raspado' },
      { id:'r2p16', type:'DRINK', name:'Agua Tónica',             price:8,  desc:'Agua tónica importada' },
      { id:'r2p17', type:'DRINK', name:'Té Verde Matcha Latte',   price:14, desc:'Matcha con leche de avena' },
      { id:'r2p18', type:'COMBO', name:'Menú Ejecutivo Nikkei',   price:55, desc:'Entrada + fondo + bebida del día' },
      { id:'r2p19', type:'COMBO', name:'Tabla Nikkei x2',         price:95, desc:'2 entradas + 2 fondos + 2 bebidas' },
      { id:'r2p20', type:'DISH',  name:'Mochi de Lúcuma',         price:16, desc:'Postre japonés relleno con lúcuma peruana' },
    ],
  },
  {
    ownerIdx: 2,
    ruc: '20100000003',
    name: 'El Parrillero Mayor',
    category: 'parrilla',
    description: 'Carnes a las brasas al estilo criollo. Combos para toda la familia.',
    address: 'Av. Universitaria 2430', district: 'Los Olivos',
    phone: '014456003', deliveryFee: 6, minOrderAmount: 30, estimatedTime: 45,
    products: [
      { id:'r3p01', type:'DISH',  name:'Parrilla Mixta Personal',  price:45, desc:'Pollo, chorizo y costilla al carbón con papas' },
      { id:'r3p02', type:'DISH',  name:'Costillas BBQ',            price:48, desc:'Costillas de cerdo bañadas en salsa BBQ casera' },
      { id:'r3p03', type:'DISH',  name:'Chorizo Especial',         price:28, desc:'Chorizo criollo con chimichurri y pan' },
      { id:'r3p04', type:'DISH',  name:'Pollo a la Brasa Entero',  price:55, desc:'Pollo marinado en horno giratorio con papas y ensalada' },
      { id:'r3p05', type:'DISH',  name:'Pollo a la Brasa 1/4',    price:16, desc:'1/4 de pollo con papas y cremas' },
      { id:'r3p06', type:'DISH',  name:'Chuleta de Cerdo',         price:38, desc:'Chuleta gruesa al carbón con puré andino' },
      { id:'r3p07', type:'DISH',  name:'Anticuchos de Pollo',      price:20, desc:'Brochetas de pollo con salsa de maní' },
      { id:'r3p08', type:'DISH',  name:'Asado de Tira',            price:52, desc:'Tira de asado con papas fritas y ensalada' },
      { id:'r3p09', type:'DISH',  name:'Tequeños Rellenos',        price:18, desc:'8 tequeños de queso para picar' },
      { id:'r3p10', type:'DISH',  name:'Ensalada Criolla',         price:12, desc:'Cebolla roja, tomate y ají amarillo' },
      { id:'r3p11', type:'DISH',  name:'Papas Fritas Porción',     price:10, desc:'Papas fritas con ketchup y mayonesa' },
      { id:'r3p12', type:'DISH',  name:'Yucas Fritas',             price:10, desc:'Yuca dorada con crema huancaína' },
      { id:'r3p13', type:'DRINK', name:'Chicha de Jora',           price:8,  desc:'Chicha artesanal fermentada' },
      { id:'r3p14', type:'DRINK', name:'Limonada de la Casa',      price:9,  desc:'Limón, hierbabuena y azúcar de caña' },
      { id:'r3p15', type:'DRINK', name:'Cerveza Pilsen 620ml',     price:12, desc:'Cerveza bien fría' },
      { id:'r3p16', type:'DRINK', name:'Inca Kola 1.5L',           price:9,  desc:'Para compartir en la mesa' },
      { id:'r3p17', type:'DRINK', name:'Agua Mineral 625ml',       price:4,  desc:null },
      { id:'r3p18', type:'COMBO', name:'Combo Parrillero x2',      price:85, desc:'Parrilla mixta x2 + 2 bebidas + papas' },
      { id:'r3p19', type:'COMBO', name:'Combo Familiar x6',        price:220,desc:'Pollo entero + 2 parrillas + 6 bebidas + papas' },
      { id:'r3p20', type:'DISH',  name:'Picarones con Miel',       price:14, desc:'Picarones de zapallo con miel de chancaca' },
    ],
  },
  {
    ownerIdx: 3,
    ruc: '20100000004',
    name: 'Burger Bros Lima',
    category: 'fast_food',
    description: 'Hamburguesas artesanales con pan brioche, carne angus y salsas de autor.',
    address: 'Av. Benavides 1900', district: 'Surco',
    phone: '014456004', deliveryFee: 4, minOrderAmount: 20, estimatedTime: 25,
    products: [
      { id:'r4p01', type:'DISH',  name:'Burger Clásica',          price:28, desc:'Angus 180g, lechuga, tomate, cebolla y mostaza' },
      { id:'r4p02', type:'DISH',  name:'Burger BBQ Bacon',        price:35, desc:'Angus 200g, bacon, queso cheddar y salsa BBQ' },
      { id:'r4p03', type:'DISH',  name:'Burger Trufa',            price:42, desc:'Angus 220g, queso brie y mayonesa de trufa' },
      { id:'r4p04', type:'DISH',  name:'Burger Pollo Crunch',     price:30, desc:'Pechuga apanada, coleslaw y salsa buffalo' },
      { id:'r4p05', type:'DISH',  name:'Burger Veggie',           price:26, desc:'Hamburguesa de lentejas y quinua con aguacate' },
      { id:'r4p06', type:'DISH',  name:'Hot Dog NY Style',        price:20, desc:'Salchicha de res, mostaza, cebolla frita y pepinillo' },
      { id:'r4p07', type:'DISH',  name:'Papas Fritas Clásicas',   price:12, desc:'Papas corte fino con sal ahumada' },
      { id:'r4p08', type:'DISH',  name:'Papas Rústicas',          price:14, desc:'Papas con cáscara y dip de queso azul' },
      { id:'r4p09', type:'DISH',  name:'Onion Rings',             price:14, desc:'Aros de cebolla apanados con salsa ranch' },
      { id:'r4p10', type:'DISH',  name:'Nuggets x8',              price:18, desc:'Nuggets de pollo con salsa barbecue' },
      { id:'r4p11', type:'DISH',  name:'Mac n Cheese',            price:16, desc:'Macarrones cremosos con queso cheddar' },
      { id:'r4p12', type:'DISH',  name:'Coleslaw Porción',        price:8,  desc:'Ensalada cremosa de col y zanahoria' },
      { id:'r4p13', type:'DRINK', name:'Milkshake de Vainilla',   price:16, desc:'Helado de vainilla blendado con leche' },
      { id:'r4p14', type:'DRINK', name:'Milkshake de Chocolate',  price:16, desc:'Helado de chocolate con crema batida' },
      { id:'r4p15', type:'DRINK', name:'Limonada Soda',           price:10, desc:'Limón con agua con gas y menta' },
      { id:'r4p16', type:'DRINK', name:'Coca-Cola 500ml',         price:6,  desc:null },
      { id:'r4p17', type:'DRINK', name:'Agua Sin Gas 500ml',      price:4,  desc:null },
      { id:'r4p18', type:'COMBO', name:'Combo Burger Simple',     price:38, desc:'Burger Clásica + papas + bebida' },
      { id:'r4p19', type:'COMBO', name:'Combo Burger Doble',      price:52, desc:'Burger BBQ + papas rústicas + milkshake' },
      { id:'r4p20', type:'COMBO', name:'Combo Bros x2',           price:72, desc:'2 burgers a elegir + 2 papas + 2 bebidas' },
    ],
  },
  {
    ownerIdx: 4,
    ruc: '20100000005',
    name: 'Trattoria Da Roma',
    category: 'pizzeria',
    description: 'Cocina italiana auténtica, pizzas al horno de leña y pastas artesanales.',
    address: 'Av. Grau 298', district: 'Barranco',
    phone: '014456005', deliveryFee: 6, minOrderAmount: 35, estimatedTime: 40,
    products: [
      { id:'r5p01', type:'DISH',  name:'Pizza Margherita',        price:38, desc:'Tomate San Marzano, mozzarella y albahaca fresca' },
      { id:'r5p02', type:'DISH',  name:'Pizza Prosciutto',        price:48, desc:'Jamón serrano, rúcula y parmesano' },
      { id:'r5p03', type:'DISH',  name:'Pizza Quattro Stagioni',  price:45, desc:'Jamón, champiñones, alcachofas y aceituna' },
      { id:'r5p04', type:'DISH',  name:'Pizza Diavola',           price:44, desc:'Salami picante y mozzarella con chile' },
      { id:'r5p05', type:'DISH',  name:'Spaghetti Carbonara',     price:36, desc:'Huevo, guanciale, pecorino y pimienta negra' },
      { id:'r5p06', type:'DISH',  name:'Fetuccini al Pesto',      price:34, desc:'Pasta con pesto de albahaca y piñones' },
      { id:'r5p07', type:'DISH',  name:'Risotto de Hongos',       price:40, desc:'Arroz arbóreo, porcini y trufa negra' },
      { id:'r5p08', type:'DISH',  name:'Lasagna al Forno',        price:38, desc:'Lasaña clásica con ragú y bechamel' },
      { id:'r5p09', type:'DISH',  name:'Bruschetta al Pomodoro',  price:18, desc:'Pan tostado con tomate, ajo y albahaca' },
      { id:'r5p10', type:'DISH',  name:'Ensalada Caprese',        price:22, desc:'Tomate, mozzarella burrata y aceite de oliva' },
      { id:'r5p11', type:'DISH',  name:'Arancini Siciliani',      price:20, desc:'3 croquetas de arroz rellenas de ragú' },
      { id:'r5p12', type:'DISH',  name:'Tiramisú',                price:18, desc:'Clásico italiano con café y mascarpone' },
      { id:'r5p13', type:'DRINK', name:'Vino Tinto de la Casa',   price:28, desc:'Copa de vino tinto chileno' },
      { id:'r5p14', type:'DRINK', name:'Vino Blanco de la Casa',  price:28, desc:'Copa de vino blanco italiano' },
      { id:'r5p15', type:'DRINK', name:'Limoncello',              price:18, desc:'Licor de limón italiano de la casa' },
      { id:'r5p16', type:'DRINK', name:'Agua Mineral Italiana',   price:8,  desc:'San Pellegrino 500ml' },
      { id:'r5p17', type:'DRINK', name:'Café Espresso',           price:8,  desc:'Café de origen italiano en taza pequeña' },
      { id:'r5p18', type:'COMBO', name:'Menú Romántico x2',       price:95, desc:'2 entradas + 2 fondos + 2 copas de vino' },
      { id:'r5p19', type:'COMBO', name:'Pizza + Pasta + Bebida',  price:65, desc:'1 pizza mediana + pasta a elegir + 2 bebidas' },
      { id:'r5p20', type:'DISH',  name:'Panna Cotta de Maracuyá', price:16, desc:'Gelatina de crema con coulis de maracuyá' },
    ],
  },
  {
    ownerIdx: 5,
    ruc: '20100000006',
    name: 'Café Comercio Barranco',
    category: 'cafe',
    description: 'Café de especialidad, brunch y repostería artesanal en el corazón de Barranco.',
    address: 'Jr. Junín 232', district: 'Barranco',
    phone: '014456006', deliveryFee: 5, minOrderAmount: 18, estimatedTime: 20,
    products: [
      { id:'r6p01', type:'DRINK', name:'Espresso Doble',          price:9,  desc:'Café peruano de especialidad, doble shot' },
      { id:'r6p02', type:'DRINK', name:'Cappuccino',              price:12, desc:'Espresso con leche vaporizada y espuma' },
      { id:'r6p03', type:'DRINK', name:'Latte de Vainilla',       price:14, desc:'Espresso con leche vaporizada y sirope' },
      { id:'r6p04', type:'DRINK', name:'Matcha Latte',            price:16, desc:'Té matcha premium con leche de avena' },
      { id:'r6p05', type:'DRINK', name:'Cold Brew 24h',           price:14, desc:'Café en frío infusionado 24 horas' },
      { id:'r6p06', type:'DRINK', name:'Frappé de Caramelo',      price:18, desc:'Café blendado con caramelo y crema batida' },
      { id:'r6p07', type:'DRINK', name:'Limonada con Menta',      price:10, desc:'Limón sutil, menta fresca y azúcar de caña' },
      { id:'r6p08', type:'DISH',  name:'Avocado Toast',           price:22, desc:'Pan de masa madre, palta, huevo poché y semillas' },
      { id:'r6p09', type:'DISH',  name:'Pancakes de Blueberry',   price:24, desc:'Pancakes esponjosos con arándanos y maple' },
      { id:'r6p10', type:'DISH',  name:'Bowl de Açaí',            price:26, desc:'Açaí con granola, plátano y frutos rojos' },
      { id:'r6p11', type:'DISH',  name:'Croissant de Mantequilla',price:12, desc:'Croissant artesanal hojaldrado' },
      { id:'r6p12', type:'DISH',  name:'Cheesecake de Lúcuma',    price:18, desc:'Cheesecake cremoso con base de galleta' },
      { id:'r6p13', type:'DISH',  name:'Brownie Fudge',           price:14, desc:'Brownie de chocolate 70% con nueces' },
      { id:'r6p14', type:'DISH',  name:'Muffin de Arándanos',     price:10, desc:'Muffin esponjoso con arándanos frescos' },
      { id:'r6p15', type:'DISH',  name:'Tostada Francesa',        price:20, desc:'Pan brioche con huevo y canela, frutos rojos' },
      { id:'r6p16', type:'DISH',  name:'Quiche de Espinaca',      price:18, desc:'Quiche tibia con espinaca y queso feta' },
      { id:'r6p17', type:'DISH',  name:'Ensalada Caesar',         price:22, desc:'Lechuga romana, parmesano, crutones y aderezo' },
      { id:'r6p18', type:'DISH',  name:'Wrap de Pollo',           price:22, desc:'Tortilla con pollo, palta, tomate y lechuga' },
      { id:'r6p19', type:'COMBO', name:'Brunch Completo',         price:38, desc:'Avocado toast + bebida caliente + postre' },
      { id:'r6p20', type:'COMBO', name:'Café + Muffin',           price:20, desc:'Cualquier café + muffin del día' },
    ],
  },
  {
    ownerIdx: 6,
    ruc: '20100000007',
    name: 'La Heladería Arequipeña',
    category: 'heladeria',
    description: 'Helados artesanales de sabores peruanos. Lúcuma, maracuyá, chirimoya y más.',
    address: 'Av. Larco 1101', district: 'Miraflores',
    phone: '014456007', deliveryFee: 4, minOrderAmount: 15, estimatedTime: 15,
    products: [
      { id:'r7p01', type:'DISH',  name:'Helado Lúcuma 2 bochas',  price:12, desc:'Helado cremoso de lúcuma arequipeña' },
      { id:'r7p02', type:'DISH',  name:'Helado Maracuyá 2 bochas',price:12, desc:'Helado con trozos de maracuyá natural' },
      { id:'r7p03', type:'DISH',  name:'Helado Chirimoya 2 bochas',price:13, desc:'Chirimoya en helado artesanal' },
      { id:'r7p04', type:'DISH',  name:'Helado Chocolate Intenso',price:12, desc:'Chocolate 72% cacao con nueces' },
      { id:'r7p05', type:'DISH',  name:'Helado de Fresa Natural', price:11, desc:'Fresas frescas batidas sin artificial' },
      { id:'r7p06', type:'DISH',  name:'Sundae Clásico',          price:22, desc:'3 bochas con fudge, crema y cereza' },
      { id:'r7p07', type:'DISH',  name:'Banana Split',            price:28, desc:'Plátano, 3 bochas, 3 salsas y crema' },
      { id:'r7p08', type:'DISH',  name:'Copa Lúcuma Especial',    price:24, desc:'Lúcuma, manjar blanco y galleta oreo' },
      { id:'r7p09', type:'DISH',  name:'Waffles con Helado',      price:26, desc:'2 waffles con 2 bochas y frutos rojos' },
      { id:'r7p10', type:'DISH',  name:'Crêpe de Nutella',        price:20, desc:'Crêpe con nutella y helado de vainilla' },
      { id:'r7p11', type:'DISH',  name:'Picarones con Helado',    price:18, desc:'Picarones con miel y bola de canela' },
      { id:'r7p12', type:'DISH',  name:'Flotante de Lúcuma',      price:14, desc:'Inca Kola con bola de helado de lúcuma' },
      { id:'r7p13', type:'DRINK', name:'Batido de Fresa',         price:14, desc:'Leche, fresa y helado de fresa batido' },
      { id:'r7p14', type:'DRINK', name:'Batido de Lúcuma',        price:14, desc:'Leche, lúcuma y helado artesanal' },
      { id:'r7p15', type:'DRINK', name:'Malteada de Chocolate',   price:16, desc:'Chocolate, leche y helado intenso' },
      { id:'r7p16', type:'DRINK', name:'Limonada Granizada',      price:10, desc:'Limón raspadillo con sal y ají' },
      { id:'r7p17', type:'DRINK', name:'Chicha Morada Helada',    price:8,  desc:'Chicha con hielo y rodaja de naranja' },
      { id:'r7p18', type:'COMBO', name:'Combo Pareja Helados',    price:32, desc:'2 copas de 2 bochas + 2 batidos' },
      { id:'r7p19', type:'COMBO', name:'Combo Niños',             price:22, desc:'Copa pequeña + jugo natural + sorpresa' },
      { id:'r7p20', type:'DISH',  name:'Tarrina 500ml para llevar',price:28, desc:'Helado del sabor preferido para casa' },
    ],
  },
  {
    ownerIdx: 7,
    ruc: '20100000008',
    name: 'El Gran Buffet Criollo',
    category: 'buffet',
    description: 'Buffet de comida peruana. Más de 30 platos diarios, sopas y postres incluidos.',
    address: 'Av. Javier Prado Este 2190', district: 'San Borja',
    phone: '014456008', deliveryFee: 8, minOrderAmount: 30, estimatedTime: 30,
    products: [
      { id:'r8p01', type:'DISH',  name:'Caldo de Gallina',        price:18, desc:'Caldo concentrado de gallina con fideos y huevo' },
      { id:'r8p02', type:'DISH',  name:'Sopa a la Minuta',        price:16, desc:'Carne molida, fideos y leche' },
      { id:'r8p03', type:'DISH',  name:'Chupe de Camarones',      price:28, desc:'Sopa cremosa con camarones del río' },
      { id:'r8p04', type:'DISH',  name:'Aguadito de Pollo',       price:20, desc:'Arroz caldoso con pollo y culantro' },
      { id:'r8p05', type:'DISH',  name:'Sopa Criolla',            price:16, desc:'Fideos con res, pan y leche' },
      { id:'r8p06', type:'DISH',  name:'Lomo Saltado',            price:32, desc:'Lomo de res con arroz y papas' },
      { id:'r8p07', type:'DISH',  name:'Arroz con Pollo',         price:26, desc:'Arroz verde con pollo y salsa criolla' },
      { id:'r8p08', type:'DISH',  name:'Seco de Cordero',         price:36, desc:'Estofado de cordero con arroz y frejoles' },
      { id:'r8p09', type:'DISH',  name:'Estofado de Res',         price:28, desc:'Res guisada con papas y aceitunas' },
      { id:'r8p10', type:'DISH',  name:'Pepián de Tacacho',       price:24, desc:'Guiso de maíz tostado molido' },
      { id:'r8p11', type:'DISH',  name:'Causa a la Criolla',      price:18, desc:'Papa rellena con pollo y aceitunas' },
      { id:'r8p12', type:'DISH',  name:'Tacu Tacu con Lomo',      price:34, desc:'Frejoles y arroz apanados con lomo saltado' },
      { id:'r8p13', type:'DISH',  name:'Mazamorra Morada',        price:10, desc:'Postre de maíz morado con frutas' },
      { id:'r8p14', type:'DISH',  name:'Arroz con Leche',         price:10, desc:'Postre clásico con canela' },
      { id:'r8p15', type:'DISH',  name:'Flan de Vainilla',        price:10, desc:'Flan cremoso con caramelo' },
      { id:'r8p16', type:'DRINK', name:'Chicha Morada Jarra',     price:10, desc:'Jarra de 500ml para la mesa' },
      { id:'r8p17', type:'DRINK', name:'Limonada Clásica',        price:8,  desc:'Limón, agua y azúcar' },
      { id:'r8p18', type:'DRINK', name:'Emoliente Caliente',      price:6,  desc:'Infusión de hierbas medicinales' },
      { id:'r8p19', type:'COMBO', name:'Menú Diario Completo',    price:35, desc:'Sopa + fondo + postre + bebida' },
      { id:'r8p20', type:'COMBO', name:'Menú Ejecutivo',          price:28, desc:'Fondo + postre + refresco' },
    ],
  },
  {
    ownerIdx: 8,
    ruc: '20100000009',
    name: 'Sushi Ito Lima',
    category: 'otro',
    description: 'Sushi japonés auténtico preparado por chef japonés radicado en Lima.',
    address: 'Calle Chinchón 980', district: 'San Isidro',
    phone: '014456009', deliveryFee: 8, minOrderAmount: 45, estimatedTime: 35,
    products: [
      { id:'r9p01', type:'DISH',  name:'Sashimi de Salmón x8',   price:42, desc:'Láminas de salmón fresco con jengibre y wasabi' },
      { id:'r9p02', type:'DISH',  name:'Sashimi de Atún x8',     price:48, desc:'Atún rojo importado cortado al momento' },
      { id:'r9p03', type:'DISH',  name:'Nigiri Mixto x10',       price:52, desc:'10 piezas: salmón, atún, langostino y calamar' },
      { id:'r9p04', type:'DISH',  name:'Roll Philadelphia',      price:36, desc:'Salmón, queso crema y pepino' },
      { id:'r9p05', type:'DISH',  name:'Roll Spicy Tuna',        price:38, desc:'Atún con sriracha y aceite de sésamo' },
      { id:'r9p06', type:'DISH',  name:'Roll Dragon',            price:44, desc:'Langostino tempura con aguacate encima' },
      { id:'r9p07', type:'DISH',  name:'Roll Rainbow',           price:46, desc:'Roll californiano cubierto con surtido de fish' },
      { id:'r9p08', type:'DISH',  name:'Edamame Salado',         price:12, desc:'Edamame hervido con sal gruesa marina' },
      { id:'r9p09', type:'DISH',  name:'Gyoza de Cerdo x6',      price:22, desc:'Gyozas a la plancha con ponzu' },
      { id:'r9p10', type:'DISH',  name:'Takoyaki x6',            price:24, desc:'Bolas de pulpo con mayonesa y katsuobushi' },
      { id:'r9p11', type:'DISH',  name:'Sopa Miso Tradicional',  price:14, desc:'Tofu, wakame y cebollín' },
      { id:'r9p12', type:'DISH',  name:'Ramen Shoyu',            price:38, desc:'Caldo de pollo, char siu, huevo y bambú' },
      { id:'r9p13', type:'DISH',  name:'Udon Yaki',              price:32, desc:'Udon salteado con verduras y pollo teriyaki' },
      { id:'r9p14', type:'DISH',  name:'Tempura de Langostinos', price:34, desc:'4 langostinos en tempura con tentsuyu' },
      { id:'r9p15', type:'DRINK', name:'Sake Caliente Tokuri',   price:32, desc:'Sake caliente japonés en cerámica' },
      { id:'r9p16', type:'DRINK', name:'Cerveza Asahi 330ml',    price:14, desc:'Cerveza japonesa bien fría' },
      { id:'r9p17', type:'DRINK', name:'Té Verde Sencha',        price:8,  desc:'Té verde japonés en tetera' },
      { id:'r9p18', type:'DRINK', name:'Agua Mineral',           price:5,  desc:'San Pellegrino 500ml' },
      { id:'r9p19', type:'COMBO', name:'Menú Ejecutivo Sushi',   price:65, desc:'Nigiri x6 + roll + sopa miso + bebida' },
      { id:'r9p20', type:'DISH',  name:'Mochi Helado x3',        price:18, desc:'Mochi de matcha, fresa y vainilla' },
    ],
  },
  {
    ownerIdx: 9,
    ruc: '20100000010',
    name: 'Pollería El Dorado',
    category: 'otro',
    description: 'El mejor pollo a la brasa de La Molina. Más de 20 años de tradición familiar.',
    address: 'Av. La Fontana 790', district: 'La Molina',
    phone: '014456010', deliveryFee: 5, minOrderAmount: 20, estimatedTime: 30,
    products: [
      { id:'r10p01', type:'DISH',  name:'Pollo Entero',           price:52, desc:'Pollo a la brasa con 2 papas y 2 cremas' },
      { id:'r10p02', type:'DISH',  name:'1/2 Pollo',              price:28, desc:'Media pieza con papas y ensalada' },
      { id:'r10p03', type:'DISH',  name:'1/4 Pollo Pecho',        price:16, desc:'Cuarto de pecho con papas' },
      { id:'r10p04', type:'DISH',  name:'1/4 Pollo Pierna',       price:15, desc:'Cuarto de pierna con papas' },
      { id:'r10p05', type:'DISH',  name:'Pollo a la Plancha',     price:24, desc:'Pechuga a la plancha con ensalada y arroz' },
      { id:'r10p06', type:'DISH',  name:'Brocheta de Pollo',      price:18, desc:'Brocheta marinada al carbón con papas' },
      { id:'r10p07', type:'DISH',  name:'Alitas BBQ x8',          price:26, desc:'8 alitas bañadas en salsa BBQ casera' },
      { id:'r10p08', type:'DISH',  name:'Papas Fritas Medianas',  price:10, desc:'Papas cortadas a mano doradas' },
      { id:'r10p09', type:'DISH',  name:'Papas Fritas Grandes',   price:14, desc:'Porción grande de papas doradas' },
      { id:'r10p10', type:'DISH',  name:'Yucas Fritas',           price:10, desc:'Yuca dorada con cremas' },
      { id:'r10p11', type:'DISH',  name:'Ensalada Verde',         price:10, desc:'Lechuga, tomate y pepino con vinagreta' },
      { id:'r10p12', type:'DISH',  name:'Crema Huancaína Extra',  price:5,  desc:'Porción extra de salsa huancaína' },
      { id:'r10p13', type:'DISH',  name:'Mazamorra con Arroz con Leche', price:12, desc:'Combo clásico de postres peruanos' },
      { id:'r10p14', type:'DRINK', name:'Inca Kola 1.5L',         price:9,  desc:'Para compartir' },
      { id:'r10p15', type:'DRINK', name:'Coca-Cola 1.5L',         price:9,  desc:'Para compartir' },
      { id:'r10p16', type:'DRINK', name:'Chicha Morada Jarra',    price:10, desc:'1 litro de chicha morada' },
      { id:'r10p17', type:'DRINK', name:'Agua Mineral 625ml',     price:4,  desc:null },
      { id:'r10p18', type:'COMBO', name:'Combo Familiar 6',       price:85, desc:'Pollo entero + 3 papas + 1.5L de bebida' },
      { id:'r10p19', type:'COMBO', name:'Combo Personal',         price:28, desc:'1/4 pollo + papas + bebida personal' },
      { id:'r10p20', type:'COMBO', name:'Combo Pareja',           price:52, desc:'1/2 pollo + 2 papas + 2 bebidas personales' },
    ],
  },
  {
    ownerIdx: 10,
    ruc: '20100000011',
    name: 'Cevichería El Ancla',
    category: 'cevicheria',
    description: 'Mariscos y ceviches del día. Pescado directo de la caleta de Chorrillos.',
    address: 'Malecón Grau 102', district: 'Chorrillos',
    phone: '014456011', deliveryFee: 6, minOrderAmount: 30, estimatedTime: 35,
    products: [
      { id:'r11p01', type:'DISH',  name:'Ceviche de Pescado',     price:32, desc:'Pescado fresco, limón, ají limo y choclo' },
      { id:'r11p02', type:'DISH',  name:'Ceviche Mixto',         price:42, desc:'Pescado, calamar, langostino y pulpo' },
      { id:'r11p03', type:'DISH',  name:'Parihuela',             price:45, desc:'Caldo marino con mariscos y ají panca' },
      { id:'r11p04', type:'DISH',  name:'Sudado de Corvina',     price:48, desc:'Corvina sudada con tomate y cebolla' },
      { id:'r11p05', type:'DISH',  name:'Arroz con Mariscos',    price:38, desc:'Arroz verde con camarones y mariscos' },
      { id:'r11p06', type:'DISH',  name:'Jalea Mixta',           price:40, desc:'Mariscos fritos con yuca y salsa criolla' },
      { id:'r11p07', type:'DISH',  name:'Choros a la Chalaca',   price:24, desc:'Choros frescos con salsa criolla y limón' },
      { id:'r11p08', type:'DISH',  name:'Pulpo al Ajillo',       price:46, desc:'Pulpo saltado con ajo, aceite de oliva y papas' },
      { id:'r11p09', type:'DISH',  name:'Chicharrón de Pescado', price:28, desc:'Filetes fritos con yuca y salsa de rocoto' },
      { id:'r11p10', type:'DISH',  name:'Tiradito de Lenguado',  price:36, desc:'Lenguado en leche de tigre con ají amarillo' },
      { id:'r11p11', type:'DISH',  name:'Ceviche Carretillero',  price:28, desc:'Ceviche rápido con aguachile picante' },
      { id:'r11p12', type:'DISH',  name:'Tortilla de Raya',      price:22, desc:'Tortilla de raya ahumada con papas' },
      { id:'r11p13', type:'DRINK', name:'Leche de Tigre',        price:12, desc:'Licuado de ceviche con mariscos' },
      { id:'r11p14', type:'DRINK', name:'Chicha Morada',         price:8,  desc:'Natural de la casa' },
      { id:'r11p15', type:'DRINK', name:'Maracuyá con Soda',     price:10, desc:'Maracuyá natural con agua con gas' },
      { id:'r11p16', type:'DRINK', name:'Cerveza Cristal 620ml', price:10, desc:'Bien fría' },
      { id:'r11p17', type:'DRINK', name:'Agua Mineral',          price:4,  desc:'625ml' },
      { id:'r11p18', type:'COMBO', name:'Combo Ancla Pareja',    price:82, desc:'2 ceviches + leche de tigre + 2 bebidas' },
      { id:'r11p19', type:'COMBO', name:'Tabla Mariscos x2',     price:88, desc:'Parihuela + jalea + 2 bebidas' },
      { id:'r11p20', type:'DISH',  name:'Suspiro de Limeña',     price:12, desc:'Postre peruano de manjar con merengue' },
    ],
  },
  {
    ownerIdx: 11,
    ruc: '20100000012',
    name: 'La Anticuchería Doña Rosa',
    category: 'otro',
    description: 'Anticuchos y piqueos al carbón. Tradición desde 1978 en el Cercado de Lima.',
    address: 'Jr. Huáscar 456', district: 'Cercado de Lima',
    phone: '014456012', deliveryFee: 4, minOrderAmount: 20, estimatedTime: 25,
    products: [
      { id:'r12p01', type:'DISH',  name:'Anticucho de Corazón x3',price:18, desc:'3 brochetas de corazón de res al carbón' },
      { id:'r12p02', type:'DISH',  name:'Anticucho de Pollo x3',  price:16, desc:'3 brochetas de pollo marinado' },
      { id:'r12p03', type:'DISH',  name:'Anticucho Mixto x4',     price:22, desc:'2 corazón + 2 pollo con papas y choclo' },
      { id:'r12p04', type:'DISH',  name:'Choncholí',              price:18, desc:'Intestino de res al carbón con salsa criolla' },
      { id:'r12p05', type:'DISH',  name:'Rachi',                  price:16, desc:'Mondongo de res al carbón con papas' },
      { id:'r12p06', type:'DISH',  name:'Pierna de Pollo al Carbón',price:20, desc:'Pierna entera marinada al carbón' },
      { id:'r12p07', type:'DISH',  name:'Morcilla a la Parrilla', price:14, desc:'Morcilla criolla con papas doradas' },
      { id:'r12p08', type:'DISH',  name:'Papas al Huancaína',     price:12, desc:'Papa sancochada con salsa huancaína' },
      { id:'r12p09', type:'DISH',  name:'Choclo con Queso',       price:10, desc:'Choclo desgranado con queso fresco' },
      { id:'r12p10', type:'DISH',  name:'Yuca Sancochada',        price:8,  desc:'Yuca tierna con cremas' },
      { id:'r12p11', type:'DISH',  name:'Porción de Papas Fritas',price:8,  desc:'Papas fritas doradas' },
      { id:'r12p12', type:'DISH',  name:'Caldo de Huesos',        price:10, desc:'Caldo reconfortante de hueso de res' },
      { id:'r12p13', type:'DRINK', name:'Chicha de Jora',         price:6,  desc:'Artesanal del día' },
      { id:'r12p14', type:'DRINK', name:'Inca Kola 500ml',        price:5,  desc:null },
      { id:'r12p15', type:'DRINK', name:'Cerveza Pilsen 620ml',   price:10, desc:'Bien fría' },
      { id:'r12p16', type:'DRINK', name:'Agua Pura 625ml',        price:3,  desc:null },
      { id:'r12p17', type:'DRINK', name:'Limonada Natural',       price:7,  desc:'Limón sutil con azúcar y hielo' },
      { id:'r12p18', type:'COMBO', name:'Combo Anticuchero',      price:32, desc:'Anticucho mixto + papas + bebida' },
      { id:'r12p19', type:'COMBO', name:'Combo Familiar x4',      price:75, desc:'4 anticuchos + yuca + choclo + 4 bebidas' },
      { id:'r12p20', type:'DISH',  name:'Picarones al Carbón',    price:10, desc:'Picarones de zapallo con miel de chancaca' },
    ],
  },
  {
    ownerIdx: 12,
    ruc: '20100000013',
    name: 'Chifa Nueva Cantón',
    category: 'chifa',
    description: 'Cocina chino-peruana auténtica en San Juan de Miraflores. Familiar y económico.',
    address: 'Av. San Juan 860', district: 'San Juan de Miraflores',
    phone: '014456013', deliveryFee: 5, minOrderAmount: 22, estimatedTime: 30,
    products: [
      { id:'r13p01', type:'DISH',  name:'Chaufa de Pollo',        price:22, desc:'Arroz chaufa con pollo y huevo revuelto' },
      { id:'r13p02', type:'DISH',  name:'Chaufa Especial',        price:28, desc:'Pollo, res, cerdo, mariscos y huevo' },
      { id:'r13p03', type:'DISH',  name:'Lomo Saltado Estilo Chifa',price:30, desc:'Lomo con salsa de ostión y soya' },
      { id:'r13p04', type:'DISH',  name:'Pollo con Piña',         price:24, desc:'Pollo agridulce con piña y verduras' },
      { id:'r13p05', type:'DISH',  name:'Carne con Hongos',       price:28, desc:'Res salteada con hongos chinos' },
      { id:'r13p06', type:'DISH',  name:'Cau Cau Chifa',          price:24, desc:'Mondongo salteado al estilo chino' },
      { id:'r13p07', type:'DISH',  name:'Sopa Wantán Grande',     price:16, desc:'Caldo con 8 wantanes y verduras' },
      { id:'r13p08', type:'DISH',  name:'Sopa de Pollo con Fideos',price:14, desc:'Caldo suave con pollo y fideos chinos' },
      { id:'r13p09', type:'DISH',  name:'Tallarín Saltado de Mariscos', price:30, desc:'Fideos chinos con langostinos y calamar' },
      { id:'r13p10', type:'DISH',  name:'Pato al Horno Cantonés', price:36, desc:'Pato glaseado con cinco especias' },
      { id:'r13p11', type:'DISH',  name:'Cerdo Agridulce',        price:26, desc:'Cerdo frito con salsa agridulce casera' },
      { id:'r13p12', type:'DISH',  name:'Enrollado de Primavera x4',price:18, desc:'4 rollitos de verduras fritos' },
      { id:'r13p13', type:'DISH',  name:'Arroz Frito Vegetariano',price:20, desc:'Arroz con verduras mixtas sin carne' },
      { id:'r13p14', type:'DISH',  name:'Tofu Salteado',          price:18, desc:'Tofu firme con salsa de soya y jengibre' },
      { id:'r13p15', type:'DRINK', name:'Té Chino de Jazmín',     price:6,  desc:'En tetera para 2 personas' },
      { id:'r13p16', type:'DRINK', name:'Limonada con Jengibre',  price:8,  desc:'Limón y jengibre fresco' },
      { id:'r13p17', type:'DRINK', name:'Inca Kola 500ml',        price:5,  desc:null },
      { id:'r13p18', type:'DRINK', name:'Agua Mineral',           price:4,  desc:null },
      { id:'r13p19', type:'COMBO', name:'Menú Chifa del Día',     price:28, desc:'Sopa + chaufa + bebida' },
      { id:'r13p20', type:'COMBO', name:'Combo Chifa Familiar',   price:75, desc:'Chaufa especial + 2 platos + 4 bebidas' },
    ],
  },
  {
    ownerIdx: 13,
    ruc: '20100000014',
    name: 'Sandwichería El Buen Gusto',
    category: 'fast_food',
    description: 'Sánguches limeños de autor. Butifarra, chicharrón y lomito desde 1995.',
    address: 'Av. Túpac Amaru 1456', district: 'Los Olivos',
    phone: '014456014', deliveryFee: 4, minOrderAmount: 15, estimatedTime: 20,
    products: [
      { id:'r14p01', type:'DISH',  name:'Butifarra Clásica',      price:16, desc:'Jamón del país, cebolla, ají y salsa criolla' },
      { id:'r14p02', type:'DISH',  name:'Sánguche de Chicharrón', price:18, desc:'Chicharrón de cerdo crujiente con camote frito' },
      { id:'r14p03', type:'DISH',  name:'Lomito Saltado Sánguche',price:22, desc:'Lomo saltado servido en pan de molde' },
      { id:'r14p04', type:'DISH',  name:'Club Sánguche',          price:20, desc:'Pollo, tocino, queso y ensalada en 3 capas' },
      { id:'r14p05', type:'DISH',  name:'Sánguche Mixto',         price:18, desc:'Jamón, queso y huevo frito' },
      { id:'r14p06', type:'DISH',  name:'Pan con Pejerrey',       price:14, desc:'Pejerrey frito con salsa criolla' },
      { id:'r14p07', type:'DISH',  name:'Empanada de Carne',      price:8,  desc:'Empanada horneada rellena de carne molida' },
      { id:'r14p08', type:'DISH',  name:'Empanada de Queso',      price:7,  desc:'Empanada de queso y aceituna' },
      { id:'r14p09', type:'DISH',  name:'Papa Rellena',           price:10, desc:'Papa frita rellena de carne y huevo duro' },
      { id:'r14p10', type:'DISH',  name:'Tequeños x5',            price:12, desc:'5 tequeños de queso crujientes' },
      { id:'r14p11', type:'DISH',  name:'Picarones x4',           price:10, desc:'4 picarones con miel de chancaca' },
      { id:'r14p12', type:'DISH',  name:'Porción de Papas Fritas',price:8,  desc:'Papas fritas con ketchup' },
      { id:'r14p13', type:'DRINK', name:'Chicha Morada Vaso',     price:5,  desc:'Vaso grande de chicha morada' },
      { id:'r14p14', type:'DRINK', name:'Maracuyá Natural',       price:6,  desc:'Jugo de maracuyá con azúcar' },
      { id:'r14p15', type:'DRINK', name:'Emoliente',              price:4,  desc:'Infusión de hierbas caliente' },
      { id:'r14p16', type:'DRINK', name:'Inca Kola 500ml',        price:5,  desc:null },
      { id:'r14p17', type:'DRINK', name:'Agua Pura 625ml',        price:3,  desc:null },
      { id:'r14p18', type:'COMBO', name:'Combo Sánguche + Refresco', price:20, desc:'Sánguche a elegir + chicha o maracuyá' },
      { id:'r14p19', type:'COMBO', name:'Combo Desayuno',         price:16, desc:'Sánguche mixto + café o emoliente' },
      { id:'r14p20', type:'COMBO', name:'Combo Triple',           price:38, desc:'3 sánguches variados + 3 refrescos' },
    ],
  },
  {
    ownerIdx: 14,
    ruc: '20100000015',
    name: 'Quinoa & Roots',
    category: 'otro',
    description: 'Cocina saludable peruana. Superfoods, bowls nutritivos y jugos naturales.',
    address: 'Av. Conquistadores 1126', district: 'San Isidro',
    phone: '014456015', deliveryFee: 6, minOrderAmount: 28, estimatedTime: 25,
    products: [
      { id:'r15p01', type:'DISH',  name:'Bowl de Quinoa y Pollo',  price:32, desc:'Quinoa tricolor, pechuga, palta y tzatziki' },
      { id:'r15p02', type:'DISH',  name:'Bowl Vegano del Día',     price:28, desc:'Quinoa, garbanzos, espinaca y tahini' },
      { id:'r15p03', type:'DISH',  name:'Ensalada de Kiwicha',     price:26, desc:'Kiwicha, rúcula, nueces y vinagreta de mango' },
      { id:'r15p04', type:'DISH',  name:'Causa Fit de Palta',      price:24, desc:'Papa con palta, atún y quinoa sofrita' },
      { id:'r15p05', type:'DISH',  name:'Lomo Saltado Saludable',  price:36, desc:'Lomo magro, arroz integral y verduras al wok' },
      { id:'r15p06', type:'DISH',  name:'Tortilla de Quinoa',      price:22, desc:'Tortilla de quinoa, espinaca y queso' },
      { id:'r15p07', type:'DISH',  name:'Soup de Maca con Pollo',  price:24, desc:'Caldo reconstituyente con maca andina' },
      { id:'r15p08', type:'DISH',  name:'Ceviche Fit',             price:30, desc:'Pescado, camote, choclo y leche de tigre ligera' },
      { id:'r15p09', type:'DISH',  name:'Wraps de Lechuga',        price:22, desc:'Hojas de lechuga rellenas de quinoa y pollo' },
      { id:'r15p10', type:'DISH',  name:'Granola Bowl con Açaí',   price:26, desc:'Açaí, granola casera, chía y frutas' },
      { id:'r15p11', type:'DISH',  name:'Tostadas de Camote',      price:18, desc:'Camote asado con palta y huevo pochado' },
      { id:'r15p12', type:'DISH',  name:'Cheesecake de Tofu',      price:18, desc:'Postre vegano sin azúcar con coulis de fresa' },
      { id:'r15p13', type:'DRINK', name:'Jugo Verde Detox',        price:14, desc:'Espinaca, pepino, manzana y jengibre' },
      { id:'r15p14', type:'DRINK', name:'Smoothie de Lúcuma',      price:14, desc:'Lúcuma, plátano y leche de almendras' },
      { id:'r15p15', type:'DRINK', name:'Agua de Coco Natural',    price:10, desc:'Coco fresco del día' },
      { id:'r15p16', type:'DRINK', name:'Infusión de Muña',        price:6,  desc:'Hierba andina digestiva' },
      { id:'r15p17', type:'DRINK', name:'Kombucha de Maracuyá',    price:16, desc:'Fermentado natural con probióticos' },
      { id:'r15p18', type:'COMBO', name:'Menú Saludable Completo', price:42, desc:'Bowl + jugo verde + postre vegano' },
      { id:'r15p19', type:'COMBO', name:'Combo Detox x2',          price:68, desc:'2 bowls + 2 jugos verdes' },
      { id:'r15p20', type:'DISH',  name:'Mousse de Chocolate 70%', price:16, desc:'Sin azúcar refinada, con aguacate' },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────
//  DATOS DE REPARTIDORES — 7 distritos de Lima
// ──────────────────────────────────────────────────────────────────
const DISTRICTS_COORDS = {
  'Miraflores':       { lat: -12.1219, lng: -77.0297 },
  'San Isidro':       { lat: -12.1017, lng: -77.0418 },
  'Barranco':         { lat: -12.1448, lng: -77.0220 },
  'Surco':            { lat: -12.1538, lng: -76.9967 },
  'La Molina':        { lat: -12.0857, lng: -76.9440 },
  'Los Olivos':       { lat: -11.9967, lng: -77.0782 },
  'San Juan de Miraflores': { lat: -12.1588, lng: -76.9733 },
}

const VEHICLES = ['MOTORCYCLE','MOTORCYCLE','MOTORCYCLE','BICYCLE','CAR','ON_FOOT']

const DRIVERS = [
  // Miraflores (3)
  { idx:0,  name:'Carlos Ríos Mamani',    email:'driver01@test.com', phone:'998001001', district:'Miraflores',       vehicle:'MOTORCYCLE', plate:'M1A-001', dni:'70000001', verified:true  },
  { idx:1,  name:'Julio Quispe Ramos',    email:'driver02@test.com', phone:'998001002', district:'Miraflores',       vehicle:'BICYCLE',    plate:null,      dni:'70000002', verified:true  },
  { idx:2,  name:'Diego Flores Huanca',   email:'driver03@test.com', phone:'998001003', district:'Miraflores',       vehicle:'MOTORCYCLE', plate:'M1C-003', dni:'70000003', verified:false },
  // San Isidro (3)
  { idx:3,  name:'Andrés Mendoza Torres', email:'driver04@test.com', phone:'998001004', district:'San Isidro',       vehicle:'CAR',        plate:'ACD-404', dni:'70000004', verified:true  },
  { idx:4,  name:'Roberto Cárdenas Vega', email:'driver05@test.com', phone:'998001005', district:'San Isidro',       vehicle:'MOTORCYCLE', plate:'M2B-005', dni:'70000005', verified:true  },
  { idx:5,  name:'Sergio Palomino Cruz',  email:'driver06@test.com', phone:'998001006', district:'San Isidro',       vehicle:'MOTORCYCLE', plate:'M2C-006', dni:'70000006', verified:true  },
  // Barranco (2)
  { idx:6,  name:'Luis Tapia Salas',      email:'driver07@test.com', phone:'998001007', district:'Barranco',         vehicle:'BICYCLE',    plate:null,      dni:'70000007', verified:true  },
  { idx:7,  name:'Marco Soto Delgado',    email:'driver08@test.com', phone:'998001008', district:'Barranco',         vehicle:'MOTORCYCLE', plate:'M3B-008', dni:'70000008', verified:true  },
  // Surco (3)
  { idx:8,  name:'Fernando Ramos Deza',   email:'driver09@test.com', phone:'998001009', district:'Surco',            vehicle:'MOTORCYCLE', plate:'M4A-009', dni:'70000009', verified:true  },
  { idx:9,  name:'Erick Vargas Llanos',   email:'driver10@test.com', phone:'998001010', district:'Surco',            vehicle:'CAR',        plate:'BCD-010', dni:'70000010', verified:false },
  { idx:10, name:'Miguel Pizarro Chávez', email:'driver11@test.com', phone:'998001011', district:'Surco',            vehicle:'MOTORCYCLE', plate:'M4C-011', dni:'70000011', verified:true  },
  // La Molina (3)
  { idx:11, name:'Óscar Medina Alva',     email:'driver12@test.com', phone:'998001012', district:'La Molina',        vehicle:'CAR',        plate:'LCD-012', dni:'70000012', verified:true  },
  { idx:12, name:'Iván Paredes Bernal',   email:'driver13@test.com', phone:'998001013', district:'La Molina',        vehicle:'MOTORCYCLE', plate:'M5B-013', dni:'70000013', verified:true  },
  { idx:13, name:'César Huanca Aquino',   email:'driver14@test.com', phone:'998001014', district:'La Molina',        vehicle:'BICYCLE',    plate:null,      dni:'70000014', verified:false },
  // Los Olivos (3)
  { idx:14, name:'Alex Gutierrez Neira',  email:'driver15@test.com', phone:'998001015', district:'Los Olivos',       vehicle:'MOTORCYCLE', plate:'M6A-015', dni:'70000015', verified:true  },
  { idx:15, name:'Percy Silva Rojas',     email:'driver16@test.com', phone:'998001016', district:'Los Olivos',       vehicle:'MOTORCYCLE', plate:'M6B-016', dni:'70000016', verified:true  },
  { idx:16, name:'Edson Tello Carrasco',  email:'driver17@test.com', phone:'998001017', district:'Los Olivos',       vehicle:'ON_FOOT',    plate:null,      dni:'70000017', verified:true  },
  // San Juan de Miraflores (3)
  { idx:17, name:'Alan Ccori Mamani',     email:'driver18@test.com', phone:'998001018', district:'San Juan de Miraflores', vehicle:'MOTORCYCLE', plate:'M7A-018', dni:'70000018', verified:true  },
  { idx:18, name:'Renato Aliaga Ponce',   email:'driver19@test.com', phone:'998001019', district:'San Juan de Miraflores', vehicle:'BICYCLE',    plate:null,      dni:'70000019', verified:true  },
  { idx:19, name:'Bruno Ccorahua Lazo',   email:'driver20@test.com', phone:'998001020', district:'San Juan de Miraflores', vehicle:'MOTORCYCLE', plate:'M7C-020', dni:'70000020', verified:false },
]

// ──────────────────────────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seed Full — 15 restaurantes + 20 repartidores\n')

  // ── 1. Crear dueños de restaurante ──────────────────────────────
  console.log('👤 Creando dueños de restaurante...')
  const owners = []
  for (let i = 0; i < RESTAURANTS.length; i++) {
    const r = RESTAURANTS[i]
    const owner = await upsertUser(`auth0|owner-full-${i}`, {
      email:  `owner${i+1}@foodinka-seed.com`,
      name:   `Dueño ${r.name}`,
      phone:  r.phone,
      role:   'RESTAURANT_OWNER',
    })
    owners.push(owner)
  }
  console.log(`   ✅ ${owners.length} dueños creados\n`)

  // ── 2. Crear restaurantes + productos ───────────────────────────
  console.log('🍽️  Creando restaurantes y productos...')
  for (const r of RESTAURANTS) {
    const owner  = owners[r.ownerIdx]
    const banner = BANNERS[r.category] || BANNERS.otro

    const rest = await upsertRestaurant(r.ruc, {
      name:                r.name,
      description:         r.description,
      category:            r.category,
      bannerUrl:           banner,
      address:             r.address,
      district:            r.district,
      phone:               r.phone,
      status:              'ACTIVE',
      isDeliveryEnabled:   true,
      isReservationEnabled:true,
      deliveryFee:         r.deliveryFee,
      minOrderAmount:      r.minOrderAmount || 20,
      estimatedTime:       r.estimatedTime,
      ownerId:             owner.id,
      commissionRate:      0.08,
      openingHours: {
        lun:'11:00-22:00', mar:'11:00-22:00', mie:'11:00-22:00',
        jue:'11:00-22:00', vie:'11:00-23:00', sab:'10:00-23:00', dom:'10:00-21:00',
      },
    })

    // Categorías por defecto
    const catPlatos = await upsertCat(`${rest.id}-platos`, { name:'Platos', order:1, restaurantId: rest.id })
    const catBebidas= await upsertCat(`${rest.id}-bebidas`,{ name:'Bebidas',order:2, restaurantId: rest.id })
    const catCombos = await upsertCat(`${rest.id}-combos`, { name:'Combos', order:3, restaurantId: rest.id })

    const catMap = { DISH: catPlatos.id, DRINK: catBebidas.id, COMBO: catCombos.id }

    for (const p of r.products) {
      await upsertProduct(p.id, {
        name:         p.name,
        description:  p.desc,
        type:         p.type,
        price:        p.price,
        isAvailable:  true,
        restaurantId: rest.id,
        categoryId:   catMap[p.type],
      })
    }

    console.log(`   ✅ ${rest.name} (${r.district}) — ${r.products.length} productos`)
  }

  // ── 3. Crear repartidores ────────────────────────────────────────
  console.log('\n🏍️  Creando repartidores...')
  for (const d of DRIVERS) {
    const coords = DISTRICTS_COORDS[d.district] || DISTRICTS_COORDS['Miraflores']

    const user = await upsertUser(`auth0|driver-full-${d.idx}`, {
      email: d.email,
      name:  d.name,
      phone: d.phone,
      role:  'DELIVERY',
    })

    await upsertDriver(user.id, {
      status:            d.verified ? 'AVAILABLE' : 'OFFLINE',
      vehicleType:       d.vehicle,
      licensePlate:      d.plate,
      dni:               d.dni,
      isVerified:        d.verified,
      currentLatitude:   coords.lat + (Math.random() - 0.5) * 0.02,
      currentLongitude:  coords.lng + (Math.random() - 0.5) * 0.02,
      lastLocationAt:    new Date(),
    })

    console.log(`   ✅ ${d.name} — ${d.district} (${d.vehicle})`)
  }

  // ── Resumen ──────────────────────────────────────────────────────
  const totalProducts = RESTAURANTS.reduce((s, r) => s + r.products.length, 0)
  console.log('\n' + '─'.repeat(56))
  console.log(`🎉 Seed completado:`)
  console.log(`   • ${RESTAURANTS.length} restaurantes activos`)
  console.log(`   • ${totalProducts} productos en total (${totalProducts/RESTAURANTS.length} por restaurante)`)
  console.log(`   • ${DRIVERS.length} repartidores en 7 distritos de Lima`)
  console.log('─'.repeat(56))
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())