import { auditQueue, isQueueAvailable } from '../queue/auditQueue.js';
import AuditResult from '../models/AuditResult.js';
import axios from "axios";
import * as cheerio from "cheerio";
export async function enqueueAuditJob(data) {
    if (isQueueAvailable && auditQueue) {
        try {
            await auditQueue.add('audit', data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 3000,
                },
            });
            console.log(`✅ Audit job added to queue for ${data.url}`);
            return;
        }
        catch (error) {
            console.warn('⚠️ Failed to add job to queue, processing directly:', error);
        }
    }
    // Fallback: process directly if queue is not available
    console.log(`📝 Processing audit job directly for ${data.url}`);
    await performSeoAudit(data.url, data.userId);
}
export async function performSeoAudit(url, userId) {
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
export async function performSEOCrawl(url) {
    if (isQueueAvailable && auditQueue) {
        try {
            await auditQueue.add('seo-audit', { url });
            console.log(`📩 Job added to queue for URL: ${url}`);
            return;
        }
        catch (error) {
            console.warn('⚠️ Failed to add crawl job to queue, processing directly:', error);
        }
    }
    // Fallback: process directly if queue is not available
    console.log(`📝 Processing SEO crawl directly for URL: ${url}`);
    const result = await fetchSEOMetadata(url);
    console.log('✅ SEO Crawl Result:', result);
    return result;
}
// Rename the previous performSEOCrawl to fetchSEOMetadata for clarity
export const fetchSEOMetadata = async (url) => {
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
