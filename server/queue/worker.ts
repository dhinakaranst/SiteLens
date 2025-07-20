import { Worker } from 'bullmq';
import { performSEOCrawl } from '../services/seoAuditService.js';

console.log('🔄 Worker is starting...');

// Redis configuration with environment variable support
const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || 'redis://localhost:6379';

// Check if Redis is configured
if (!process.env.REDIS_URL && !process.env.REDISCLOUD_URL) {
  console.log('⚠️  No Redis configuration found. Worker will not start.');
  console.log('   Set REDIS_URL or REDISCLOUD_URL environment variable to enable queue processing.');
  process.exit(0);
}

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
  } catch (error) {
    console.error('❌ Invalid Redis URL:', redisUrl);
    process.exit(1);
  }
})();

console.log('🔗 Worker connecting to Redis:', `${redisConfig.host}:${redisConfig.port}`);

let worker: Worker;

async function startWorker() {
  try {
    worker = new Worker(
      'seo-audit',
      async (job) => {
        console.log(`🎯 Processing job ${job.id} for URL: ${job.data.url}`);
        try {
          const { url } = job.data;
          const result = await performSEOCrawl(url);
          console.log('✅ SEO Audit Result:', result);
          return result;
        } catch (error) {
          console.error(`❌ Job ${job.id} failed:`, error);
          throw error;
        }
      },
      {
        connection: redisConfig,
        concurrency: 2, // Process 2 jobs concurrently
      }
    );

    worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error('❌ Worker error:', err);
    });

    console.log('✅ Worker is running and waiting for jobs...');
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    setTimeout(() => {
      console.log('🔄 Retrying worker connection in 10 seconds...');
      startWorker();
    }, 10000);
  }
}

// Start the worker
startWorker();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down worker...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down worker...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});
