import { query } from '../db.js';

export async function logAudit({ userId, action, resource, details = {}, ip }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, details, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, resource || null, JSON.stringify(details), ip || null]
    );
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
}

export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}
