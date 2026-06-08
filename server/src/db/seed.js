import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, '../../seed');

const DEFAULT_SETTINGS = {
  storeName: 'FoodExpress',
  storeAddress: '123 Food Street, Connaught Place, New Delhi - 110001',
  storePhone: '+91 8429168953',
  deliveryFee: 49,
  freeDeliveryThreshold: 500,
  deliveryEnabled: true,
  takeawayEnabled: true,
  enabledPaymentMethods: ['cod', 'upi', 'razorpay'],
  upi: { vpa: '', payeeName: 'FoodExpress' },
  razorpay: { keyId: '', enabled: false },
  updatedAt: null,
};

const SEED_USERS = [
  { name: 'Admin', email: 'admin@foodexpress.com', password: 'Admin@12345', role: 'admin' },
  { name: 'Demo Customer', email: 'customer@foodexpress.com', password: 'Customer@123', role: 'customer' },
];

function readJson(fileName) {
  const filePath = path.join(seedDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function seedDatabase() {
  const { rows } = await query(`SELECT value FROM app_meta WHERE key = 'seeded'`);
  if (rows[0]?.value?.done) {
    console.log('Database already seeded — skipping.');
    return;
  }

  console.log('Seeding database...');

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await query(
      `INSERT INTO users (name, email, password_hash, role, is_seed)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, passwordHash, user.role]
    );
  }

  const menuItems = readJson('menu-items.json');
  for (const item of menuItems) {
    await query(
      `INSERT INTO menu_items (id, payload, is_custom)
       VALUES ($1, $2, FALSE)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [item.id, JSON.stringify(item)]
    );
  }

  const blogPosts = readJson('blog-posts.json');
  for (const post of blogPosts) {
    await query(
      `INSERT INTO blog_posts (id, slug, payload, is_custom)
       VALUES ($1, $2, $3, FALSE)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, slug = EXCLUDED.slug, updated_at = NOW()`,
      [post.id, post.slug, JSON.stringify(post)]
    );
  }

  await query(
    `INSERT INTO store_settings (id, payload)
     VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(DEFAULT_SETTINGS)]
  );

  const { rows: customerRows } = await query(
    `SELECT id FROM users WHERE email = 'customer@foodexpress.com'`
  );
  if (customerRows[0]) {
    const userId = customerRows[0].id;
    await query(
      `INSERT INTO customer_profiles (user_id, payload)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [
        userId,
        JSON.stringify({
          phone: '+91 9876543210',
          dietaryPreference: null,
        }),
      ]
    );

    await query(`DELETE FROM customer_addresses WHERE user_id = $1`, [userId]);
    await query(
      `INSERT INTO customer_addresses (id, user_id, payload)
       VALUES ($1, $2, $3)`,
      [
        crypto.randomUUID(),
        userId,
        JSON.stringify({
          id: crypto.randomUUID(),
          label: 'Home',
          address: '42 Green Park, New Delhi - 110016',
          phone: '+91 9876543210',
          isDefault: true,
        }),
      ]
    );
  }

  await query(
    `INSERT INTO app_meta (key, value)
     VALUES ('seeded', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [JSON.stringify({ done: true, at: new Date().toISOString(), menuCount: menuItems.length })]
  );

  console.log(`Seeded ${menuItems.length} menu items, ${blogPosts.length} blog posts, demo users.`);
}

export async function resetDemoData() {
  await query('DELETE FROM reviews');
  await query('DELETE FROM orders');
  await query('DELETE FROM customer_addresses');
  await query('DELETE FROM customer_profiles');
  await query('DELETE FROM blog_posts WHERE is_custom = TRUE');
  await query('DELETE FROM menu_items WHERE is_custom = TRUE');
  await query(`DELETE FROM users WHERE is_seed = FALSE`);

  await query(`DELETE FROM app_meta WHERE key = 'seeded'`);
  await seedDatabase();
}
