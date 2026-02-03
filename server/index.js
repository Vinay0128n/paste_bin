import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db/index.js';
import { healthz } from './routes/healthz.js';
import {
  createPasteHandler,
  getPasteHandler,
  viewPasteHtmlHandler,
} from './routes/pastes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.get('/api/healthz', healthz);
app.post('/api/pastes', createPasteHandler);
app.get('/api/pastes/:id', getPasteHandler);

// View paste HTML route - check availability first, then serve SPA
app.get('/p/:id', viewPasteHtmlHandler);

// Serve static files from built React app
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist, { index: 'index.html' }));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
