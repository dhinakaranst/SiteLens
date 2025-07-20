import { Queue } from 'bullmq';
let auditQueue = null;
const initializeQueue = async () => {
    // Only create queue if REDIS_URL is provided
    if (process.env.REDIS_URL) {
        try {
            auditQueue = new Queue('seo-audit', {
                connection: {
                    url: process.env.REDIS_URL,
                },
            });
            console.log('✅ Audit queue initialized with Redis');
        }
        catch (error) {
            console.warn('⚠️ Failed to initialize audit queue:', error);
            auditQueue = null;
        }
    }
    else {
        console.log('ℹ️ No Redis available, audit queue disabled');
    }
};
// Initialize queue
initializeQueue().catch(console.error);
export { auditQueue };
