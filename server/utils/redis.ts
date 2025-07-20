
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

const initializeRedis = async () => {
  // Only connect to Redis if REDIS_URL is provided
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000, // 5 second connection timeout
        },
      });

      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis Client Error (continuing without Redis):', err.message);
        redisClient = null;
      });
      
      redisClient.on('connect', () => console.log('✅ Redis connected successfully'));
      redisClient.on('disconnect', () => console.log('📡 Redis disconnected'));
      
      // Set a timeout for Redis connection to prevent blocking startup
      const connectionTimeout = setTimeout(() => {
        console.warn('⚠️ Redis connection timeout, continuing without Redis');
        redisClient = null;
      }, 10000); // 10 second timeout

      await redisClient.connect();
      clearTimeout(connectionTimeout);
      
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without Redis:', error instanceof Error ? error.message : 'Unknown error');
      redisClient = null;
    }
  } else {
    console.log('ℹ️ No REDIS_URL provided, running without Redis');
  }
};

// Non-blocking Redis initialization with timeout
const initRedisWithTimeout = () => {
  return Promise.race([
    initializeRedis(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis initialization timeout')), 15000)
    )
  ]).catch((error) => {
    console.warn('⚠️ Redis initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    redisClient = null;
  });
};

// Initialize Redis with timeout protection
initRedisWithTimeout();

export default redisClient;
