const fs = require('fs');

// 1. Update admin-mock-data.ts
let amd = fs.readFileSync('frontend/lib/admin/admin-mock-data.ts', 'utf8').replace(/\r\n/g, '\n');

if (!amd.includes("import { pdfAdminCategories, pdfAdminProducts } from './admin-pdf-data';")) {
  amd = "import { pdfAdminCategories, pdfAdminProducts } from './admin-pdf-data';\n" + amd;
}

amd = amd.replace(
  'export const initialCategories: AdminCategory[] = [',
  'export const initialCategories: AdminCategory[] = [\n  ...pdfAdminCategories,'
);

amd = amd.replace(
  'export const initialProducts: AdminProduct[] = [',
  'export const initialProducts: AdminProduct[] = [\n  ...pdfAdminProducts,'
);

fs.writeFileSync('frontend/lib/admin/admin-mock-data.ts', amd, 'utf8');
console.log('Updated admin-mock-data.ts');

// 2. Update admin-service.ts
let as = fs.readFileSync('frontend/lib/admin/admin-service.ts', 'utf8').replace(/\r\n/g, '\n');

// Replace storage keys with v2
as = as.replaceAll("'admin_products'", "'admin_products_v2'");
as = as.replaceAll("'admin_categories'", "'admin_categories_v2'");

// Add migration check right after line where products/categories are initialized
const targetInit = `let products = getStorage<AdminProduct[]>('admin_products_v2', initialProducts);
let categories = getStorage<AdminCategory[]>('admin_categories_v2', initialCategories);`;

const replacementInit = `let products = getStorage<AdminProduct[]>('admin_products_v2', initialProducts);
if (!products || products.length < 500) {
  products = initialProducts;
  setStorage('admin_products_v2', products);
}

let categories = getStorage<AdminCategory[]>('admin_categories_v2', initialCategories);
if (!categories || categories.length < 50) {
  categories = initialCategories;
  setStorage('admin_categories_v2', categories);
}`;

if (as.includes(targetInit)) {
  as = as.replace(targetInit, replacementInit);
  fs.writeFileSync('frontend/lib/admin/admin-service.ts', as, 'utf8');
  console.log('Updated admin-service.ts');
} else {
  console.error('Target init not found in admin-service.ts!');
}
