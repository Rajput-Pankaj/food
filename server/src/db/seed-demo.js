// Standalone runner: (re)seed demo orders, promos and inbox messages
// into an existing database without touching menu/blog/user data.
// Usage: npm run seed:demo  (from server/)  or  npm run seed:demo  (from root)
import 'dotenv/config';
import { pool } from '../db.js';
import { seedDemoContent } from './seedDemoData.js';

try {
  await seedDemoContent();
} catch (error) {
  console.error('Demo seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
