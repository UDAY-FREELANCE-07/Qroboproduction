/**
 * Syncs the latest PDF catalog (50 categories, 569 products) with PostgreSQL.
 *
 * Runs on AWS EC2 or locally against PostgreSQL:
 *   npx tsx --env-file=/etc/qrobo/app.env scripts/db/sync-catalog.ts
 *
 * Updates:
 *   1. All categories upserted from pdfCategories
 *   2. Removed categories (e.g. diy-and-educational-project-kits) removed from DB
 *   3. All products upserted with current photos, tags, specs, and stock = 0
 *   4. Pruned unlisted items removed from DB
 */
import { pdfCategories, pdfProducts } from '../../lib/pdf-catalog-data';
import { main } from './_client';

main(async (client) => {
  console.log(`Starting catalog sync: ${pdfCategories.length} categories, ${pdfProducts.length} products...`);

  await client.query('BEGIN');

  try {
    // 1. Ensure default brand exists for products
    const brandRes = await client.query(
      `INSERT INTO brands (name, slug, description)
       VALUES ('Hi Technology', 'hi-technology', 'Hi Technology Electronics & Robotics Components')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const defaultBrandId = brandRes.rows[0].id;

    // Get all existing brands map
    const allBrandsRes = await client.query('SELECT id, slug, name FROM brands');
    const brandMap = new Map<string, string>();
    for (const b of allBrandsRes.rows) {
      brandMap.set(b.slug, b.id);
      brandMap.set(b.name.toLowerCase(), b.id);
    }

    // 2. Remove diy-and-educational-project-kits if present
    const diyCatRes = await client.query("SELECT id FROM categories WHERE slug = 'diy-and-educational-project-kits'");
    if (diyCatRes.rows.length > 0) {
      const diyId = diyCatRes.rows[0].id;
      await client.query('DELETE FROM products WHERE category_id = $1', [diyId]);
      await client.query('DELETE FROM categories WHERE id = $1', [diyId]);
      console.log('Removed diy-and-educational-project-kits and its products from database.');
    }

    // 3. Upsert categories
    const catIdMap = new Map<string, string>();
    for (const cat of pdfCategories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description, icon_name, is_featured, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name,
               description = EXCLUDED.description,
               icon_name = EXCLUDED.icon_name,
               is_featured = EXCLUDED.is_featured,
               sort_order = EXCLUDED.sort_order,
               updated_at = now()
         RETURNING id`,
        [cat.name, cat.slug, cat.description || '', cat.icon_name || 'Cpu', cat.is_featured || false, cat.sort_order || 0]
      );
      catIdMap.set(cat.slug, res.rows[0].id);
      catIdMap.set(cat.id, res.rows[0].id);
    }
    console.log(`Synchronized ${pdfCategories.length} categories.`);

    // 4. Upsert products
    let upsertedCount = 0;
    const validSkus = new Set<string>();

    for (const p of pdfProducts) {
      validSkus.add(p.sku);
      const catId = catIdMap.get(p.category_id) || catIdMap.get(p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      if (!catId) {
        console.warn(`Category not found for product: ${p.name} (${p.category_id})`);
        continue;
      }

      const brandId = brandMap.get(p.brand_id) || brandMap.get(p.brand_name.toLowerCase()) || defaultBrandId;

      await client.query(
        `INSERT INTO products (
           name, slug, sku, description, short_description,
           category_id, brand_id, price, compare_at_price,
           images, primary_image, specifications, features, whats_included, compatibility, tags,
           stock, reserved_stock, low_stock_threshold,
           is_featured, is_bestseller, is_new_arrival, is_published,
           rating, review_count, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9,
           $10, $11, $12, $13, $14, $15, $16,
           $17, $18, $19,
           $20, $21, $22, $23,
           $24, $25, now()
         )
         ON CONFLICT (slug) DO UPDATE
           SET name = EXCLUDED.name,
               sku = EXCLUDED.sku,
               description = EXCLUDED.description,
               short_description = EXCLUDED.short_description,
               category_id = EXCLUDED.category_id,
               brand_id = EXCLUDED.brand_id,
               price = EXCLUDED.price,
               compare_at_price = EXCLUDED.compare_at_price,
               images = EXCLUDED.images,
               primary_image = EXCLUDED.primary_image,
               specifications = EXCLUDED.specifications,
               features = EXCLUDED.features,
               whats_included = EXCLUDED.whats_included,
               compatibility = EXCLUDED.compatibility,
               tags = EXCLUDED.tags,
               stock = EXCLUDED.stock,
               is_published = EXCLUDED.is_published,
               updated_at = now()`,
        [
          p.name,
          p.slug,
          p.sku,
          p.description || '',
          p.short_description || '',
          catId,
          brandId,
          p.price || 0,
          p.compare_at_price || null,
          p.images || [],
          p.primary_image || null,
          JSON.stringify(p.specifications || {}),
          p.features || [],
          p.whats_included || [],
          p.compatibility || [],
          p.tags || ['out-of-stock'],
          0, // stock = 0 (all out of stock)
          0, // reserved_stock = 0
          p.low_stock_threshold || 5,
          p.is_featured || false,
          p.is_bestseller || false,
          p.is_new_arrival || false,
          p.is_published !== false,
          p.rating || 0,
          p.review_count || 0,
        ]
      );
      upsertedCount++;
    }
    console.log(`Upserted ${upsertedCount} products with current photos, tags, specs and out-of-stock.`);

    // 5. Prune items in synced categories that are not in validSkus (excluding orders-linked products)
    const syncedCatIds = Array.from(catIdMap.values());
    const pruneRes = await client.query(
      `DELETE FROM products
       WHERE category_id = ANY($1)
         AND sku != ALL($2)
         AND id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`,
      [syncedCatIds, Array.from(validSkus)]
    );
    console.log(`Pruned ${pruneRes.rowCount || 0} unlisted/balance products from synced categories.`);

    await client.query('COMMIT');
    console.log('Catalog database synchronization successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
});

