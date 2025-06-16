import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeWebsite } from './analyzer.js';
import { checkMeta } from './routes/meta-check.js';
import { analyzeHeadings } from './routes/headings.js';
import { checkSocialTags } from './routes/social-tags.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const app = express();
const PORT = process.env.PORT || 3001;

// Store active analysis sessions
const activeAnalyses = new Map<string, { progress: any; clients: Set<any> }>();

// Configure CORS to explicitly allow requests only from your deployed frontend domain
const allowedOrigins = [
  'http://localhost:5173', // Keep this for local development
  'http://localhost:3000', // Keep this for local development
  'https://seo-audit-tool.vercel.app', // Add your Vercel frontend URL
  'https://*.vercel.app' // Allow all Vercel preview deployments
];

const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      (allowedOrigin.includes('*') && origin.endsWith(allowedOrigin.split('*')[1]))
    )) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

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
  aiRecommendations?: string[];
}

async function generateAiRecommendations(report: SEOReport): Promise<string[]> {
  try {
    const prompt = `Based on the following SEO report for ${report.url}, provide actionable and concise optimization suggestions for improving its search engine ranking and user experience. Focus on practical advice. Structure your response as a numbered list of recommendations. If the current recommendations array already has items, you can expand on them or add new ones. Only provide the list, no introductory or concluding sentences. Do not mention the API key or any internal technical details. Here is the SEO report in JSON format: ${JSON.stringify(report)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return ["Could not generate AI recommendations at this time."];
  }
}

// Progress tracking endpoint
app.get('/api/audit/progress', (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create a unique ID for this client
  const clientId = Date.now().toString();
  
  // Initialize or get the analysis session
  if (!activeAnalyses.has(url)) {
    activeAnalyses.set(url, { progress: { stage: 'initial', message: 'Starting analysis...' }, clients: new Set() });
  }
  
  const session = activeAnalyses.get(url)!;
  session.clients.add(res);

  // Send initial progress
  res.write(`data: ${JSON.stringify(session.progress)}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    session.clients.delete(res);
    if (session.clients.size === 0) {
      activeAnalyses.delete(url);
    }
  });
});

// Helper function to broadcast progress to all clients
const broadcastProgress = (url: string, progress: any) => {
  const session = activeAnalyses.get(url);
  if (session) {
    session.progress = progress;
    session.clients.forEach(client => {
      client.write(`data: ${JSON.stringify(progress)}\n\n`);
    });
  }
};

// Existing full audit endpoint
app.post('/api/audit', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
  }

  try {
    // Initialize analysis session if not exists
    if (!activeAnalyses.has(url)) {
      activeAnalyses.set(url, { progress: { stage: 'initial', message: 'Starting analysis...' }, clients: new Set() });
    }

    // Update progress for fetching stage
    broadcastProgress(url, { stage: 'fetching', message: 'Fetching website content...' });
    
    // Start the analysis with progress updates
    const report = await analyzeWebsite(url, (progress) => {
      broadcastProgress(url, progress);
    });
    
    // Generate AI recommendations with progress updates
    broadcastProgress(url, { stage: 'ai', message: 'Generating AI recommendations...' });
    const aiRecs = await generateAiRecommendations(report);
    const finalReport = { ...report, aiRecommendations: aiRecs };

    // Mark as complete
    broadcastProgress(url, { stage: 'complete', message: 'Analysis complete!' });
    
    // Clean up the session after a delay
    setTimeout(() => {
      activeAnalyses.delete(url);
    }, 5000);

    res.json(finalReport);
  } catch (error) {
    console.error('Audit error:', error);
    broadcastProgress(url, { 
      stage: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
    res.status(500).json({ 
      error: 'Failed to analyze website',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New meta check endpoint
app.post('/api/meta-check', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
    }

    const result = await checkMeta(url);
    res.json(result);
  } catch (error) {
    console.error('Meta check error:', error);
    res.status(500).json({ 
      error: 'Failed to check meta tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New headings analyzer endpoint
app.post('/api/headings', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
    }

    const result = await analyzeHeadings(url);
    res.json(result);
  } catch (error) {
    console.error('Headings analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze headings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New social tags checker endpoint
app.post('/api/social-tags', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please include http:// or https://' });
    }

    const result = await checkSocialTags(url);
    res.json(result);
  } catch (error) {
    console.error('Social tags check error:', error);
    res.status(500).json({ 
      error: 'Failed to check social tags',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 SEO Audit API running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   POST /api/audit - Full SEO audit`);
  console.log(`   POST /api/meta-check - Meta title & description checker`);
  console.log(`   POST /api/headings - Headings analyzer`);
  console.log(`   POST /api/social-tags - Social media tags checker`);
});