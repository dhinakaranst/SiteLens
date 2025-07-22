import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testPerplexityAPI() {
  try {
    console.log('Testing Perplexity API...');
    console.log('API Key exists:', !!process.env.PERPLEXITY_API_KEY);
    console.log('API Key prefix:', process.env.PERPLEXITY_API_KEY?.substring(0, 10) + '...');
    
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar-pro',
      messages: [
        {
          role: 'user',
          content: 'Hello, can you provide 3 SEO tips in JSON array format?'
        }
      ],
      max_tokens: 200,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response:', response.data);
    console.log('Content:', response.data.choices[0]?.message?.content);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testPerplexityAPI();
