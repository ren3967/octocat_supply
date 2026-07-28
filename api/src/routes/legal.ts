
import express from 'express';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Allow-list of supported languages
const ALLOWED_LANGUAGES = new Set(['en', 'de', 'es', 'fr']);

// Allow-list of known legal document filenames
const ALLOWED_FILES = new Set([
  'terms_v2.1.pdf',
  'terms_v2.0.pdf',
  'agb_v2.1.pdf',
  'cgv_v2.1.pdf',
  'terminos_v2.1.pdf',
]);

const documentsRoot = path.resolve(__dirname, '../../documents/legal');

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Terms download endpoint
router.get('/terms/download', downloadLimiter, (req, res) => {
  try {
    const { file, lang = 'en' } = req.query;

    if (!file || typeof file !== 'string') {
      res.status(400).json({ error: 'File parameter is required' });
      return;
    }

    const langStr = typeof lang === 'string' ? lang : 'en';

    if (!ALLOWED_LANGUAGES.has(langStr)) {
      res.status(400).json({ error: 'Unsupported language' });
      return;
    }

    if (!ALLOWED_FILES.has(file)) {
      res.status(400).json({ error: 'Unsupported file' });
      return;
    }

    // Resolve and verify the path stays inside the legal documents root
    const documentPath = path.resolve(documentsRoot, langStr, file);
    if (!documentPath.startsWith(documentsRoot + path.sep)) {
      res.status(400).json({ error: 'Invalid file path' });
      return;
    }

    if (!fs.existsSync(documentPath)) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(documentPath);
  } catch (error) {
    console.error('Error in terms download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List available terms documents (mock data)
router.get('/terms', (req, res) => {
  const documents = [
    { id: 1, version: '2.1', filename: 'terms_v2.1.pdf', language: 'en', effectiveDate: '2024-01-01' },
    { id: 2, version: '2.1', filename: 'agb_v2.1.pdf', language: 'de', effectiveDate: '2024-01-01' },
    { id: 3, version: '2.1', filename: 'cgv_v2.1.pdf', language: 'fr', effectiveDate: '2024-01-01' },
    { id: 4, version: '2.1', filename: 'terminos_v2.1.pdf', language: 'es', effectiveDate: '2024-01-01' },
    { id: 5, version: '2.0', filename: 'terms_v2.0.pdf', language: 'en', effectiveDate: '2023-06-01' },
  ];
  res.json(documents);
});

export default router;
