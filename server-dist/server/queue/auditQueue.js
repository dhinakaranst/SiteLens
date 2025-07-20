import { Queue } from 'bullmq';
// Redis configuration with environment variable support
const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379';
// Parse Redis URL to get connection options
const redisConfig = (() => {
    try {
        const url = new URL(redisUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            username: url.username || undefined,
        };
    }
    catch (error) {
        console.error('❌ Invalid Redis URL, falling back to localhost');
        return {
            host: 'localhost',
            port: 6379,
        };
    }
})();
console.log('🔗 BullMQ connecting to Redis:', `${redisConfig.host}:${redisConfig.port}`);
export const auditQueue = new Queue('seo-audit', {
    connection: redisConfig,
    defaultJobOptions: {
        removeOnComplete: 10, // Keep only 10 completed jobs
        removeOnFail: 5, // Keep only 5 failed jobs
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    },
});
