import { createClient } from 'redis';
let redisClient = null;
const initializeRedis = async () => {
    // Only connect to Redis if REDIS_URL is provided
    if (process.env.REDIS_URL) {
        try {
            redisClient = createClient({
                url: process.env.REDIS_URL,
            });
            redisClient.on('error', (err) => console.error('Redis Client Error', err));
            redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
            await redisClient.connect();
        }
        catch (error) {
            console.warn('⚠️ Redis connection failed, continuing without Redis:', error);
            redisClient = null;
        }
    }
    else {
        console.log('ℹ️ No REDIS_URL provided, running without Redis');
    }
};
// Initialize Redis connection
initializeRedis().catch(console.error);
export default redisClient;
