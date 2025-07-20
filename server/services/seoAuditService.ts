import AuditResult from '../models/AuditResult.js';
import axios from "axios";
import * as cheerio from "cheerio";

// Optional queue support - only import if Redis is configured
let auditQueue: any = null;
let isQueueEnabled = false;

async function initializeQueue() {
  try {
    // Only initialize queue if Redis URL is provided
    if (process.env.REDIS_URL || process.env.REDISCLOUD_URL) {
      const { auditQueue: queue } = await import('../queue/auditQueue.js');
      auditQueue = queue;
      isQueueEnabled = true;
      console.log('✅ BullMQ queue initialized');
    } else {
      console.log('ℹ️  Redis not configured - queue functionality disabled');
    }
  } catch (error) {
    console.error('❌ Failed to initialize queue:', error);
    isQueueEnabled = false;
  }
}

// Initialize queue on module load
initializeQueue();

interface AuditJobData {
  url: string;
  userId: string;
}

export async function enqueueAuditJob(data: AuditJobData) {
  if (!isQueueEnabled || !auditQueue) {
    console.log('⚠️  Queue not available, skipping job enqueue');
    return;
  }

  try {
    await auditQueue.add('audit', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });

    console.log(`📩 Audit job added for ${data.url}`);
  } catch (error) {
    console.error('❌ Failed to enqueue audit job:', error);
  }
}

export async function performSeoAudit(url: string, userId: string) {
  console.log(`Performing SEO audit for URL: ${url}, User: ${userId}`);

  // Simulate actual work
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate a dummy audit result
  const result = {
    score: Math.floor(Math.random() * 100),
    message: 'Dummy SEO audit result',
    timestamp: new Date().toISOString()
  };

  // Persist result in MongoDB
  try {
    await AuditResult.create({ url, userId, result });
    console.log(`✅ SEO audit completed and result saved for ${url}`);
  } catch (error) {
    console.error('❌ Failed to save audit result:', error);
  }
}

export async function performSEOCrawl(url: string) {
  if (!isQueueEnabled || !auditQueue) {
    console.log('⚠️  Queue not available, performing direct SEO crawl');
    // Fallback to direct processing
    return await fetchSEOMetadata(url);
  }

  try {
    await auditQueue.add('seo-audit', { url });
    console.log(`📩 Job added to queue for URL: ${url}`);
  } catch (error) {
    console.error('❌ Failed to add job to queue:', error);
    // Fallback to direct processing
    return await fetchSEOMetadata(url);
  }
}

// Rename the previous performSEOCrawl to fetchSEOMetadata for clarity
export const fetchSEOMetadata = async (url: string) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Tool/1.0)',
      },
    });
    const $ = cheerio.load(data);
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content") || "";

    return {
      url,
      title,
      description,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch SEO metadata for ${url}:`, error);
    throw error;
  }
};
  