import { Worker } from 'bullmq';
import { performSEOCrawl } from '../services/seoAuditService.js';

console.log('🔄 Worker is running and waiting for jobs...');

new Worker(
  'seo-audit',
  async (job) => {
    const { url } = job.data;
    const result = await performSEOCrawl(url);
    console.log('✅ SEO Audit Result:', result);
  },
  {
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);
