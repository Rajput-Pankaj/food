import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { waitForDatabase } from './db.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import menuRoutes from './routes/menu.js';
import settingsRoutes from './routes/settings.js';
import customerRoutes from './routes/customer.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blogs.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'foodexpress-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, _req, res) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await waitForDatabase();
  await runMigrations();
  await seedDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`FoodExpress API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
