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

export async function analyzeWebsite(
  url: string, 
  onProgress?: (progress: { stage: string; message: string }) => void
): Promise<SEOReport> {
  try {
    onProgress?.({ stage: 'fetching', message: 'Starting website analysis...' });
    
    // Fetch the webpage with increased timeout
    const response = await axios.get(url, {
      timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
      headers: {
        'User-Agent': 'SEO-Audit-Tool/1.0'
      }
    });

    onProgress?.({ stage: 'analyzing', message: 'Page fetched, analyzing content...' });
    const $ = cheerio.load(response.data);
    
    // Run basic SEO checks in parallel
    const [basicSeo, pageSpeed] = await Promise.all([
      // Basic SEO checks
      (async () => {
        onProgress?.({ stage: 'analyzing', message: 'Analyzing basic SEO elements...' });
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
              brokenLinks.push(href);
            }
          }
        });

        return {
          title,
          description,
          headings,
          images: {
            total: images.length,
            withAlt: imagesWithAlt,
            withoutAlt: imagesWithoutAlt.length,
            missingAltImages: imagesWithoutAlt.slice(0, 5),
          },
          links: {
            internal: internalLinks,
            external: externalLinks,
            broken: brokenLinks.slice(0, 5),
          }
        };
      })(),
      // PageSpeed analysis (runs in parallel)
      (async () => {
        onProgress?.({ stage: 'pagespeed', message: 'Running PageSpeed analysis...' });
        return getPageSpeedScores(url);
      })()
    ]);

    onProgress?.({ stage: 'analyzing', message: 'Basic SEO analysis complete, checking technical elements...' });

    // Technical SEO checks in parallel
    const [robotsTxt, sitemap] = await Promise.all([
      // Check robots.txt
      (async () => {
        try {
          const baseUrl = new URL(url);
          const robotsResponse = await axios.get(`${baseUrl.origin}/robots.txt`, { 
            timeout: 10000 // Increased from 5000 to 10000
          });
          return robotsResponse.status === 200;
        } catch {
          return false;
        }
      })(),
      // Check sitemap
      (async () => {
        try {
          const baseUrl = new URL(url);
          const sitemapResponse = await axios.get(`${baseUrl.origin}/sitemap.xml`, { 
            timeout: 10000 // Increased from 5000 to 10000
          });
          return sitemapResponse.status === 200;
        } catch {
          return false;
        }
      })()
    ]);

    // Rest of the analysis (OpenGraph, Twitter Card, etc.)
    const openGraph = {
      hasOgTitle: $('meta[property="og:title"]').length > 0,
      hasOgDescription: $('meta[property="og:description"]').length > 0,
      hasOgImage: $('meta[property="og:image"]').length > 0,
      hasOgUrl: $('meta[property="og:url"]').length > 0,
    };

    const twitterCard = {
      hasCardType: $('meta[name="twitter:card"]').length > 0,
      hasTitle: $('meta[name="twitter:title"]').length > 0,
      hasDescription: $('meta[name="twitter:description"]').length > 0,
      hasImage: $('meta[name="twitter:image"]').length > 0,
    };

    const viewport = $('meta[name="viewport"]').length > 0;
    const charset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;

    onProgress?.({ stage: 'analyzing', message: 'Technical analysis complete, calculating scores...' });

    // Calculate SEO Score
    let score = 0;
    const recommendations: string[] = [];

    // Title evaluation (20 points)
    if (basicSeo.title && basicSeo.title.length > 0) {
      if (basicSeo.title.length >= 30 && basicSeo.title.length <= 60) {
        score += 20;
      } else {
        score += 10;
        recommendations.push(basicSeo.title.length < 30 ? 'Title is too short. Aim for 30-60 characters.' : 'Title is too long. Keep it under 60 characters.');
      }
    } else {
      recommendations.push('Missing title tag. Add a descriptive title.');
    }

    // Description evaluation (15 points)
    if (basicSeo.description && basicSeo.description.length > 0) {
      if (basicSeo.description.length >= 120 && basicSeo.description.length <= 160) {
        score += 15;
      } else {
        score += 8;
        recommendations.push(basicSeo.description.length < 120 ? 'Meta description is too short. Aim for 120-160 characters.' : 'Meta description is too long. Keep it under 160 characters.');
      }
    } else {
      recommendations.push('Missing meta description. Add a compelling description.');
    }

    // Headings evaluation (15 points)
    if (basicSeo.headings.h1 === 1) {
      score += 15;
    } else if (basicSeo.headings.h1 === 0) {
      recommendations.push('Missing H1 tag. Add exactly one H1 per page.');
    } else {
      score += 5;
      recommendations.push('Multiple H1 tags found. Use only one H1 per page.');
    }

    // Images evaluation (10 points)
    if (basicSeo.images.total > 0) {
      const altPercentage = (basicSeo.images.withAlt / basicSeo.images.total) * 100;
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
    
    if (robotsTxt) score += 3;
    else recommendations.push('Missing robots.txt file.');
    
    if (sitemap) score += 2;
    else recommendations.push('Missing XML sitemap.');

    // Performance evaluation (15 points)
    if (pageSpeed.mobile && pageSpeed.desktop) {
      const avgPerformance = (pageSpeed.mobile + pageSpeed.desktop) / 2;
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

    onProgress?.({ stage: 'complete', message: 'Analysis complete!' });

    return {
      url,
      ...basicSeo,
      openGraph,
      twitterCard,
      technical: {
        hasRobotsTxt: robotsTxt,
        hasSitemap: sitemap,
        viewport,
        charset,
      },
      performance: pageSpeed,
      seoScore: Math.min(score, 100),
      recommendations: recommendations.slice(0, 8),
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    onProgress?.({ stage: 'error', message: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error') });
    throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}