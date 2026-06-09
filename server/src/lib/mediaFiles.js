import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const MAX_BYTES = Number(process.env.MEDIA_MAX_BYTES) || 5 * 1024 * 1024;

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function detectImageMime(buffer) {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  const ftyp = buffer.subarray(4, 8).toString('ascii');
  if (ftyp === 'ftyp' && buffer.subarray(8, 12).toString('ascii').includes('avif')) {
    return 'image/avif';
  }
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    const brand = buffer.subarray(8, 12).toString('ascii');
    if (brand.startsWith('avif') || brand.startsWith('avis')) {
      return 'image/avif';
    }
  }

  return null;
}

export function validateImageUpload(file) {
  if (!file) return { ok: false, error: 'No file uploaded.' };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large. Maximum size is ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` };
  }

  const mime = detectImageMime(file.buffer);
  if (!mime || !ALLOWED_MIME.has(mime)) {
    return { ok: false, error: 'Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.' };
  }

  return { ok: true, mime };
}

export function buildStoredFilename(mime) {
  const ext = EXT_BY_MIME[mime] || '.img';
  return `${crypto.randomUUID()}${ext}`;
}

export function getPublicUrl(storedName) {
  return `/api/media/files/${storedName}`;
}

export function resolveStoredPath(storedName) {
  if (!/^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|gif|avif)$/i.test(storedName)) {
    return null;
  }
  const fullPath = path.join(UPLOAD_DIR, storedName);
  if (!fullPath.startsWith(UPLOAD_DIR)) return null;
  return fullPath;
}

export function mapMediaRow(row) {
  return {
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    url: row.url,
    altText: row.payload?.altText || '',
    folder: row.payload?.folder || 'uploads',
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}
