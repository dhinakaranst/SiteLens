import { auditQueue } from '../queue/auditQueue.js';
import AuditResult from '../models/AuditResult.js';
import axios from "axios";
import * as cheerio from "cheerio";

interface AuditJobData {
  url: string;
  userId: string;
}

export async function enqueueAuditJob(data: AuditJobData) {
  await auditQueue.add('audit', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  });

  console.log(`Audit job added for ${data.url}`);
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
  await AuditResult.create({ url, userId, result });

  console.log(`SEO audit completed and result saved for ${url}`);
}

export async function performSEOCrawl(url: string) {
  await auditQueue.add('seo-audit', { url });
  console.log(`📩 Job added to queue for URL: ${url}`);
}

// Rename the previous performSEOCrawl to fetchSEOMetadata for clarity
export const fetchSEOMetadata = async (url: string) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content") || "";

  return {
    url,
    title,
    description,
  };
};
  