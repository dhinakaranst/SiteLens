import AuditResult from '../models/AuditResult.js';
import axios from "axios";
import * as cheerio from "cheerio";

// Conditional import for audit queue
let auditQueue: any = null;
try {
  const { auditQueue: queue } = await import('../queue/auditQueue.js');
  auditQueue = queue;
} catch (error) {
  console.log('ℹ️ Audit queue not available, running without queue functionality');
}

interface AuditJobData {
  url: string;
  userId: string;
}

export async function enqueueAuditJob(data: AuditJobData) {
  if (!auditQueue) {
    console.log('⚠️ Audit queue not available, skipping job enqueue');
    return;
  }
  
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
  try {
    // Fetch the HTML content
    const { data } = await axios.get(url, { timeout: 15000 });

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    // Extract title and meta description
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content") || "";

    // Extract headings
    const headings = {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
      h4: $("h4").length,
      h5: $("h5").length,
      h6: $("h6").length,
    };

    // You can expand this to extract images, links, OpenGraph, etc.

    return {
      url,
      title,
      description,
      headings,
      // Add more fields as you build out your analysis
    };
  } catch (error) {
    console.error("Error crawling site:", error);
    return { error: "Failed to fetch or analyze the site." };
  }
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
  