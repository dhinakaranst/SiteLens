import { Worker } from 'bullmq';
import { performSEOCrawl } from '../services/seoAuditService.js';
console.log('🔄 Worker is running and waiting for jobs...');
const worker = new Worker('seo-audit', async (job) => {
    const { url } = job.data;
    const result = await performSEOCrawl(url);
    console.log('✅ SEO Audit Result:', result);
}, {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed:`, err);
});
