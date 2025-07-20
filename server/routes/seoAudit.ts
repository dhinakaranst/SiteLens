import express from 'express';
import { performSEOCrawl } from '../services/seoAuditService.js';

const router = express.Router();

router.post('/audit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    console.log(`Starting SEO audit for: ${url}`);
    const report = await performSEOCrawl(url);
    
    if (report.error) {
      return res.status(500).json({ error: report.error, message: report.message });
    }
    
    console.log(`SEO audit completed for: ${url}`);
    res.status(200).json(report);
  } catch (error) {
    console.error('SEO audit error:', error);
    res.status(500).json({ 
      error: 'Failed to perform SEO audit',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 