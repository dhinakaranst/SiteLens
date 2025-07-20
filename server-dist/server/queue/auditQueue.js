import { Queue } from 'bullmq';
let auditQueue = null;
let isQueueAvailable = false;
async function initializeQueue() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        // Only try to connect if REDIS_URL is explicitly set or if we're in development with Redis
        if (process.env.REDIS_URL || process.env.NODE_ENV === 'development') {
            // Try to create the queue with Redis URL if available, otherwise fallback to host/port
            const connectionConfig = redisUrl !== 'redis://localhost:6379'
                ? { url: redisUrl, connectTimeout: 5000, lazyConnect: true }
                : { host: redisHost, port: redisPort, connectTimeout: 5000, lazyConnect: true };
            auditQueue = new Queue('seo-audit', {
                connection: connectionConfig,
            });
            // Test the connection with a timeout
            const connectPromise = auditQueue.waitUntilReady();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000));
            await Promise.race([connectPromise, timeoutPromise]);
            isQueueAvailable = true;
            console.log('✅ Queue initialized successfully');
        }
        else {
            console.log('⚠️ No REDIS_URL configured, queue will not be available');
            auditQueue = null;
            isQueueAvailable = false;
        }
    }
    catch (error) {
        console.warn('⚠️ Queue not available, will process jobs directly:', error instanceof Error ? error.message : 'Unknown error');
        auditQueue = null;
        isQueueAvailable = false;
        // Clean up if queue was created but failed to connect
        if (auditQueue) {
            try {
                await auditQueue.close();
            }
            catch (e) {
                // Ignore cleanup errors
            }
            auditQueue = null;
        }
    }
}
// Initialize queue
initializeQueue();
export { auditQueue, isQueueAvailable };
