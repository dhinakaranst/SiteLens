# Redis and BullMQ Configuration Fix

## Problem
The backend was failing in production on Render due to hardcoded Redis configuration that assumed a local Redis instance running on `localhost:6379`. This caused the application to crash when deployed to production environments that don't have Redis available or have Redis hosted on different URLs.

## Solution
The codebase has been updated to handle Redis configuration more gracefully:

### 1. Environment-Based Configuration
All Redis connections now use environment variables:
- `REDIS_URL` - Standard Redis connection URL
- `REDISCLOUD_URL` - RedisCloud or other hosted Redis URL

### 2. Graceful Degradation
When Redis is not available:
- The main application continues to function normally
- Queue functionality is automatically disabled
- Workers gracefully exit with informative messages
- No crashes or errors due to missing Redis

### 3. Cross-Platform Compatibility
Fixed package.json scripts to work on Linux/Mac/Windows without hardcoded paths.

## Environment Variables

### Required for Basic Functionality
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sitelens
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional for Queue Functionality
```env
# For local development
REDIS_URL=redis://localhost:6379

# For production (Redis Cloud, ElastiCache, etc.)
REDIS_URL=redis://username:password@host:port
# OR
REDISCLOUD_URL=redis://username:password@host:port
```

### Optional for Enhanced Features
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PAGESPEED_API_KEY=your_pagespeed_api_key_here
```

## Deployment on Render

### For Basic Deployment (without Redis)
1. Set required environment variables in Render dashboard:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

2. Deploy using the `web` service only in Procfile

### For Full Queue Support
1. Add a Redis add-on or external Redis service
2. Set the Redis URL in Render environment variables
3. Enable both `web` and `worker` processes in Render

## Local Development

### Without Redis (Simplified)
```bash
npm run dev:server  # Runs main server only
```

### With Redis (Full Features)
```bash
# Start Redis locally first
redis-server

# Then run both server and worker
npm run dev
```

## API Endpoints

### Main Endpoint (Always Available)
- `POST /api/audit` - Full SEO audit with real-time progress

### Queue-Based Endpoint (Only when Redis is available)
- `POST /api/audit-queue` - Submit audit job to queue for background processing

## Files Modified
- `server/utils/redis.ts` - Environment-based Redis configuration
- `server/queue/auditQueue.ts` - Dynamic queue initialization
- `server/queue/worker.ts` - Graceful worker startup/shutdown
- `server/services/seoAuditService.ts` - Optional queue support
- `server/routes/seoAudit.ts` - Clarified queue vs direct endpoints
- `package.json` - Cross-platform scripts
- `Procfile` - Support for worker processes
- `.env.example` - Documentation for environment variables

## Testing the Fix
1. Deploy without Redis - should work normally
2. Deploy with Redis - should enable queue functionality
3. All existing functionality should continue to work as before