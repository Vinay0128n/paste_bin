import path from 'path';
import { fileURLToPath } from 'url';
import { createPaste, getAndIncrementPaste, getPasteForView } from '../db/index.js';
import { generatePasteId } from '../utils/id.js';
import { getCurrentTimeMs } from '../lib/time.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createPasteHandler(req, res) {
  const { content, ttl_seconds, max_views } = req.body || {};

  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'content is required and must be a non-empty string' });
  }

  if (ttl_seconds !== undefined) {
    const ttl = Number(ttl_seconds);
    if (!Number.isInteger(ttl) || ttl < 1) {
      return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
    }
  }

  if (max_views !== undefined) {
    const mv = Number(max_views);
    if (!Number.isInteger(mv) || mv < 1) {
      return res.status(400).json({ error: 'max_views must be an integer >= 1' });
    }
  }

  const now = getCurrentTimeMs(req);
  const id = generatePasteId();
  const ttlMs = ttl_seconds != null ? Number(ttl_seconds) * 1000 : null;
  const expires_at = ttlMs != null ? now + ttlMs : null;

  await createPaste({
    id,
    content: content.trim(),
    created_at: now,
    expires_at,
    max_views: max_views != null ? Number(max_views) : null,
  });

  const baseUrl = process.env.BASE_URL;
  const url = baseUrl ? `${baseUrl}/p/${id}` : `/p/${id}`;

  res.status(201).json({ id, url });
}

export async function getPasteHandler(req, res) {
  const { id } = req.params;
  const now = getCurrentTimeMs(req);

  const result = await getAndIncrementPaste(id, now);

  if (!result.found) {
    return res.status(404).set('Content-Type', 'application/json').json({ error: 'Paste not found' });
  }

  res.status(200).json({
    content: result.content,
    remaining_views: result.remaining_views,
    expires_at: result.expires_at,
  });
}

export async function viewPasteHtmlHandler(req, res) {
  const { id } = req.params;
  const now = getCurrentTimeMs(req);

  const result = await getPasteForView(id, now);

  if (!result.found) {
    return res.status(404).set('Content-Type', 'application/json').json({ error: 'Paste not found' });
  }

  // Serve the SPA - client will fetch from API (which increments the view)
  const indexPath = path.join(__dirname, '../../client/dist/index.html');
  res.sendFile(indexPath);
}
