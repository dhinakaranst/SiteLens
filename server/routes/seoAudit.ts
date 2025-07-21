import express from 'express';
import { performSEOCrawl } from '../services/seoAuditService.js';

const router = express.Router();

router.post('/audit', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Set a longer timeout for the entire request (120 seconds)
  req.setTimeout(120000);
  res.setTimeout(120000);

  try {
    console.log(`Starting SEO audit for: ${url}`);
    
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Analysis timed out. The website might be slow or too large. Please try again or try a smaller website.'));
      }, 110000); // 110 seconds - slightly less than request timeout
    });

    // Race between the audit and timeout
    const report = await Promise.race([
      performSEOCrawl(url),
      timeoutPromise
    ]);
    
    if (report && typeof report === 'object' && 'error' in report && report.error) {
      return res.status(500).json({ error: report.error, message: report.message });
    }
    
    console.log(`SEO audit completed for: ${url}`);
    res.status(200).json(report);
  } catch (error) {
    console.error('SEO audit error:', error);
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timed out')) {
      return res.status(408).json({ 
        error: 'Analysis timed out',
        message: 'Analysis timed out. The website might be slow or too large. Please try again or try a smaller website.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to perform SEO audit',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 