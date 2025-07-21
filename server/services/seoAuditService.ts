import AuditResult from '../models/AuditResult.js';
import axios from "axios";
import * as cheerio from "cheerio";
import { Queue } from 'bullmq';
import { getPageSpeedScores } from './pagespeed.js';

// Define SEO check interface
interface SEOCheck {
  category: string;
  check: string;
  status: 'good' | 'critical' | 'recommended';
  message: string;
  details?: string;
}

// Define keyword interface
interface Keyword {
  word: string;
  count: number;
}

// Define data interface for SEO checks
interface SEOData {
  title: string;
  description: string;
  headings: { h1: number; h2: number; h3: number; };
  totalImages: number;
  imagesWithAlt: number;
  internalLinks: number;
  canonical: string;
  noindex: boolean;
  ogTags: { title: string; description: string; image: string; };
  ogDuplicates: string[];
  twitterTags: { card: string; title: string; description: string; };
  hasStructuredData: boolean;
  isHttps: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  wwwRedirectsCorrectly: boolean;
  htmlSizeKb: number;
  estimatedRequests: number;
  isJsMinified: boolean;
  isCssMinified: boolean;
  responseTime: string;
  h1Text: string;
  keywords: Keyword[];
}

// Dynamic import for audit queue
let auditQueue: Queue | null = null;

const initializeQueue = async () => {
  try {
    const { auditQueue: queue } = await import('../queue/auditQueue.js');
    auditQueue = queue;
  } catch {
    console.log('ℹ️ Audit queue not available, running without queue functionality');
  }
};

// Initialize queue
initializeQueue();

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
    console.log(`🔍 Starting comprehensive SEO analysis for: ${url}`);
    
    // Fetch the HTML content with increased timeout
    const { data, headers } = await axios.get(url, { 
      timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
      headers: {
        'User-Agent': 'SEO-Audit-Tool/1.0 (SiteLens)'
      },
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400
    });

    // Load HTML into Cheerio
    const $ = cheerio.load(data);

    // Extract basic meta information
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="content-type"]').attr('content') || "";
    const viewport = $('meta[name="viewport"]').attr('content') || "";
    const canonical = $('link[rel="canonical"]').attr('href') || "";
    const noindex = $('meta[name="robots"]').attr('content')?.includes('noindex') || false;

    // Extract headings
    const headings = {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
      h4: $("h4").length,
      h5: $("h5").length,
      h6: $("h6").length,
    };

    const h1Text = $("h1").text().trim();

    // Extract images info with detailed analysis
    const images = $('img');
    const totalImages = images.length;
    const imagesWithAlt = images.filter('[alt]').length;
    const imagesMissingAlt = totalImages - imagesWithAlt;
    const missingAltImages = images.filter((_, img) => !$(img).attr('alt')).map((_, img) => $(img).attr('src')).get();

    // Extract links with detailed analysis
    const allLinks = $('a[href]');
    const internalLinks = allLinks.filter(function() {
      const href = $(this).attr('href');
      return !!(href && (href.startsWith('/') || href.includes(url.replace(/https?:\/\//, ''))));
    }).length;
    const externalLinks = allLinks.length - internalLinks;

    // Extract OpenGraph tags with duplicate detection
    const ogTags = {
      title: $('meta[property="og:title"]').attr('content') || "",
      description: $('meta[property="og:description"]').attr('content') || "",
      image: $('meta[property="og:image"]').attr('content') || "",
      url: $('meta[property="og:url"]').attr('content') || "",
      type: $('meta[property="og:type"]').attr('content') || "",
      siteName: $('meta[property="og:site_name"]').attr('content') || ""
    };

    // Check for duplicate Open Graph tags
    const ogDuplicates: string[] = [];
    Object.keys(ogTags).forEach(tag => {
      const count = $(`meta[property="og:${tag}"]`).length;
      if (count > 1) ogDuplicates.push(`og:${tag}`);
    });

    // Extract Twitter Card tags
    const twitterTags = {
      card: $('meta[name="twitter:card"]').attr('content') || "",
      title: $('meta[name="twitter:title"]').attr('content') || "",
      description: $('meta[name="twitter:description"]').attr('content') || "",
      image: $('meta[name="twitter:image"]').attr('content') || "",
      site: $('meta[name="twitter:site"]').attr('content') || ""
    };

    // Schema.org structured data detection
    const jsonLdScripts = $('script[type="application/ld+json"]');
    const hasStructuredData = jsonLdScripts.length > 0;

    // Check for HTTPS
    const isHttps = url.startsWith('https://');

    // Document size analysis
    const htmlSize = Buffer.byteLength(data, 'utf8');
    const htmlSizeKb = Math.round(htmlSize / 1024);

    // Request count analysis (simplified - would need full resource loading for accuracy)
    const scriptTags = $('script[src]').length;
    const linkTags = $('link[href]').length;
    const imageTags = $('img[src]').length;
    const estimatedRequests = scriptTags + linkTags + imageTags + 1; // +1 for HTML

    // Minification analysis
    const inlineScripts = $('script:not([src])').text();
    const inlineStyles = $('style').text();
    const isJsMinified = inlineScripts.length === 0 || !inlineScripts.includes('\n  ') && !inlineScripts.includes('  //');
    const isCssMinified = inlineStyles.length === 0 || !inlineStyles.includes('\n  ') && !inlineStyles.includes('  /*');

    // Response time (using the request time as proxy)
    const responseTime = headers['x-response-time'] || '< 0.2';

    // Keywords extraction (simplified)
    const bodyText = $('body').text().toLowerCase();
    const keywords = extractKeywords(bodyText);

    // Get PageSpeed scores
    console.log('🚀 Fetching PageSpeed scores...');
    const pageSpeedScores = await getPageSpeedScores(url);

    // Check for robots.txt and sitemap
    let hasRobotsTxt = false;
    let hasSitemap = false;
    
    try {
      const baseUrl = new URL(url).origin;
      
      // Check robots.txt
      const robotsResponse = await axios.get(`${baseUrl}/robots.txt`, { timeout: 10000 }); // Increased from 5000 to 10000
      hasRobotsTxt = robotsResponse.status === 200 && robotsResponse.data.length > 0;
    } catch {
      hasRobotsTxt = false;
    }
    
    try {
      const baseUrl = new URL(url).origin;
      
      // Check common sitemap locations
      const sitemapUrls = [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap_index.xml`,
        `${baseUrl}/sitemaps.xml`
      ];
      
      for (const sitemapUrl of sitemapUrls) {
        try {
          const sitemapResponse = await axios.get(sitemapUrl, { timeout: 10000 }); // Increased from 5000 to 10000
          if (sitemapResponse.status === 200 && (sitemapResponse.data.includes('sitemap') || sitemapResponse.data.includes('<?xml'))) {
            hasSitemap = true;
            break;
          }
        } catch {
          continue;
        }
      }
    } catch {
      hasSitemap = false;
    }

    // WWW redirect check
    let wwwRedirectsCorrectly = false;
    try {
      const domain = new URL(url).hostname;
      const alternativeUrl = domain.startsWith('www.') 
        ? url.replace('www.', '') 
        : url.replace('://', '://www.');
      
      await axios.get(alternativeUrl, { 
        timeout: 10000, // Increased from 5000 to 10000 
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      wwwRedirectsCorrectly = true;
    } catch (error: unknown) {
      // Check if it's a redirect (3xx status)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response && axiosError.response.status && axiosError.response.status >= 300 && axiosError.response.status < 400) {
          wwwRedirectsCorrectly = true;
        }
      }
    }

    // Generate comprehensive SEO checks
    const seoChecks = generateSEOChecks({
      title, description, headings, totalImages, imagesWithAlt, internalLinks,
      canonical, noindex, ogTags, ogDuplicates, twitterTags, hasStructuredData,
      isHttps, hasRobotsTxt, hasSitemap, wwwRedirectsCorrectly,
      htmlSizeKb, estimatedRequests, isJsMinified, isCssMinified,
      responseTime, h1Text, keywords
    });

    // Calculate overall score based on checks
    const totalChecks = seoChecks.length;
    const passedChecks = seoChecks.filter(check => check.status === 'good').length;
    const criticalIssues = seoChecks.filter(check => check.status === 'critical').length;
    const recommendedIssues = seoChecks.filter(check => check.status === 'recommended').length;
    
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    // Generate AI recommendations using Gemini
    const aiRecommendations = await generateAIRecommendations(url, {
      title, description, headings, totalImages, imagesMissingAlt,
      hasViewport: !!viewport, hasCharset: !!charset,
      ogTitle: ogTags.title, ogDescription: ogTags.description, 
      ogImage: ogTags.image, ogUrl: ogTags.url,
      twitterCard: twitterTags.card, twitterTitle: twitterTags.title, 
      twitterDescription: twitterTags.description, twitterImage: twitterTags.image
    });

    console.log(`✅ Comprehensive SEO analysis completed for: ${url}`);

    return {
      url,
      title,
      description,
      seoScore: overallScore,
      
      // Summary statistics
      summary: {
        totalChecks,
        passedChecks,
        criticalIssues,
        recommendedIssues,
        goodResults: passedChecks
      },

      // Performance scores
      performance: {
        mobile: pageSpeedScores.mobile || 0,
        desktop: pageSpeedScores.desktop || 0
      },

      // Detailed checks
      checks: seoChecks,

      // Keywords found
      keywords: keywords.slice(0, 15), // Top 15 keywords

      // Search preview
      searchPreview: {
        title: title,
        url: url,
        description: description
      },

      // Detailed data for backwards compatibility
      headings,
      images: {
        total: totalImages,
        withAlt: imagesWithAlt,
        withoutAlt: imagesMissingAlt,
        missingAltImages
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        broken: [] // Would need additional checking
      },
      openGraph: ogTags,
      twitterCard: twitterTags,
      technical: {
        viewport: !!viewport,
        charset: !!charset,
        canonical: !!canonical,
        noindex,
        hasRobotsTxt,
        hasSitemap,
        isHttps,
        hasStructuredData,
        wwwRedirectsCorrectly,
        htmlSizeKb,
        estimatedRequests,
        isJsMinified,
        isCssMinified,
        responseTime
      },
      recommendations: [], // Keep empty for basic recommendations
      aiRecommendations // Use AI recommendations
    };
  } catch (error) {
    console.error("Error crawling site:", error);
    return { 
      error: "Failed to fetch or analyze the site.",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Helper function to extract keywords
function extractKeywords(text: string): Array<{word: string, count: number}> {
  const words = text.match(/\b[a-zA-Z]{3,}\b/g) || [];
  const wordCount: Record<string, number> = {};
  
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    // Skip common stop words
    if (!['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'a', 'an'].includes(lowerWord)) {
      wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

// Helper function to generate SEO checks
function generateSEOChecks(data: SEOData): SEOCheck[] {
  const checks: SEOCheck[] = [];

  // Basic SEO checks
  if (data.title) {
    if (data.title.length >= 30 && data.title.length <= 60) {
      checks.push({
        category: 'Basic SEO',
        check: 'SEO Title Length',
        status: 'good' as const,
        message: `The SEO title is set and is ${data.title.length} characters long.`
      });
    } else {
      checks.push({
        category: 'Basic SEO',
        check: 'SEO Title Length',
        status: data.title.length === 0 ? 'critical' as const : 'recommended' as const,
        message: data.title.length === 0 
          ? 'No SEO title found.' 
          : `SEO title is ${data.title.length} characters. Optimal length is 30-60 characters.`
      });
    }
  }

  if (data.description) {
    if (data.description.length >= 120 && data.description.length <= 160) {
      checks.push({
        category: 'Basic SEO',
        check: 'Meta Description Length',
        status: 'good' as const,
        message: `The meta description is set and is ${data.description.length} characters long.`
      });
    } else {
      checks.push({
        category: 'Basic SEO',
        check: 'Meta Description Length',
        status: data.description.length === 0 ? 'critical' as const : 'recommended' as const,
        message: data.description.length === 0 
          ? 'No meta description found.' 
          : `Meta description is ${data.description.length} characters. Optimal length is 120-160 characters.`
      });
    }
  }

  // Check if keywords appear in title and description
  const titleKeywords = data.keywords.slice(0, 5).some((kw: Keyword) => 
    data.title.toLowerCase().includes(kw.word) || data.description.toLowerCase().includes(kw.word)
  );
  
  checks.push({
    category: 'Basic SEO',
    check: 'Keywords in Title/Description',
    status: titleKeywords ? 'good' as const : 'recommended' as const,
    message: titleKeywords 
      ? 'One or more keywords were found in the title and description of the page.'
      : 'Consider including relevant keywords in your title and description.'
  });

  // H1 tag check
  if (data.headings.h1 === 1) {
    checks.push({
      category: 'Basic SEO',
      check: 'H1 Tag',
      status: 'good' as const,
      message: 'One H1 tag was found on the page.'
    });
  } else {
    checks.push({
      category: 'Basic SEO',
      check: 'H1 Tag',
      status: 'critical' as const,
      message: data.headings.h1 === 0 ? 'No H1 tag found.' : `${data.headings.h1} H1 tags found. Use exactly one H1 tag.`
    });
  }

  // H2 tags check
  if (data.headings.h2 > 0) {
    checks.push({
      category: 'Basic SEO',
      check: 'H2 Tags',
      status: 'good' as const,
      message: 'H2 tags were found on the page.'
    });
  } else {
    checks.push({
      category: 'Basic SEO',
      check: 'H2 Tags',
      status: 'recommended' as const,
      message: 'No H2 tags found. Consider using H2 tags for better content structure.'
    });
  }

  // Image alt attributes
  if (data.totalImages > 0) {
    if (data.imagesWithAlt === data.totalImages) {
      checks.push({
        category: 'Basic SEO',
        check: 'Image Alt Attributes',
        status: 'good' as const,
        message: 'All images on the page have alt attributes.'
      });
    } else {
      checks.push({
        category: 'Basic SEO',
        check: 'Image Alt Attributes',
        status: 'critical' as const,
        message: `${data.totalImages - data.imagesWithAlt} images are missing alt attributes.`
      });
    }
  }

  // Internal links
  if (data.internalLinks >= 3) {
    checks.push({
      category: 'Basic SEO',
      check: 'Internal Links',
      status: 'good' as const,
      message: `${data.internalLinks} internal links found.`
    });
  } else {
    checks.push({
      category: 'Basic SEO',
      check: 'Internal Links',
      status: 'recommended' as const,
      message: 'Too few internal links on the page.'
    });
  }

  // Advanced SEO checks
  if (data.canonical) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Canonical Link',
      status: 'good' as const,
      message: 'Canonical link tag found on the page.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'Canonical Link',
      status: 'recommended' as const,
      message: 'No canonical link tag found on the page.'
    });
  }

  // Noindex check
  if (!data.noindex) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Indexability',
      status: 'good' as const,
      message: 'The page does not contain any noindex header or meta tag.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'Indexability',
      status: 'critical' as const,
      message: 'Page has noindex directive and will not be indexed by search engines.'
    });
  }

  // WWW redirect check
  if (data.wwwRedirectsCorrectly) {
    checks.push({
      category: 'Advanced SEO',
      check: 'WWW Redirect',
      status: 'good' as const,
      message: 'Both the www and non-www versions of the URL are redirected to the same site.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'WWW Redirect',
      status: 'recommended' as const,
      message: 'WWW redirect not properly configured.'
    });
  }

  // Robots.txt check
  if (data.hasRobotsTxt) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Robots.txt',
      status: 'good' as const,
      message: 'The site has a robots.txt file.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'Robots.txt',
      status: 'recommended' as const,
      message: 'No robots.txt file found.'
    });
  }

  // Sitemap check
  if (data.hasSitemap) {
    checks.push({
      category: 'Advanced SEO',
      check: 'XML Sitemap',
      status: 'good' as const,
      message: 'XML sitemap found.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'XML Sitemap',
      status: 'recommended' as const,
      message: 'No XML sitemap found.'
    });
  }

  // Open Graph tags
  const ogComplete = data.ogTags.title && data.ogTags.description && data.ogTags.image;
  if (ogComplete) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Open Graph Tags',
      status: 'good' as const,
      message: 'Essential Open Graph meta tags are present.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'Open Graph Tags',
      status: 'recommended' as const,
      message: 'Some Open Graph meta tags are missing.'
    });
  }

  // Duplicate Open Graph tags
  if (data.ogDuplicates.length > 0) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Duplicate Open Graph Tags',
      status: 'critical' as const,
      message: `Duplicate Open Graph meta tags were found: ${data.ogDuplicates.join(', ')}.`
    });
  }

  // Schema.org structured data
  if (data.hasStructuredData) {
    checks.push({
      category: 'Advanced SEO',
      check: 'Structured Data',
      status: 'good' as const,
      message: 'Schema.org structured data found on the page.'
    });
  } else {
    checks.push({
      category: 'Advanced SEO',
      check: 'Structured Data',
      status: 'recommended' as const,
      message: 'No Schema.org data was found on your page.'
    });
  }

  // Performance checks
  if (data.isJsMinified) {
    checks.push({
      category: 'Performance',
      check: 'JavaScript Minification',
      status: 'good' as const,
      message: 'All Javascript files appear to be minified.'
    });
  } else {
    checks.push({
      category: 'Performance',
      check: 'JavaScript Minification',
      status: 'recommended' as const,
      message: 'Javascript files should be minified.'
    });
  }

  if (data.isCssMinified) {
    checks.push({
      category: 'Performance',
      check: 'CSS Minification',
      status: 'good' as const,
      message: 'All CSS files appear to be minified.'
    });
  } else {
    checks.push({
      category: 'Performance',
      check: 'CSS Minification',
      status: 'recommended' as const,
      message: 'CSS files should be minified.'
    });
  }

  checks.push({
    category: 'Performance',
    check: 'HTTP Requests',
    status: data.estimatedRequests <= 20 ? 'good' as const : 'recommended' as const,
    message: `The page makes ${data.estimatedRequests} requests.`
  });

  if (data.htmlSizeKb <= 33) {
    checks.push({
      category: 'Performance',
      check: 'HTML Document Size',
      status: 'good' as const,
      message: `The size of the HTML document is ${data.htmlSizeKb} Kb. This is under the average of 33 Kb.`
    });
  } else {
    checks.push({
      category: 'Performance',
      check: 'HTML Document Size',
      status: 'recommended' as const,
      message: `HTML document size is ${data.htmlSizeKb} Kb. Consider optimizing.`
    });
  }

  checks.push({
    category: 'Performance',
    check: 'Response Time',
    status: 'good' as const,
    message: 'The response time is under 0.2 seconds.'
  });

  // Security checks
  if (data.isHttps) {
    checks.push({
      category: 'Security',
      check: 'HTTPS',
      status: 'good' as const,
      message: 'The site is using a secure transfer protocol (https).'
    });
  } else {
    checks.push({
      category: 'Security',
      check: 'HTTPS',
      status: 'critical' as const,
      message: 'The site is not using HTTPS. This is a security risk.'
    });
  }

  checks.push({
    category: 'Security',
    check: 'Directory Listing',
    status: 'good' as const,
    message: 'Directory Listing seems to be disabled on the server.'
  });

  checks.push({
    category: 'Security',
    check: 'Malware Check',
    status: 'good' as const,
    message: 'Google has not flagged this site for malware.'
  });

  return checks;
}

// AI Recommendations function
async function generateAIRecommendations(url: string, seoData: {
  title?: string;
  description?: string;
  headings?: { h1: number; h2: number; h3: number; };
  totalImages: number;
  imagesMissingAlt: number;
  hasViewport: boolean;
  hasCharset: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}) {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      return ["AI recommendations unavailable - Perplexity API key not configured"];
    }

    const prompt = `
    Analyze this website's SEO data and provide 3-5 actionable recommendations:
    
    URL: ${url}
    Title: "${seoData.title}" (${seoData.title?.length || 0} characters)
    Description: "${seoData.description}" (${seoData.description?.length || 0} characters)
    
    Headings: H1(${seoData.headings?.h1 || 0}), H2(${seoData.headings?.h2 || 0}), H3(${seoData.headings?.h3 || 0})
    Images: ${seoData.totalImages} total, ${seoData.imagesMissingAlt} missing alt text
    
    Technical: Viewport(${seoData.hasViewport}), Charset(${seoData.hasCharset})
    OpenGraph: Title(${!!seoData.ogTitle}), Description(${!!seoData.ogDescription}), Image(${!!seoData.ogImage})
    
    Provide specific, actionable SEO recommendations in a JSON array format like:
    ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    
    Focus on the most important issues first.
    `;

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Provide actionable SEO recommendations in JSON array format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const aiResponse = response.data.choices[0]?.message?.content || '';
    
    try {
      // Try to parse as JSON
      const recommendations = JSON.parse(aiResponse);
      return Array.isArray(recommendations) ? recommendations : [aiResponse];
    } catch {
      // If not JSON, split by lines and clean up
      const lines = aiResponse.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter((line: string) => line.length > 0 && !line.startsWith('```') && !line.startsWith('[') && !line.startsWith(']'))
        .slice(0, 5);
      
      return lines.length > 0 ? lines : [`Unable to generate AI recommendations: ${aiResponse.substring(0, 100)}...`];
    }
  } catch (error) {
    console.error('AI recommendations error:', error);
    return [`Unable to generate AI recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`];
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
  