import axios from 'axios';
import * as cheerio from 'cheerio';

interface SocialTag {
  name: string;
  content: string;
  missing: boolean;
}

interface SocialTagsResult {
  url: string;
  openGraph: SocialTag[];
  twitterCard: SocialTag[];
  summary: {
    openGraphComplete: boolean;
    twitterCardComplete: boolean;
    totalTags: number;
    missingTags: number;
  };
}

export async function checkSocialTags(url: string): Promise<SocialTagsResult> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SEO-Social-Tags-Checker/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    
    // OpenGraph tags to check
    const ogTags = [
      { property: 'og:title', name: 'Title' },
      { property: 'og:description', name: 'Description' },
      { property: 'og:image', name: 'Image' },
      { property: 'og:url', name: 'URL' },
      { property: 'og:type', name: 'Type' },
      { property: 'og:site_name', name: 'Site Name' }
    ];

    // Twitter Card tags to check
    const twitterTags = [
      { name: 'twitter:card', displayName: 'Card Type' },
      { name: 'twitter:title', displayName: 'Title' },
      { name: 'twitter:description', displayName: 'Description' },
      { name: 'twitter:image', displayName: 'Image' },
      { name: 'twitter:site', displayName: 'Site Handle' }
    ];

    const openGraph: SocialTag[] = ogTags.map(tag => {
      const content = $(`meta[property="${tag.property}"]`).attr('content') || '';
      return {
        name: tag.name,
        content,
        missing: !content
      };
    });

    const twitterCard: SocialTag[] = twitterTags.map(tag => {
      const content = $(`meta[name="${tag.name}"]`).attr('content') || '';
      return {
        name: tag.displayName,
        content,
        missing: !content
      };
    });

    // Calculate summary
    const ogMissing = openGraph.filter(tag => tag.missing).length;
    const twitterMissing = twitterCard.filter(tag => tag.missing).length;
    const totalTags = openGraph.length + twitterCard.length;
    const missingTags = ogMissing + twitterMissing;

    // Core OG tags (first 4) and core Twitter tags (first 4)
    const coreOgComplete = openGraph.slice(0, 4).every(tag => !tag.missing);
    const coreTwitterComplete = twitterCard.slice(0, 4).every(tag => !tag.missing);

    return {
      url,
      openGraph,
      twitterCard,
      summary: {
        openGraphComplete: coreOgComplete,
        twitterCardComplete: coreTwitterComplete,
        totalTags,
        missingTags
      }
    };

  } catch (error) {
    throw new Error(`Failed to check social tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}