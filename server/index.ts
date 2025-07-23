import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import compression from 'compression';
import seoAuditRoutes from './routes/seoAudit.js';
import { checkMeta } from './routes/meta-check.js';
import { analyzeHeadings } from './routes/headings.js';
import { checkSocialTags } from './routes/social-tags.js';

dotenv.config();

// Check if Perplexity API key is available
if (!process.env.PERPLEXITY_API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY not found. AI recommendations will not work.');
} else {
  console.log('✅ Perplexity API key loaded successfully');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoints - CRITICAL for Render deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'SiteLens API'
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'SiteLens API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'SiteLens API Server', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      healthz: '/healthz',
      audit: '/api/audit'
    }
  });
});

// Progress tracking for real-time updates
const activeAnalyses = new Map();

// Enable compression for all responses
app.use(compression());

// -------------- CORS FIX START --------------
// Add all allowed origins including your production Vercel URL
const allowedOrigins = [
  'https://site-lens.tech',
  'https://seositelens.vercel.app',
  'https://seositelens-ovr0l96mv-dhinakaransts-projects.vercel.app', // <--- ADD THIS LINE
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  next();
});
// -------------- CORS FIX END --------------

app.use(express.json());

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Initialize worker if Redis is available
const initializeWorker = async () => {
  try {
    await import('./queue/worker.js');
  } catch {
    console.log('ℹ️ Worker initialization skipped (Redis not available)');
  }
};

app.use('/api/auth', authRoutes);
app.use('/api', seoAuditRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Progress tracking endpoint for real-time updates
app.get('/api/audit/progress', (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Initialize analysis session if not exists
  if (!activeAnalyses.has(url)) {
    activeAnalyses.set(url, { 
      progress: { stage: 'initial', message: 'Starting analysis...' }, 
      clients: new Set() 
    });
  }

  const session = activeAnalyses.get(url);
  session.clients.add(res);

  // Send initial progress
  res.write(`data: ${JSON.stringify(session.progress)}\n\n`);

  // Clean up on client disconnect
  req.on('close', () => {
    session.clients.delete(res);
    if (session.clients.size === 0) {
      activeAnalyses.delete(url);
    }
  });
});


// Additional SEO analysis routes
app.post('/api/meta-check', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await checkMeta(url);
    res.json(result);
  } catch (error) {
    console.error('Meta check error:', error);
    res.status(500).json({ error: 'Failed to analyze meta tags' });
  }
});

app.post('/api/headings', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await analyzeHeadings(url);
    res.json(result);
  } catch (error) {
    console.error('Headings analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze headings' });
  }
});

app.post('/api/social-tags', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await checkSocialTags(url);
    res.json(result);
  } catch (error) {
    console.error('Social tags check error:', error);
    res.status(500).json({ error: 'Failed to analyze social tags' });
  }
});

// Start the server
const startServer = async () => {
  try {
    // Initialize worker first
    await initializeWorker();
    
    // Ensure PORT is a number
    const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
    
    // Start server with proper host binding for Render
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Health check available at: http://localhost:${port}/healthz`);
      console.log(`📍 API available at: http://localhost:${port}/api/audit`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Set server timeout to handle long-running requests (2 minutes)
    server.timeout = 120000;
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120000;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();