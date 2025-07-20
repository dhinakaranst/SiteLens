import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { analyzeWebsite } from './analyzer.js';
import { checkMeta } from './routes/meta-check.js';
import { analyzeHeadings } from './routes/headings.js';
import { checkSocialTags } from './routes/social-tags.js';
import authRoutes from './routes/auth.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import compression from 'compression';
import seoAuditRoutes from './routes/seoAudit.js';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();
const PORT = process.env.PORT || 3001;
const activeAnalyses = new Map();
// Enable compression for all responses
app.use(compression());
// Configure CORS for both development and production
const allowedOrigins = [
    'https://site-lens.tech',
    'https://seositelens.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
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
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
connectDB();
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api', seoAuditRoutes);
async function generateAiRecommendations(report) {
    try {
        const prompt = `Based on the following SEO report for ${report.url}, provide actionable and concise optimization suggestions for improving its search engine ranking and user experience. Focus on practical advice. Structure your response as a numbered list of recommendations. If the current recommendations array already has items, you can expand on them or add new ones. Only provide the list, no introductory or concluding sentences. Do not mention the API key or any internal technical details. Here is the SEO report in JSON format: ${JSON.stringify(report)}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text.split('\n').filter(line => line.trim() !== '');
    }
    catch (error) {
        console.error("Error generating AI recommendations:", error);
        return ["Could not generate AI recommendations at this time."];
    }
}
// Progress tracking endpoint
app.get('/api/audit/progress', (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Initialize or get the analysis session
    if (!activeAnalyses.has(url)) {
        activeAnalyses.set(url, { progress: { stage: 'initial', message: 'Starting analysis...' }, clients: new Set() });
    }
    const session = activeAnalyses.get(url);
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
const broadcastProgress = (url, progress) => {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Social tags check error:', error);
        res.status(500).json({
            error: 'Failed to check social tags',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Health check endpoint for Render
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Wake-up endpoint to prevent spinning down
app.get('/wake', (req, res) => {
    console.log('🌅 Server woken up by external request');
    res.json({
        status: 'awake',
        timestamp: new Date().toISOString(),
        message: 'Server is active and ready to handle requests'
    });
});
// Root endpoint for basic connectivity test
app.get('/', (req, res) => {
    res.json({
        message: 'SEO Audit API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /api/audit - Full SEO audit',
            'POST /api/meta-check - Meta title & description checker',
            'POST /api/headings - Headings analyzer',
            'POST /api/social-tags - Social media tags checker',
            'GET /health - Health check',
            'GET /wake - Wake up server'
        ]
    });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
