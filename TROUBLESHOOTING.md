# 🔧 Google OAuth Troubleshooting Guide

## Quick Fixes

### 1. **Check Environment Variables**
Make sure your `.env` file in the `SiteLens` directory contains:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 2. **Restart Development Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. **Check Browser Console**
Open Developer Tools (F12) and look for:
- ✅ "Google OAuth Client ID loaded successfully"
- ❌ "VITE_GOOGLE_CLIENT_ID is not defined"

## Common Issues

### **Issue: Google Login Button Not Showing**
**Symptoms:** No login button appears in navigation

**Solutions:**
1. Check if `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. Restart the development server
3. Clear browser cache and reload

### **Issue: Google OAuth Popup Not Opening**
**Symptoms:** Clicking login button does nothing

**Solutions:**
1. Check Google Cloud Console settings:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
2. Ensure your Google OAuth client is configured for web application

### **Issue: Backend Connection Error**
**Symptoms:** Login fails with network error

**Solutions:**
1. Check if backend server is running on port 3001
2. Verify MongoDB connection string
3. Check server console for errors

### **Issue: Redis Connection Error (ECONNREFUSED 127.0.0.1:6379)**
**Symptoms:** Server shows Redis connection errors or fails to start

**Solutions:**
1. Redis is now optional - the application will work without it
2. Jobs will be processed directly instead of being queued
3. To use Redis (for better performance), set `REDIS_URL` environment variable
4. For local development, install Redis or just ignore the warnings

### **Issue: MongoDB Connection Failed**
**Symptoms:** Server won't start or login fails

**Solutions:**
1. Verify `MONGODB_URI` in `.env`
2. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
3. Ensure database user has read/write permissions

## Testing Steps

### 1. **Environment Check**
```bash
# In SiteLens directory
echo $VITE_GOOGLE_CLIENT_ID
```

### 2. **Server Health Check**
Visit: `http://localhost:3001/health`
Should return: `{"status":"OK","timestamp":"..."}`

### 3. **Frontend Check**
Visit: `http://localhost:5173`
Check browser console for environment logs

### 4. **Google OAuth Test**
1. Click "Login with Google" in navigation
2. Should open Google OAuth popup
3. Complete login flow
4. User profile should appear in navigation

## Debug Commands

### Check if server is running:
```bash
curl http://localhost:3001/health
```

### Check environment variables:
```bash
# In SiteLens directory
cat .env | grep VITE_GOOGLE_CLIENT_ID
```

### Restart everything:
```bash
# Stop all processes (Ctrl+C)
npm run dev
```

## Still Having Issues?

1. **Check the browser console** for specific error messages
2. **Check the server console** for backend errors
3. **Verify your Google OAuth client ID** is correct
4. **Ensure MongoDB Atlas** is accessible
5. **Try in incognito mode** to rule out browser cache issues

## Support

If you're still having issues, please share:
- Browser console errors
- Server console errors
- Your `.env` file structure (without actual values)
- Steps you've tried 