import axios from 'axios';
import * as cheerio from 'cheerio';

interface HeadingItem {
  tag: string;
  text: string;
  level: number;
}

interface HeadingsResult {
  url: string;
  headings: HeadingItem[];
  summary: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    total: number;
  };
  warnings: string[];
}

export async function analyzeHeadings(url: string): Promise<HeadingsResult> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SEO-Headings-Analyzer/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    
    const headings: HeadingItem[] = [];
    const summary = {
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      h4Count: 0,
      h5Count: 0,
      h6Count: 0,
      total: 0
    };

    // Extract all headings in order
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const tag = element.tagName.toLowerCase();
      const text = $(element).text().trim();
      const level = parseInt(tag.charAt(1));

      headings.push({
        tag: tag.toUpperCase(),
        text,
        level
      });

      // Update summary counts
      switch (tag) {
        case 'h1': summary.h1Count++; break;
        case 'h2': summary.h2Count++; break;
        case 'h3': summary.h3Count++; break;
        case 'h4': summary.h4Count++; break;
        case 'h5': summary.h5Count++; break;
        case 'h6': summary.h6Count++; break;
      }
      summary.total++;
    });

    // Generate warnings
    const warnings: string[] = [];
    if (summary.h1Count === 0) {
      warnings.push('No H1 tag found. Every page should have exactly one H1 tag.');
    } else if (summary.h1Count > 1) {
      warnings.push(`Multiple H1 tags found (${summary.h1Count}). Use only one H1 per page.`);
    }

    if (summary.total === 0) {
      warnings.push('No heading tags found. Use headings to structure your content.');
    }

    // Check for proper hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      if (heading.level > previousLevel + 1 && previousLevel > 0) {
        warnings.push('Heading hierarchy issue detected. Avoid skipping heading levels.');
        break;
      }
      previousLevel = heading.level;
    }

    return {
      url,
      headings,
      summary,
      warnings
    };

  } catch (error) {
    throw new Error(`Failed to analyze headings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}