# 📧 Email Setup Guide for SiteLens

## 🎯 **Quick Setup Options**

### **Option 1: Gmail (Recommended - Free)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update Environment Variables**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### **Option 2: Brevo/Sendinblue (Alternative - Free 300 emails/day)**

1. **Sign up**: [Brevo Free Account](https://www.brevo.com/)
2. **Get SMTP Credentials**:
   - Go to SMTP & API → SMTP
   - Copy your SMTP key
3. **Update Environment Variables**:
   ```env
   EMAIL_SERVICE=brevo
   EMAIL_USER=your-email@domain.com
   EMAIL_SMTP_KEY=your-brevo-smtp-key
   ```

## 🚀 **What Emails Are Sent**

### **🎉 Welcome Email** (New Users)
- Sent when user creates account for first time
- Includes getting started guide
- Professional SiteLens branding

### **🔐 Login Notification** (Returning Users)
- Sent each time user logs in
- Security notification with login details
- Helps track account access

## 📋 **Current Configuration**

Your current `.env` file should have:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

## 🔧 **For Render Deployment**

Add these environment variables to your Render service:

1. Go to https://dashboard.render.com
2. Select your backend service
3. Environment → Add variables:
   - `EMAIL_SERVICE` = `gmail`
   - `EMAIL_USER` = `your-gmail@gmail.com`
   - `EMAIL_APP_PASSWORD` = `your-16-character-app-password`

## ✅ **Testing**

Once configured:
1. Update your environment variables
2. Deploy to Render
3. Test login on your live site
4. Check email inbox for notifications

## 🔒 **Security Notes**

- Never commit real email credentials to Git
- Use App Passwords, not main Gmail password
- Email sending is optional - login still works without it
- All errors are logged but don't break the login flow

## 🛠️ **Troubleshooting**

**No emails received?**
- Check spam folder
- Verify Gmail App Password is correct
- Check Render logs for email service errors
- Ensure 2FA is enabled on Gmail

**Want to disable emails temporarily?**
- Just remove EMAIL_USER from environment variables
- System will skip email sending automatically