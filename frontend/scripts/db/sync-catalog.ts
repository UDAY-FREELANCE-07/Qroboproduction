/**
 * Syncs the latest PDF catalog (50 categories, 569 products) with PostgreSQL.
 *
 * Runs on AWS EC2 or locally against PostgreSQL:
 *   npx tsx --env-file=/etc/qrobo/migrate.env scripts/db/sync-catalog.ts
 *
 * Updates:
 *   1. All categories upserted from pdfCategories
 *   2. Removed categories (e.g. diy-and-educational-project-kits) removed from DB
 *   3. All products upserted with current photos, tags, specs, and stock = 0
 *   4. Pruned unlisted items removed from DB
 *   5. Removes all old demo seed products with yellow/pexels photos
 *   6. Updates daily deals, bestsellers, featured products & banners with clean photos
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

    // 5. Delete any dummy products containing pexels images from previous seed data
    const delPexRes = await client.query(`
      DELETE FROM products 
      WHERE (
        EXISTS (SELECT 1 FROM unnest(images) img WHERE img LIKE '%pexels%')
        OR primary_image LIKE '%pexels%'
      )
      AND id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)
    `);
    console.log(`Deleted ${delPexRes.rowCount || 0} products with yellow/pexels dummy images.`);

    // 6. Prune items in synced categories that are not in validSkus (excluding orders-linked products)
    const syncedCatIds = Array.from(catIdMap.values());
    const pruneRes = await client.query(
      `DELETE FROM products
       WHERE category_id = ANY($1)
         AND sku != ALL($2)
         AND id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`,
      [syncedCatIds, Array.from(validSkus)]
    );
    console.log(`Pruned ${pruneRes.rowCount || 0} unlisted/balance products from synced categories.`);

    // 7. Prune obsolete categories that have no products
    const delCatRes = await client.query(
      `DELETE FROM categories 
       WHERE slug != ALL($1)
         AND id NOT IN (SELECT category_id FROM products WHERE category_id IS NOT NULL)`,
      [pdfCategories.map((c) => c.slug)]
    );
    console.log(`Pruned ${delCatRes.rowCount || 0} obsolete categories.`);

    // 8. Rebuild active Daily Deals with real hardware components (clean white background photos)
    await client.query('DELETE FROM deals');
    const dealItems = [
      { slug: 'arduino-uno-r3', discount: 20, sale: 1200, orig: 1500, title: 'Arduino Uno R3 Deal', desc: '20% off Arduino Uno R3 development board' },
      { slug: '2wd-robot-car-chassis-kit', discount: 20, sale: 1200, orig: 1500, title: '2WD Robot Car Kit Sale', desc: '20% off complete 2WD robot chassis kit' },
      { slug: '4wd-robot-car-chassis-kit', discount: 20, sale: 1200, orig: 1500, title: '4WD Robot Car Kit Sale', desc: '20% off 4WD mobile robot chassis platform' },
      { slug: 'tank-caterpillar-chassis-kit', discount: 20, sale: 650, orig: 813, title: 'Tank Caterpillar Kit Deal', desc: 'High-torque tank caterpillar chassis kit' },
      { slug: 'hc-sr04-ultrasonic', discount: 40, sale: 149, orig: 249, title: 'HC-SR04 Ultrasonic Sensor Sale', desc: '40% off HC-SR04 precision distance sensor' },
      { slug: 'sg90-servo', discount: 44, sale: 99, orig: 179, title: 'SG90 Micro Servo Deal', desc: '44% off mini 9g servo motor' },
      { slug: 'nodemcu-esp8266', discount: 35, sale: 299, orig: 450, title: 'NodeMCU ESP8266 WiFi Sale', desc: 'IoT WiFi board with micro USB' },
      { slug: 'arduino-mega-2560', discount: 25, sale: 1499, orig: 1999, title: 'Arduino Mega 2560 R3 Deal', desc: '25% off ATmega2560 development board' },
      { slug: 'breadboard-830', discount: 30, sale: 199, orig: 299, title: '830-Point Solderless Breadboard', desc: '30% off high quality prototyping breadboard' },
      { slug: 'line-follower-robot-kit', discount: 20, sale: 1200, orig: 1500, title: 'Line Follower Robot Kit Sale', desc: 'Complete line tracking robot chassis kit' },
    ];
    for (const d of dealItems) {
      await client.query(
        `INSERT INTO deals (product_id, title, description, discount_percentage, sale_price, original_price, starts_at, ends_at, is_active)
         SELECT id, $1, $2, $3, $4, $5, now() - interval '1 day', now() + interval '30 days', true
         FROM products WHERE slug = $6`,
        [d.title, d.desc, d.discount, d.sale, d.orig, d.slug]
      );
    }
    console.log('Synchronized deals with clean hardware products.');

    // 9. Update Bestsellers, Featured, and New Arrivals with real hardware products
    await client.query('UPDATE products SET is_bestseller = false, is_featured = false, is_new_arrival = false');

    const bestSellerSlugs = [
      'arduino-uno-r3',
      'arduino-nano',
      'arduino-mega-2560',
      '2wd-robot-car-chassis-kit',
      '4wd-robot-car-chassis-kit',
      'tank-caterpillar-chassis-kit',
      'hc-sr04-ultrasonic',
      'sg90-servo',
      'nodemcu-esp8266',
      'breadboard-830',
      'mg996r-servo',
      '12v-gear-motor',
    ];
    await client.query('UPDATE products SET is_bestseller = true WHERE slug = ANY($1)', [bestSellerSlugs]);

    const featuredSlugs = [
      '2wd-robot-car-chassis-kit',
      '4wd-robot-car-chassis-kit',
      'tank-caterpillar-chassis-kit',
      'line-follower-robot-kit',
      'obstacle-avoider-robot-kit',
      'arduino-uno-r3',
      'arduino-mega-2560',
      'esp32-cam',
      'sg90-servo',
    ];
    await client.query('UPDATE products SET is_featured = true WHERE slug = ANY($1)', [featuredSlugs]);

    const newArrivalSlugs = [
      'esp32-cam-mb-base-board',
      'logic-level-converter-4-channel-bidirectional',
      'ads1115-16-bit-adc-module',
      'ds3231-rtc-module',
      'float-switch-water-level',
      'micro-metal-gearmotor-n20-bracket',
      'active-buzzer',
    ];
    await client.query('UPDATE products SET is_new_arrival = true WHERE slug = ANY($1)', [newArrivalSlugs]);
    console.log('Set bestsellers, featured and new arrivals with clean component photos.');

    // 10. Update promo cards and banners with clean photos
    await client.query(`
      UPDATE promo_cards SET 
        image_url = '/images/products/development-boards-and-shields/arduino-uno-r3.png'
      WHERE title = 'Daily Deals'
    `);
    await client.query(`
      UPDATE promo_cards SET 
        image_url = '/images/products/robot-chassis-and-platform-kits/2wd-robot-car-chassis-kit.png'
      WHERE title = 'Projects & Lab'
    `);
    await client.query(`
      UPDATE banners SET 
        image_url = '/images/products/robot-chassis-and-platform-kits/tank-caterpillar-chassis-kit.png'
      WHERE sort_order = 1
    `);
    await client.query(`
      UPDATE banners SET 
        image_url = '/images/products/development-boards-and-shields/arduino-uno-r3.png'
      WHERE sort_order = 2
    `);
    await client.query(`
      UPDATE banners SET 
        image_url = '/images/products/development-boards-and-shields/esp32-cam.png'
      WHERE sort_order = 3
    `);

    await client.query('COMMIT');
    console.log('Catalog database synchronization successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
});
