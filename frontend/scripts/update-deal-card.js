const fs = require('fs');
let code = fs.readFileSync('frontend/app/page.tsx', 'utf8').replace(/\r\n/g, '\n');

const target = `  return (
    <Link href={\`/product/\${deal.product.slug}\`}>`;

const replacement = `  if (!deal.product) return null;

  return (
    <Link href={\`/product/\${deal.product.slug}\`}>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('frontend/app/page.tsx', code, 'utf8');
  console.log('Successfully guarded DealCard in page.tsx');
} else {
  console.error('Target not found in page.tsx');
}
