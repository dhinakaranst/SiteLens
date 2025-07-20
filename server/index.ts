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
import axios from 'axios';
import compression from 'compression';
import seoAuditRoutes from './routes/seoAudit.js';
import * as cheerio from 'cheerio';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// Check if Gemini API key is available
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found. AI recommendations will not work.');
} else {
  console.log('✅ Gemini API key loaded successfully');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Restore activeAnalyses for progress tracking
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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', seoAuditRoutes);

// ... (rest of your code remains unchanged)