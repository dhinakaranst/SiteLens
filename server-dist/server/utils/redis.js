import { createClient } from 'redis';
let redisClient = null;
let isRedisAvailable = false;
async function initializeRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        redisClient = createClient({
            url: redisUrl,
        });
        redisClient.on('error', (err) => {
            console.error('Redis Client Error', err);
            isRedisAvailable = false;
        });
        await redisClient.connect();
        isRedisAvailable = true;
        console.log('✅ Redis connected successfully');
    }
    catch (error) {
        console.warn('⚠️ Redis not available, continuing without Redis:', error instanceof Error ? error.message : 'Unknown error');
        isRedisAvailable = false;
        redisClient = null;
    }
}
// Initialize Redis connection
initializeRedis();
export { redisClient, isRedisAvailable };
export default redisClient;
