import axios from 'axios';
import * as cheerio from 'cheerio';
export async function checkMeta(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'SEO-Meta-Checker/1.0'
            }
        });
        const $ = cheerio.load(response.data);
        const titleText = $('title').text().trim();
        const descriptionText = $('meta[name="description"]').attr('content') || '';
        // Title status logic
        let titleStatus = 'error';
        if (titleText.length >= 50 && titleText.length <= 60) {
            titleStatus = 'good';
        }
        else if (titleText.length >= 30 && titleText.length <= 70) {
            titleStatus = 'warning';
        }
        // Description status logic
        let descriptionStatus = 'error';
        if (descriptionText.length >= 150 && descriptionText.length <= 160) {
            descriptionStatus = 'good';
        }
        else if (descriptionText.length >= 120 && descriptionText.length <= 180) {
            descriptionStatus = 'warning';
        }
        return {
            url,
            title: {
                text: titleText,
                length: titleText.length,
                status: titleStatus
            },
            description: {
                text: descriptionText,
                length: descriptionText.length,
                status: descriptionStatus
            }
        };
    }
    catch (error) {
        throw new Error(`Failed to check meta tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
