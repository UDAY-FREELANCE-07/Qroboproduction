const fs = require('fs');
let code = fs.readFileSync('frontend/lib/mock-data.ts', 'utf8');

const target = `export const mockDataMap: Record<string, any[]> = {
  categories: mockCategories,
  brands: mockBrands,
  products: mockProducts,
  banners: mockBanners,
  promo_cards: mockPromoCards,
  deals: mockDeals,
  coupons: mockCoupons,
  projects: mockProjects,
  tutorials: mockTutorials,
};`;

const normalizedCode = code.replace(/\r\n/g, '\n');
const replacement = `import { pdfCategories, pdfProducts } from './pdf-catalog-data';

export const mockDataMap: Record<string, any[]> = {
  categories: [...pdfCategories, ...mockCategories.filter(c => !pdfCategories.some(p => p.slug === c.slug))],
  brands: mockBrands,
  products: [...pdfProducts, ...mockProducts.filter(p => !pdfProducts.some(x => x.slug === p.slug))],
  banners: mockBanners,
  promo_cards: mockPromoCards,
  deals: mockDeals,
  coupons: mockCoupons,
  projects: mockProjects,
  tutorials: mockTutorials,
};`;

if (!normalizedCode.includes(target)) {
  console.error('Target not found in normalized code!');
} else {
  const updated = normalizedCode.replace(target, replacement);
  fs.writeFileSync('frontend/lib/mock-data.ts', updated, 'utf8');
  console.log('Successfully updated frontend/lib/mock-data.ts');
}
