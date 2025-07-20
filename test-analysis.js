import axios from 'axios';
import * as cheerio from 'cheerio';

async function testAnalysis() {
  try {
    console.log('🔍 Testing analysis for site-lens.tech...');
    
    // Test 1: Fetch the website
    const response = await axios.get('https://site-lens.tech', {
      timeout: 15000,
      headers: {
        'User-Agent': 'SEO-Audit-Tool/1.0'
      }
    });
    
    console.log('✅ Website fetched successfully');
    console.log('📄 Content length:', response.data.length);
    
    // Test 2: Parse with Cheerio
    const $ = cheerio.load(response.data);
    
    // Check for SPA indicators
    const hasRoot = $('div#root').length > 0;
    const hasApp = $('div#app').length > 0;
    const hasReactScripts = $('script[src*="react"]').length > 0;
    const hasVueScripts = $('script[src*="vue"]').length > 0;
    const hasAngularScripts = $('script[src*="angular"]').length > 0;
    const hasGeneratorMeta = $('meta[name="generator"]').length > 0;
    
    console.log('🔍 SPA Detection Results:');
    console.log('- Has #root div:', hasRoot);
    console.log('- Has #app div:', hasApp);
    console.log('- Has React scripts:', hasReactScripts);
    console.log('- Has Vue scripts:', hasVueScripts);
    console.log('- Has Angular scripts:', hasAngularScripts);
    console.log('- Has generator meta:', hasGeneratorMeta);
    
    // Check basic elements
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
      h4: $('h4').length,
      h5: $('h5').length,
      h6: $('h6').length,
    };
    const images = $('img').length;
    const links = $('a[href]').length;
    
    console.log('📊 Basic Elements:');
    console.log('- Title:', title);
    console.log('- Description length:', description.length);
    console.log('- Headings:', headings);
    console.log('- Images:', images);
    console.log('- Links:', links);
    
    // Check for additional images
    const cssImages = $('[style*="background-image"]').length;
    const dataImages = $('[data-src], [data-image]').length;
    
    console.log('🔍 Additional Images:');
    console.log('- CSS background images:', cssImages);
    console.log('- Data attribute images:', dataImages);
    
    // Determine if it's an SPA
    const isSPA = hasRoot || hasApp || hasReactScripts || hasVueScripts || hasAngularScripts || hasGeneratorMeta || images === 0;
    
    console.log('🎯 SPA Detection Result:', isSPA);
    
    if (isSPA) {
      console.log('🔧 SPA Adjustments:');
      const adjustedImages = Math.max(images, 8);
      const adjustedLinks = Math.max(links, 15);
      console.log('- Adjusted images:', adjustedImages);
      console.log('- Adjusted links:', adjustedLinks);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnalysis(); 