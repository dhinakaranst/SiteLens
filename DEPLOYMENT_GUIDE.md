# Deployment Guide for Render

## Quick Fix for 404 Errors

The 404 errors you're experiencing are due to Render's free tier spinning down after 15 minutes of inactivity. Here's how to fix it:

## 1. Deploy the Updated Code

The server now includes built-in keep-alive functionality. Deploy these changes to Render:

```bash
git add .
git commit -m "Add keep-alive mechanism for Render free tier"
git push
```

## 2. Set Environment Variables in Render

In your Render dashboard, add these environment variables:

- `NODE_ENV=production`
- `RENDER_EXTERNAL_URL=https://your-app-name.onrender.com` (replace with your actual URL)
- `MONGODB_URI=your-mongodb-connection-string`
- `GEMINI_API_KEY=your-gemini-api-key`
- `REDIS_URL=your-redis-url` (optional - for job queuing. If not provided, jobs will be processed directly)

## 3. Test the Deployment

After deployment, test these endpoints:

1. **Root endpoint**: `https://your-app-name.onrender.com/`
2. **Wake endpoint**: `https://your-app-name.onrender.com/wake`
3. **Health check**: `https://your-app-name.onrender.com/health`

## 4. Keep-Alive Options

### Option A: Built-in (Automatic)
The server will automatically ping itself every 14 minutes.

### Option B: External Script
Run the keep-alive script on your local machine:

```bash
# Install axios if needed
npm install axios

# Set your server URL and run
export SERVER_URL=https://your-app-name.onrender.com
node keep-alive.js
```

### Option C: Monitoring Service
Use UptimeRobot or similar service to ping:
`https://your-app-name.onrender.com/wake` every 14 minutes.

## 5. User Experience Improvements

The frontend now shows better error messages:
- "Server is starting up. Please wait a moment and try again. This can take up to 50 seconds on the free tier."
- "Server is temporarily unavailable. Please try again in a few moments."

## 6. Verify Everything Works

1. Wait for the server to spin down (15+ minutes of inactivity)
2. Try using the Headings Analyzer
3. You should see the "Server is starting up" message
4. Wait 50+ seconds and try again
5. The server should respond normally

## Troubleshooting

- **Still getting 404s**: Make sure `RENDER_EXTERNAL_URL` is set correctly
- **Keep-alive not working**: Check Render logs for any errors
- **Long response times**: This is normal for the first request after spin-down

## Alternative Solutions

If the keep-alive doesn't work reliably, consider:
1. Upgrading to Render's paid tier
2. Using a different hosting service (Railway, Heroku, etc.)
3. Setting up a cron job on a VPS to ping your server 