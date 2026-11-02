/**
 * Generates initialCategories and initialProducts for admin-mock-data.ts
 * using the official 51 categories and 1,187 products from pdf-catalog-data.ts
 */

const fs = require('fs');
const path = require('path');
const { pdfCategories, pdfProducts } = require('./catalog-categories.js');
const helpers = require('./catalog-helpers.js');
const cats = require('./catalog-categories.js');
const c1 = require('./items-cat-01-10.js');
const c2 = require('./items-cat-11-20.js');
const c3 = require('./items-cat-21-30.js');
const c4 = require('./items-cat-31-40.js');
const c5 = require('./items-cat-41-51.js');

const allCategoryItems = [...c1, ...c2, ...c3, ...c4, ...c5];

const adminCategories = cats.map((cat, idx) => ({
  id: `cat-${cat.slug}`,
  name: cat.name,
  slug: cat.slug,
  description: `Official ${cat.name} component collection from Hi Technology component catalog.`,
  iconName: 'Cpu',
  productCount: cat.listed,
  sortOrder: cat.no,
  isFeatured: idx < 12,
  status: 'active'
}));

const adminProducts = [];
const slugCounts = {};

for (const catGroup of allCategoryItems) {
  const meta = cats.find(x => x.no === catGroup.no);
  const catSlug = meta.slug;

  catGroup.items.forEach((item, itemIdx) => {
    const itemNo = itemIdx + 1;
    let baseSlug = helpers.generateSlug(item.name);
    if (!baseSlug) baseSlug = `item-${meta.no}-${itemNo}`;
    
    if (slugCounts[baseSlug]) {
      slugCounts[baseSlug]++;
      baseSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
    } else {
      slugCounts[baseSlug] = 1;
    }

    const price = helpers.getPriceForProduct(item.name, meta.no);
    const originalPrice = Math.round(price * 1.25);
    const stock = item.h ? Math.floor(25 + ((itemNo * 7) % 65)) : 0;
    const sku = `HIT-${meta.no.toString().padStart(2, '0')}-${itemNo.toString().padStart(3, '0')}`;
    const primaryImg = helpers.getComponentImage(item.name, meta.name);
    const specs = helpers.extractSpecs(item.name, meta.name);

    adminProducts.push({
      id: `prod-${meta.no}-${itemNo}`,
      name: item.name,
      slug: baseSlug,
      sku: sku,
      brand: 'Hi Technology',
      category: meta.name,
      subcategory: meta.name,
      shortDescription: `${item.name} - ${meta.name}`,
      description: `High-grade ${item.name} selected for professional engineering, robotics prototyping, and laboratory electronics projects. Sourced from authentic industrial electronics distributors with guaranteed specifications.`,
      price: price,
      originalPrice: originalPrice,
      discountPercentage: Math.round(((originalPrice - price) / originalPrice) * 100),
      taxRate: 18,
      stock: stock,
      reservedStock: item.h ? 2 : 0,
      lowStockThreshold: 10,
      warehouse: 'Bangalore Hub A',
      primaryImage: primaryImg,
      galleryImages: [primaryImg],
      status: 'published',
      isFeatured: item.h && (itemNo % 5 === 0),
      rating: 4.5 + ((itemNo % 5) * 0.1),
      reviewCount: 5 + ((itemNo * 3) % 45),
      specifications: specs,
      tags: [catSlug, 'electronics', 'components', item.h ? 'in-stock' : 'order-request'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-11-02T12:00:00Z'
    });
  });
}

console.log('Admin Categories:', adminCategories.length);
console.log('Admin Products:', adminProducts.length);

// Write dedicated admin data file
const adminCatalogPath = path.join(__dirname, '..', 'lib', 'admin', 'admin-pdf-data.ts');
const fileContent = `import { AdminProduct, AdminCategory } from './admin-types';

export const pdfAdminCategories: AdminCategory[] = ${JSON.stringify(adminCategories, null, 2)};

export const pdfAdminProducts: AdminProduct[] = ${JSON.stringify(adminProducts, null, 2)};
`;

fs.writeFileSync(adminCatalogPath, fileContent, 'utf8');
console.log('Saved admin catalog to:', adminCatalogPath);
