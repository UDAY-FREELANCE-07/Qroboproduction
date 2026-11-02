const fs = require('fs');
let code = fs.readFileSync('frontend/lib/mock-query-builder.ts', 'utf8').replace(/\r\n/g, '\n');

const target = `    if (this.tableName === 'deals') {
      result = result.map((d) => ({
        ...d,
        product: mockProducts.find((p) => p.id === d.product_id || p.slug === String(d.product_id).replace(/^prod-/, '')) || null,
      }));
    }`;

const replacement = `    if (this.tableName === 'deals') {
      result = result.map((d) => ({
        ...d,
        product: (mockDataMap.products || []).find((p) => p.id === d.product_id || p.slug === String(d.product_id).replace(/^prod-/, '')) || null,
      }));
    }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('frontend/lib/mock-query-builder.ts', code, 'utf8');
  console.log('Successfully updated mock-query-builder.ts');
} else {
  console.error('Target not found in mock-query-builder.ts!');
}
