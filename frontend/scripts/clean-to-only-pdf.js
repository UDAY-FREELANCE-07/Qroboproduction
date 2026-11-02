const fs = require('fs');
const path = require('path');

console.log('1. Cleaning frontend/lib/mock-data.ts to ONLY contain PDF components...');
let mockData = fs.readFileSync('frontend/lib/mock-data.ts', 'utf8').replace(/\r\n/g, '\n');

// Update mockDeals to reference valid PDF product IDs
const oldDealsRegex = /export const mockDeals: any\[\] = \[[\s\S]*?\];/;
const newDeals = `export const mockDeals: any[] = [
  {
    product_id: 'prod-14-1',
    title: 'Arduino Uno R3 Special Offer',
    description: '20% off the standard Arduino Uno R3 development board',
    discount_percentage: 20.0,
    sale_price: 432.0,
    original_price: 540.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-1'
  },
  {
    product_id: 'prod-14-9',
    title: 'ESP32 DevKit Flash Sale',
    description: '25% off ESP32 dual-core WiFi+Bluetooth development board',
    discount_percentage: 25.0,
    sale_price: 285.0,
    original_price: 380.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-2'
  },
  {
    product_id: 'prod-17-1',
    title: 'HC-SR04 Sensor Deal',
    description: '30% off HC-SR04 ultrasonic distance measuring sensor',
    discount_percentage: 30.0,
    sale_price: 133.0,
    original_price: 190.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-3'
  },
  {
    product_id: 'prod-25-1',
    title: 'SG90 Micro Servo Deal',
    description: '20% off SG90 9g micro servo motor for robotics',
    discount_percentage: 20.0,
    sale_price: 120.0,
    original_price: 150.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-4'
  },
  {
    product_id: 'prod-23-6',
    title: '0.96 inch OLED Display Sale',
    description: '15% off I2C 128x64 monochrome OLED display module',
    discount_percentage: 15.0,
    sale_price: 221.0,
    original_price: 260.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-5'
  },
  {
    product_id: 'prod-43-1',
    title: '2WD Robot Platform Deal',
    description: '18% off complete 2WD smart car robot chassis kit',
    discount_percentage: 18.0,
    sale_price: 984.0,
    original_price: 1200.0,
    starts_at: '2026-10-23T10:00:00Z',
    ends_at: '2026-11-23T10:00:00Z',
    is_active: true,
    id: 'deal-6'
  }
];`;

mockData = mockData.replace(oldDealsRegex, newDeals);

// Update mockDataMap to ONLY reference PDF categories and PDF products
const oldMapRegex = /export const mockDataMap: Record<string, any\[\]> = \{[\s\S]*?\};/;
const newMap = `export const mockDataMap: Record<string, any[]> = {
  categories: pdfCategories,
  brands: mockBrands,
  products: pdfProducts,
  banners: mockBanners,
  promo_cards: mockPromoCards,
  deals: mockDeals,
  coupons: mockCoupons,
  projects: mockProjects,
  tutorials: mockTutorials,
};`;

mockData = mockData.replace(oldMapRegex, newMap);
fs.writeFileSync('frontend/lib/mock-data.ts', mockData, 'utf8');
console.log('-> frontend/lib/mock-data.ts now has ONLY PDF categories and products.');

// 2. Cleaning frontend/lib/admin/admin-mock-data.ts
console.log('2. Cleaning frontend/lib/admin/admin-mock-data.ts...');
let amd = fs.readFileSync('frontend/lib/admin/admin-mock-data.ts', 'utf8').replace(/\r\n/g, '\n');

// Replace initialCategories to ONLY be pdfAdminCategories
const oldInitCats = /export const initialCategories: AdminCategory\[\] = \[[\s\S]*?\];/;
amd = amd.replace(oldInitCats, 'export const initialCategories: AdminCategory[] = pdfAdminCategories;');

// Replace initialProducts to ONLY be pdfAdminProducts
const oldInitProds = /export const initialProducts: AdminProduct\[\] = \[[\s\S]*?\];/;
amd = amd.replace(oldInitProds, 'export const initialProducts: AdminProduct[] = pdfAdminProducts;');

fs.writeFileSync('frontend/lib/admin/admin-mock-data.ts', amd, 'utf8');
console.log('-> frontend/lib/admin/admin-mock-data.ts now has ONLY pdfAdminCategories & pdfAdminProducts.');

// 3. Updating frontend/lib/admin/admin-service.ts
console.log('3. Updating frontend/lib/admin/admin-service.ts...');
let as = fs.readFileSync('frontend/lib/admin/admin-service.ts', 'utf8').replace(/\r\n/g, '\n');

// Replace v2/v3 storage keys with v4 so fresh pure-PDF data is forced into localStorage
as = as.replaceAll("'admin_products_v2'", "'admin_products_v4'");
as = as.replaceAll("'admin_categories_v2'", "'admin_categories_v4'");
as = as.replaceAll("'admin_products'", "'admin_products_v4'");
as = as.replaceAll("'admin_categories'", "'admin_categories_v4'");

const oldInitPattern = /let products = getStorage[\s\S]*?let categories = getStorage[\s\S]*?}/;
const newInitPattern = `let products = getStorage<AdminProduct[]>('admin_products_v4', initialProducts);
if (!products || products.length !== initialProducts.length) {
  products = initialProducts;
  setStorage('admin_products_v4', products);
}

let categories = getStorage<AdminCategory[]>('admin_categories_v4', initialCategories);
if (!categories || categories.length !== initialCategories.length) {
  categories = initialCategories;
  setStorage('admin_categories_v4', categories);
}`;

as = as.replace(oldInitPattern, newInitPattern);
fs.writeFileSync('frontend/lib/admin/admin-service.ts', as, 'utf8');
console.log('-> frontend/lib/admin/admin-service.ts updated with v4 storage.');

// 4. Updating navbar.tsx categories list with PDF categories
console.log('4. Updating frontend/components/layout/navbar.tsx...');
let nav = fs.readFileSync('frontend/components/layout/navbar.tsx', 'utf8').replace(/\r\n/g, '\n');

const oldNavCatsRegex = /const categories = \[[\s\S]*?\];/;
const newNavCats = `const categories = [
  { label: 'Development Boards & Shields', value: 'development-boards-and-shields' },
  { label: 'Sensors (Temp, Humidity & Pressure)', value: 'sensors-temperature-humidity-and-pressure' },
  { label: 'Sensors (Motion & Orientation)', value: 'sensors-motion-and-orientation' },
  { label: 'Sensors (Distance & Ultrasonic)', value: 'sensors-distance' },
  { label: 'Resistors & Variable Resistors', value: 'resistors-and-variable-resistors' },
  { label: 'Capacitors', value: 'capacitors' },
  { label: 'Diodes & Rectifiers', value: 'diodes-and-rectifiers' },
  { label: 'LEDs & Optoelectronics', value: 'leds-and-optoelectronics' },
  { label: 'Transistors', value: 'transistors' },
  { label: 'MOSFETs, IGBT & JFET', value: 'mosfets-igbt-jfet-and-ujt' },
  { label: 'Voltage Regulators', value: 'voltage-regulators' },
  { label: 'Op-Amps & Timers', value: 'op-amps-comparators-timers-and-audio-amplifiers' },
  { label: 'Digital Logic ICs (74xx)', value: 'digital-logic-ics-74xx' },
  { label: 'CMOS ICs (CD4000)', value: 'cmos-ics-cd4000' },
  { label: 'Motor Drivers & Special ICs', value: 'motor-drivers-and-special-purpose-ics' },
  { label: 'Microcontroller Chips', value: 'microcontroller-chips' },
  { label: 'Displays (LCD, OLED, TFT)', value: 'displays' },
  { label: 'Communication & Wireless', value: 'communication-modules' },
  { label: 'Motors, Actuators & Servos', value: 'motors-actuators-and-sound' },
  { label: 'Relays & Switches', value: 'relays-switches-and-input-devices' },
  { label: 'Power Modules & Converters', value: 'power-modules' },
  { label: 'Batteries & Cells', value: 'batteries' },
  { label: 'IoT Boards & Gateways', value: 'iot-boards-and-gateways' },
  { label: 'Robot Chassis & Kits', value: 'robot-chassis-and-platform-kits' },
  { label: 'DIY Project Kits', value: 'diy-and-educational-project-kits' },
  { label: 'Tools & Consumables', value: 'tools-and-consumables' },
];`;

nav = nav.replace(oldNavCatsRegex, newNavCats);
fs.writeFileSync('frontend/components/layout/navbar.tsx', nav, 'utf8');
console.log('-> navbar.tsx categories updated to PDF categories.');

// 5. Updating home page (frontend/app/page.tsx) category queries
console.log('5. Updating frontend/app/page.tsx...');
let home = fs.readFileSync('frontend/app/page.tsx', 'utf8').replace(/\r\n/g, '\n');

// Replace category queries
const oldQueries = `        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'robotics-kits').maybeSingle()).data?.id, (await dataClient.from('categories').select('id').eq('slug', 'robotics').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'development-boards').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'sensors').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'arduino').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', '3d-printing').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'diy-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'student-project-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),`;

const newQueries = `        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'robot-chassis-and-platform-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'development-boards-and-shields').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'sensors-temperature-humidity-and-pressure').maybeSingle()).data?.id, (await dataClient.from('categories').select('id').eq('slug', 'sensors-distance').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'microcontroller-chips').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'power-modules').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'diy-and-educational-project-kits').maybeSingle()).data?.id].filter(Boolean)).limit(6),
        dataClient.from('products').select('*').eq('is_published', true).in('category_id', [(await dataClient.from('categories').select('id').eq('slug', 'motors-actuators-and-sound').maybeSingle()).data?.id].filter(Boolean)).limit(6),`;

if (home.includes(oldQueries)) {
  home = home.replace(oldQueries, newQueries);
  fs.writeFileSync('frontend/app/page.tsx', home, 'utf8');
  console.log('-> page.tsx category queries updated.');
} else {
  console.log('-> page.tsx queries were already updated or did not match exact string.');
}

console.log('ALL UPDATES COMPLETE!');
