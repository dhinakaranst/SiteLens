import { Worker } from 'bullmq';
import { performSEOCrawl } from '../services/seoAuditService.js';
console.log('🔄 Worker starting...');
let worker = null;
let isWorkerAvailable = false;
async function initializeWorker() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        // Only try to connect if REDIS_URL is explicitly set or if we're in development with Redis
        if (process.env.REDIS_URL || process.env.NODE_ENV === 'development') {
            // Try to create the worker with Redis URL if available, otherwise fallback to host/port
            const connectionConfig = redisUrl !== 'redis://localhost:6379'
                ? { url: redisUrl, connectTimeout: 5000, lazyConnect: true }
                : { host: redisHost, port: redisPort, connectTimeout: 5000, lazyConnect: true };
            worker = new Worker('seo-audit', async (job) => {
                const { url } = job.data;
                const result = await performSEOCrawl(url);
                console.log('✅ SEO Audit Result:', result);
            }, {
                connection: connectionConfig,
            });
            // Test the connection with a timeout
            const connectPromise = worker.waitUntilReady();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000));
            await Promise.race([connectPromise, timeoutPromise]);
            isWorkerAvailable = true;
            console.log('✅ Worker is running and waiting for jobs...');
        }
        else {
            console.log('⚠️ No REDIS_URL configured, worker will not be available');
            worker = null;
            isWorkerAvailable = false;
        }
    }
    catch (error) {
        console.warn('⚠️ Worker not available, jobs will be processed directly:', error instanceof Error ? error.message : 'Unknown error');
        worker = null;
        isWorkerAvailable = false;
        // Clean up if worker was created but failed to connect
        if (worker) {
            try {
                await worker.close();
            }
            catch (e) {
                // Ignore cleanup errors
            }
            worker = null;
        }
    }
}
// Initialize worker
initializeWorker();
export { worker, isWorkerAvailable };
