# 🔍 Google Cloud Console OAuth Verification Checklist

## ✅ What You Need to Verify:

### 1. **Correct Project**
- Make sure you're in the right Google Cloud project
- Project should contain your OAuth Client ID: `58108393279-4n9gd514rao0iadn3sdvvflf85ej5t0g.apps.googleusercontent.com`

### 2. **OAuth 2.0 Client IDs Settings**
Go to: https://console.cloud.google.com/apis/credentials

**Find your OAuth Client ID and verify these settings:**

#### **Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:3000
http://localhost:5174
https://seositelens.vercel.app
```

#### **Authorized redirect URIs:**
```
http://localhost:5173
http://localhost:5173/
https://seositelens.vercel.app
https://seositelens.vercel.app/
```

### 3. **Save & Wait**
- Click **SAVE** after making changes
- **Wait 5-10 minutes** for changes to propagate globally

### 4. **Clear Browser Cache** 
- Refresh your page: `Ctrl + F5` or `Cmd + Shift + R`
- Or open incognito/private browsing mode

### 5. **Test Again**
- Go to: http://localhost:5173
- Try Google Sign-in again
- Check browser console for errors
- Check backend logs for JWT timing workaround messages

## 🎯 **Expected Success Messages:**

### Browser Console:
```
✅ Google OAuth Client ID loaded successfully
🚀 Starting Google OAuth login...
📦 Credential received: true
```

### Backend Console:
```
🔐 OAuth request received: { hasToken: false, hasCredential: true }
🛠️ Using development JWT decoder for timing issue...
✅ Manual JWT decode successful
✅ Token verified for user: your-email@gmail.com
📧 Attempting to send welcome email
✅ Welcome email sent successfully
```

### Gmail Inbox:
- You should receive a welcome email from SiteLens

---

## 🚨 If Still Not Working:

1. **Screenshot your Google Cloud Console OAuth settings**
2. **Share the exact error message from browser console** 
3. **Check if the Client ID in the error matches your settings**