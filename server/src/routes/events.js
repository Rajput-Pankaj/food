import { Router } from 'express';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();
const adminClients = new Set();

export function broadcastOrderEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of adminClients) {
    try {
      res.write(payload);
    } catch {
      adminClients.delete(res);
    }
  }
}

router.get('/orders', authRequired, adminRequired, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  adminClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    adminClients.delete(res);
  });
});

export default router;
