import axios from 'axios';
import * as cheerio from 'cheerio';
import { getPageSpeedScores } from './services/pagespeed.js';

interface SEOReport {
  url: string;
  title: string;
  description: string;
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    missingAltImages: string[];
  };
  links: {
    internal: number;
    external: number;
    broken: string[];
  };
  openGraph: {
    hasOgTitle: boolean;
    hasOgDescription: boolean;
    hasOgImage: boolean;
    hasOgUrl: boolean;
  };
  twitterCard: {
    hasCardType: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
    hasImage: boolean;
  };
  technical: {
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    viewport: boolean;
    charset: boolean;
  };
  performance: {
    mobile: number | null;
    desktop: number | null;
  };
  seoScore: number;
  recommendations: string[];
}

export async function analyzeWebsite(url: string): Promise<SEOReport> {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SEO-Audit-Tool/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Basic SEO elements
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Heading analysis
    const headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
      h4: $('h4').length,
      h5: $('h5').length,
      h6: $('h6').length,
    };

    // Image analysis
    const images = $('img');
    const imagesWithoutAlt: string[] = [];
    let imagesWithAlt = 0;

    images.each((_, element) => {
      const alt = $(element).attr('alt');
      const src = $(element).attr('src') || 'Unknown source';
      
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt.push(src);
      } else {
        imagesWithAlt++;
      }
    });

    // Link analysis
    const links = $('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    const brokenLinks: string[] = [];

    const baseUrl = new URL(url);
    
    links.each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const linkUrl = new URL(href, url);
          if (linkUrl.hostname === baseUrl.hostname) {
            internalLinks++;
          } else {
            externalLinks++;
          }
        } catch {
          // Invalid URL
          brokenLinks.push(href);
        }
      }
    });

    // OpenGraph analysis
    const openGraph = {
      hasOgTitle: $('meta[property="og:title"]').length > 0,
      hasOgDescription: $('meta[property="og:description"]').length > 0,
      hasOgImage: $('meta[property="og:image"]').length > 0,
      hasOgUrl: $('meta[property="og:url"]').length > 0,
    };

    // Twitter Card analysis
    const twitterCard = {
      hasCardType: $('meta[name="twitter:card"]').length > 0,
      hasTitle: $('meta[name="twitter:title"]').length > 0,
      hasDescription: $('meta[name="twitter:description"]').length > 0,
      hasImage: $('meta[name="twitter:image"]').length > 0,
    };

    // Technical SEO
    const viewport = $('meta[name="viewport"]').length > 0;
    const charset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;

    // Check robots.txt and sitemap
    let hasRobotsTxt = false;
    let hasSitemap = false;

    try {
      const robotsResponse = await axios.get(`${baseUrl.origin}/robots.txt`, { timeout: 5000 });
      hasRobotsTxt = robotsResponse.status === 200;
    } catch {}

    try {
      const sitemapResponse = await axios.get(`${baseUrl.origin}/sitemap.xml`, { timeout: 5000 });
      hasSitemap = sitemapResponse.status === 200;
    } catch {}

    // Get real PageSpeed Insights data
    console.log('Fetching PageSpeed Insights data...');
    const performance = await getPageSpeedScores(url);
    console.log('PageSpeed results:', performance);

    // Calculate SEO Score
    let score = 0;
    const recommendations: string[] = [];

    // Title evaluation (20 points)
    if (title && title.length > 0) {
      if (title.length >= 30 && title.length <= 60) {
        score += 20;
      } else {
        score += 10;
        recommendations.push(title.length < 30 ? 'Title is too short. Aim for 30-60 characters.' : 'Title is too long. Keep it under 60 characters.');
      }
    } else {
      recommendations.push('Missing title tag. Add a descriptive title.');
    }

    // Description evaluation (15 points)
    if (description && description.length > 0) {
      if (description.length >= 120 && description.length <= 160) {
        score += 15;
      } else {
        score += 8;
        recommendations.push(description.length < 120 ? 'Meta description is too short. Aim for 120-160 characters.' : 'Meta description is too long. Keep it under 160 characters.');
      }
    } else {
      recommendations.push('Missing meta description. Add a compelling description.');
    }

    // Headings evaluation (15 points)
    if (headings.h1 === 1) {
      score += 15;
    } else if (headings.h1 === 0) {
      recommendations.push('Missing H1 tag. Add exactly one H1 per page.');
    } else {
      score += 5;
      recommendations.push('Multiple H1 tags found. Use only one H1 per page.');
    }

    // Images evaluation (10 points)
    if (images.length > 0) {
      const altPercentage = (imagesWithAlt / images.length) * 100;
      if (altPercentage === 100) {
        score += 10;
      } else if (altPercentage >= 80) {
        score += 7;
        recommendations.push('Some images missing alt text. Add descriptive alt attributes.');
      } else {
        score += 3;
        recommendations.push('Many images missing alt text. This affects accessibility and SEO.');
      }
    }

    // OpenGraph evaluation (10 points)
    const ogCount = Object.values(openGraph).filter(Boolean).length;
    score += Math.floor((ogCount / 4) * 10);
    if (ogCount < 4) {
      recommendations.push('Incomplete OpenGraph tags. Add og:title, og:description, og:image, and og:url.');
    }

    // Technical SEO evaluation (15 points)
    if (viewport) score += 5;
    else recommendations.push('Missing viewport meta tag for mobile responsiveness.');
    
    if (charset) score += 5;
    else recommendations.push('Missing charset declaration.');
    
    if (hasRobotsTxt) score += 3;
    else recommendations.push('Missing robots.txt file.');
    
    if (hasSitemap) score += 2;
    else recommendations.push('Missing XML sitemap.');

    // Performance evaluation (15 points)
    if (performance.mobile && performance.desktop) {
      const avgPerformance = (performance.mobile + performance.desktop) / 2;
      if (avgPerformance >= 90) {
        score += 15;
      } else if (avgPerformance >= 70) {
        score += 10;
        recommendations.push('Good performance, but there\'s room for improvement.');
      } else {
        score += 5;
        recommendations.push('Poor performance scores. Optimize images and reduce load times.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent! Your website follows SEO best practices.');
    }

    return {
      url,
      title,
      description,
      headings,
      images: {
        total: images.length,
        withAlt: imagesWithAlt,
        withoutAlt: imagesWithoutAlt.length,
        missingAltImages: imagesWithoutAlt.slice(0, 5), // Show first 5
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        broken: brokenLinks.slice(0, 5), // Show first 5
      },
      openGraph,
      twitterCard,
      technical: {
        hasRobotsTxt,
        hasSitemap,
        viewport,
        charset,
      },
      performance,
      seoScore: Math.min(score, 100),
      recommendations: recommendations.slice(0, 8), // Top 8 recommendations
    };

  } catch (error) {
    throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}