import express from 'express';
import { performSEOCrawl } from '../services/seoAuditService.js';

const router = express.Router();

// This endpoint conflicts with the main /api/audit endpoint in index.ts
// Commenting out to avoid conflicts. Use the main endpoint instead.
/*
router.post('/audit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  await performSEOCrawl(url); // this pushes to the queue
  res.status(200).json({ message: 'Job submitted' });
});
*/

// Queue-based audit endpoint (alternative to the main one)
router.post('/audit-queue', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
    }

    await performSEOCrawl(url); // this pushes to the queue or processes directly
    res.status(200).json({ message: 'SEO audit job submitted successfully' });
  } catch (error) {
    console.error('Queue audit error:', error);
    res.status(500).json({ 
      error: 'Failed to submit audit job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 