import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import { query } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';
import {
  buildStoredFilename,
  ensureUploadDir,
  getPublicUrl,
  mapMediaRow,
  resolveStoredPath,
  UPLOAD_DIR,
  validateImageUpload,
} from '../lib/mediaFiles.js';

const router = Router();

ensureUploadDir();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MEDIA_MAX_BYTES) || 5 * 1024 * 1024, files: 1 },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads. Please try again later.' },
});

router.get('/', authRequired, adminRequired, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const folder = req.query.folder?.trim();

  const result = folder
    ? await query(
        `SELECT * FROM media_files WHERE payload->>'folder' = $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [folder, limit, offset]
      )
    : await query('SELECT * FROM media_files ORDER BY created_at DESC LIMIT $1 OFFSET $2', [
        limit,
        offset,
      ]);

  return res.json(result.rows.map(mapMediaRow));
});

router.post(
  '/upload',
  authRequired,
  adminRequired,
  uploadLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      const validation = validateImageUpload(req.file);
      if (!validation.ok) {
        return res.status(400).json({ error: validation.error });
      }

      const storedName = buildStoredFilename(validation.mime);
      const filePath = resolveStoredPath(storedName);
      if (!filePath) {
        return res.status(500).json({ error: 'Unable to prepare upload path.' });
      }

      fs.writeFileSync(filePath, req.file.buffer);

      const altText = String(req.body?.altText || '').trim().slice(0, 200);
      const folder = String(req.body?.folder || 'uploads').trim().slice(0, 50);
      const url = getPublicUrl(storedName);
      const payload = { altText, folder };

      const { rows } = await query(
        `INSERT INTO media_files (filename, original_name, mime_type, size_bytes, url, payload, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          storedName,
          req.file.originalname.slice(0, 255),
          validation.mime,
          req.file.size,
          url,
          JSON.stringify(payload),
          req.user.id,
        ]
      );

      return res.status(201).json(mapMediaRow(rows[0]));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Upload failed.' });
    }
  }
);

router.get('/files/:filename', async (req, res) => {
  const filePath = resolveStoredPath(req.params.filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  const { rows } = await query('SELECT mime_type FROM media_files WHERE filename = $1', [
    req.params.filename,
  ]);
  const mime = rows[0]?.mime_type || 'application/octet-stream';

  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.sendFile(filePath);
});

router.patch('/:id', authRequired, adminRequired, async (req, res) => {
  const { altText, folder } = req.body;
  const { rows } = await query('SELECT * FROM media_files WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Media not found.' });

  const payload = {
    ...rows[0].payload,
    ...(altText !== undefined ? { altText: String(altText).trim().slice(0, 200) } : {}),
    ...(folder !== undefined ? { folder: String(folder).trim().slice(0, 50) } : {}),
  };

  const updated = await query(
    'UPDATE media_files SET payload = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(payload), req.params.id]
  );

  return res.json(mapMediaRow(updated.rows[0]));
});

router.delete('/:id', authRequired, adminRequired, async (req, res) => {
  const { rows } = await query('SELECT * FROM media_files WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Media not found.' });

  const file = rows[0];
  if (file.payload?.protected) {
    return res.status(400).json({ error: 'This seed image cannot be deleted.' });
  }

  const filePath = resolveStoredPath(file.filename);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await query('DELETE FROM media_files WHERE id = $1', [req.params.id]);
  return res.json({ ok: true });
});

export default router;
