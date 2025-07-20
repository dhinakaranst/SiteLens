import express from 'express';
import { performSEOCrawl } from '../services/seoAuditService.js';

const router = express.Router();

router.post('/audit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const report = await performSEOCrawl(url);
  res.status(200).json(report);
});

export default router; 