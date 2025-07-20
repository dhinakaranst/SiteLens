import { Worker } from 'bullmq';
import { performSEOCrawl } from '../services/seoAuditService.js';

let worker: Worker | null = null;

// Only create worker if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    console.log('🔄 Initializing worker with Redis...');
    worker = new Worker(
      'seo-audit',
      async (job) => {
        const { url } = job.data;
        const result = await performSEOCrawl(url);
        console.log('✅ SEO Audit Result:', result);
      },
      {
        connection: {
          url: process.env.REDIS_URL,
        },
      }
    );
    console.log('✅ Audit worker initialized with Redis');
  } catch (error) {
    console.warn('⚠️ Failed to initialize audit worker:', error);
    worker = null;
  }
} else {
  console.log('ℹ️ No Redis available, audit worker disabled');
}

export default worker;
