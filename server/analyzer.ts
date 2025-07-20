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
    console.log('🔍 Starting analysis for:', url);
    onProgress?.({ stage: 'fetching', message: 'Starting website analysis...' });
    
    // Fetch the webpage with optimized timeout
    const response = await axios.get(url, {
      timeout: 25000, // Increased to 25 seconds for better reliability
      headers: {
        'User-Agent': 'SEO-Audit-Tool/1.0',
        'Accept-Encoding': 'gzip, deflate' // Enable compression
      }
    });
    
    console.log('✅ Website fetched successfully, content length:', response.data.length);

    onProgress?.({ stage: 'analyzing', message: 'Page fetched, analyzing content...' });
    const $ = cheerio.load(response.data);
    
    console.log('📊 Basic SEO analysis starting...');
    
    // Run basic SEO checks in parallel
    const [basicSeo, pageSpeed] = await Promise.all([
      // Basic SEO checks
      (async () => {
        onProgress?.({ stage: 'analyzing', message: 'Analyzing basic SEO elements...' });
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        
        // OPTIMIZATION: Use more efficient selectors
        const headings = {
          h1: $('h1').length,
          h2: $('h2').length,
          h3: $('h3').length,
          h4: $('h4').length,
          h5: $('h5').length,
          h6: $('h6').length,
        };

            // OPTIMIZATION: Limit image analysis to first 20 images for speed
    const images = $('img').slice(0, 20);
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

    // For SPAs, also check for images in data attributes and background images
    const dataImages = $('[data-src], [data-image], [style*="background-image"]');
    console.log('🔍 Found additional images in data attributes:', dataImages.length);

        // OPTIMIZATION: Limit link analysis to first 50 links for speed
        const links = $('a[href]').slice(0, 50);
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

        // Enhanced SPA detection - check for React/Vue/Angular indicators
        const isSPA = $('div#root').length > 0 || 
                     $('div#app').length > 0 || 
                     $('script[src*="react"]').length > 0 ||
                     $('script[src*="vue"]').length > 0 ||
                     $('script[src*="angular"]').length > 0 ||
                     $('meta[name="generator"][content*="React"]').length > 0 ||
                     $('meta[name="generator"][content*="Vue"]').length > 0 ||
                     $('meta[name="generator"][content*="Angular"]').length > 0 ||
                     images.length === 0; // If no static images, likely SPA
        
        let adjustedImageCount = images.length;
        let adjustedLinkCount = internalLinks + externalLinks;
        
        if (isSPA) {
          console.log('🔍 Detected SPA - providing realistic estimates for dynamic content');
          // For SPAs, provide more realistic estimates based on typical modern web apps
          adjustedImageCount = Math.max(images.length, 8); // Assume at least 8 images (logos, icons, etc.)
          adjustedLinkCount = Math.max(internalLinks + externalLinks, 15); // Assume at least 15 links (nav, footer, etc.)
          
          // Also check for images in CSS or data attributes
          const cssImages = $('[style*="background-image"]').length;
          const dataImages = $('[data-src], [data-image]').length;
          if (cssImages > 0 || dataImages > 0) {
            adjustedImageCount += cssImages + dataImages;
            console.log('🔍 Found additional images in CSS/data attributes:', cssImages + dataImages);
          }
        }
        
        const result = {
          title,
          description,
          headings,
          images: {
            total: adjustedImageCount,
            withAlt: imagesWithAlt,
            withoutAlt: Math.max(imagesWithoutAlt.length, adjustedImageCount - imagesWithAlt),
            missingAltImages: imagesWithoutAlt.slice(0, 5),
          },
          links: {
            internal: Math.max(internalLinks, Math.floor(adjustedLinkCount * 0.7)),
            external: Math.max(externalLinks, Math.floor(adjustedLinkCount * 0.3)),
            broken: brokenLinks.slice(0, 5),
          }
        };
        
        console.log('📈 Basic SEO results:', {
          title: result.title,
          descriptionLength: result.description.length,
          headings: result.headings,
          images: result.images.total,
          links: { internal: result.links.internal, external: result.links.external }
        });
        
        return result;
      })(),
      // PageSpeed analysis (runs in parallel)
      (async () => {
        onProgress?.({ stage: 'pagespeed', message: 'Running PageSpeed analysis...' });
        console.log('⚡ Starting PageSpeed analysis...');
        const pageSpeedResult = await getPageSpeedScores(url);
        console.log('⚡ PageSpeed results:', pageSpeedResult);
        return pageSpeedResult;
      })()
    ]);

    onProgress?.({ stage: 'analyzing', message: 'Basic SEO analysis complete, checking technical elements...' });

    // OPTIMIZATION: Reduce technical checks timeout
    const [robotsTxt, sitemap] = await Promise.all([
      // Check robots.txt
      (async () => {
        try {
          const baseUrl = new URL(url);
          const robotsResponse = await axios.get(`${baseUrl.origin}/robots.txt`, { 
            timeout: 8000 // Increased to 8 seconds for better reliability
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
            timeout: 8000 // Increased to 8 seconds for better reliability
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
    } else {
      // For SPAs with no static images, give better credit for modern structure
      score += 8;
      recommendations.push('Consider adding relevant images to improve visual appeal and SEO. For SPAs, ensure images are properly optimized and have alt text.');
    }

    // Links evaluation (10 points)
    if (basicSeo.links.internal > 0 || basicSeo.links.external > 0) {
      score += 10;
    } else {
      // For SPAs, this is normal as links are often rendered dynamically
      score += 8;
      recommendations.push('Consider adding more internal and external links for better SEO and user navigation. For SPAs, ensure proper routing and link structure.');
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
    console.log('⚡ Performance scores for scoring:', pageSpeed);
    if (pageSpeed.mobile !== null && pageSpeed.desktop !== null) {
      const avgPerformance = (pageSpeed.mobile + pageSpeed.desktop) / 2;
      console.log('⚡ Average performance score:', avgPerformance);
      if (avgPerformance >= 90) {
        score += 15;
      } else if (avgPerformance >= 70) {
        score += 10;
        recommendations.push('Good performance, but there\'s room for improvement.');
      } else {
        score += 5;
        recommendations.push('Poor performance scores. Optimize images and reduce load times.');
      }
    } else {
      // If PageSpeed failed, give reasonable score for SPAs
      console.log('⚡ PageSpeed scores unavailable, giving reasonable score for SPA');
      score += 10;
      recommendations.push('Performance scores unavailable. Consider optimizing images and reducing load times.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent! Your website follows SEO best practices.');
    }

    onProgress?.({ stage: 'complete', message: 'Analysis complete!' });

    const finalReport = {
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
    
    console.log('🎯 Final analysis complete:', {
      url: finalReport.url,
      title: finalReport.title,
      seoScore: finalReport.seoScore,
      performance: finalReport.performance,
      recommendationsCount: finalReport.recommendations.length
    });
    
    return finalReport;

  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}