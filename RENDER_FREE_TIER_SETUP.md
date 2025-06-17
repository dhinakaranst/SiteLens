# Render Free Tier Setup Guide

## The Problem
Render's free tier instances automatically spin down after 15 minutes of inactivity. When a request comes in, the server needs to "wake up" which can take 50+ seconds, causing 404 errors.

## Solutions

### 1. Built-in Keep-Alive (Recommended)
The server now includes a built-in keep-alive mechanism that:
- Automatically pings itself every 14 minutes
- Only runs in production or when `RENDER_EXTERNAL_URL` is set
- Logs keep-alive status to the console

### 2. External Keep-Alive Script
You can run the `keep-alive.js` script on your local machine or another server:

```bash
# Set your server URL
export SERVER_URL=https://your-app-name.onrender.com

# Run the keep-alive script
node keep-alive.js
```

### 3. Use a Monitoring Service
Services like UptimeRobot can ping your server regularly:
- URL: `https://your-app-name.onrender.com/wake`
- Interval: Every 14 minutes
- Expected response: `{"status":"awake"}`

### 4. Manual Wake-Up
You can manually wake up the server by visiting:
- `https://your-app-name.onrender.com/wake`
- `https://your-app-name.onrender.com/health`

## Environment Variables
Make sure these are set in your Render dashboard:
- `NODE_ENV=production`
- `RENDER_EXTERNAL_URL=https://your-app-name.onrender.com`

## Testing the Setup
1. Visit your server's root URL: `https://your-app-name.onrender.com/`
2. You should see a JSON response with available endpoints
3. Try the wake endpoint: `https://your-app-name.onrender.com/wake`
4. Check the health endpoint: `https://your-app-name.onrender.com/health`

## Troubleshooting
- **404 errors**: Server is spinning up, wait 50+ seconds and try again
- **503/502 errors**: Server is temporarily unavailable, try again in a few minutes
- **Keep-alive not working**: Check that `RENDER_EXTERNAL_URL` is set correctly

## Upgrade Options
Consider upgrading to Render's paid tier for:
- No spin-down delays
- Better performance
- More resources
- Custom domains 