import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { waitForDatabase } from './db.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import { csrfProtection } from './lib/csrf.js';
import { ensureSetupToken } from './lib/setupToken.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import menuRoutes from './routes/menu.js';
import settingsRoutes from './routes/settings.js';
import customerRoutes from './routes/customer.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blogs.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';
import mediaRoutes from './routes/media.js';
import setupRoutes from './routes/setup.js';
import promoRoutes from './routes/promos.js';
import favoriteRoutes from './routes/favorites.js';
import eventRoutes from './routes/events.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const isProduction = process.env.NODE_ENV === 'production';

function assertProductionSecrets() {
  if (!isProduction) return;

  const jwtSecret = process.env.JWT_SECRET || '';
  const weakSecrets = ['change-this-secret-in-production', 'dev-secret-change-me', 'change-me-to-a-long-random-secret'];

  if (!jwtSecret || jwtSecret.length < 32 || weakSecrets.includes(jwtSecret)) {
    console.error('FATAL: Set a strong JWT_SECRET (32+ chars) in production.');
    process.exit(1);
  }

  const dbPassword = process.env.POSTGRES_PASSWORD || '';
  if (dbPassword === 'foodexpress' || dbPassword === 'change-me-strong-password') {
    console.error('FATAL: Set a strong POSTGRES_PASSWORD in production.');
    process.exit(1);
  }
}

assertProductionSecrets();

const corsOrigin = process.env.CORS_ORIGIN;
if (isProduction && !corsOrigin) {
  console.warn('WARN: CORS_ORIGIN is not set — allowing same-origin proxy only.');
}

app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
            frameSrc: ['https://api.razorpay.com'],
          },
        }
      : false,
  })
);
app.use(
  cors({
    origin: corsOrigin || (isProduction ? false : true),
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use('/api', csrfProtection);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'foodexpress-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/events', eventRoutes);

app.use((error, _req, res) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await waitForDatabase();
  await runMigrations();
  await ensureSetupToken();
  await seedDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`FoodExpress API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
