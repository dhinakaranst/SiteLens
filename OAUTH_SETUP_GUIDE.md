# Google Cloud Console OAuth Configuration Guide

## Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create one if you haven't)
3. Navigate to: APIs & Services > Credentials

## Step 2: Update OAuth 2.0 Client IDs
Find your OAuth 2.0 client ID and add these domains:

### Authorized JavaScript origins:
- https://seositelens.vercel.app
- https://site-lens.tech (if you have a custom domain)
- http://localhost:5173 (for local development)

### Authorized redirect URIs:
- https://seositelens.vercel.app
- https://seositelens.vercel.app/
- https://site-lens.tech (if you have a custom domain)
- https://site-lens.tech/ (if you have a custom domain)
- http://localhost:5173 (for local development)

## Step 3: Get Your Credentials
- Copy the Client ID
- Copy the Client Secret (if using server-side verification)

## Step 4: Set Environment Variables
### In Vercel (Frontend):
- VITE_GOOGLE_CLIENT_ID=your_client_id_here
- VITE_API_URL=https://your-render-backend-url.onrender.com

### In Render (Backend):
- GOOGLE_CLIENT_ID=your_client_id_here
- GOOGLE_CLIENT_SECRET=your_client_secret_here

## Important Notes:
- Changes in Google Cloud Console can take 5-10 minutes to propagate
- Make sure to use HTTPS for production domains
- Test after each configuration change