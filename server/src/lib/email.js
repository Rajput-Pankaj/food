import nodemailer from 'nodemailer';
import { escapeHtml } from './htmlEscape.js';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@foodexpress.com';

let transporter = null;

function getTransporter() {
  if (!SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) return { sent: false, stub: true };

  const transport = getTransporter();
  if (!transport) {
    console.log(`[email stub] To: ${to} | ${subject}`);
    return { sent: false, stub: true };
  }

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html: html || text,
    });
    return { sent: true };
  } catch (error) {
    console.error('[email] Send failed:', error.message);
    return { sent: false, error: error.message };
  }
}

export async function sendPasswordResetEmail({ to, token, appUrl }) {
  const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your FoodExpress password';
  const text = `Use this link to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`;
  const html = `<p>Use this link to reset your password (valid for 1 hour):</p>
<p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
<p>If you did not request this, ignore this email.</p>`;
  return sendEmail({ to, subject, text, html });
}

export async function notifyOrderPlaced(order, settings) {
  const storeEmail = settings?.storeEmail;
  const customerEmail = order.userEmail || order.guestEmail;
  const subject = `Order #${String(order.id).slice(0, 8)} placed`;
  const text = `New order total: ₹${order.total}. Status: ${order.status}.`;

  const tasks = [];
  if (customerEmail) {
    tasks.push(sendEmail({ to: customerEmail, subject: `Your ${subject}`, text }));
  }
  if (storeEmail) {
    tasks.push(sendEmail({ to: storeEmail, subject, text }));
  }
  await Promise.all(tasks);
}

export async function notifyOrderStatus(order, newStatus) {
  const email = order.userEmail || order.guestEmail;
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Order update: ${newStatus}`,
    text: `Your order #${String(order.id).slice(0, 8)} is now ${newStatus}.`,
  });
}
