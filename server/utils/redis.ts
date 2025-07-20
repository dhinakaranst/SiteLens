
import { createClient } from 'redis';

// Redis configuration with environment variable support
const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379';

console.log('🔗 Connecting to Redis:', redisUrl.replace(/:[^:@]*@/, ':***@')); // Hide password in logs

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // Connection timeout
    connectTimeout: 10000,
  },
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

// Connect with error handling
let isRedisConnected = false;

async function connectRedis() {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    isRedisConnected = false;
    return false;
  }
}

// Initialize connection
connectRedis();

export { redisClient, isRedisConnected, connectRedis };
export default redisClient;
