import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create email transporter based on environment
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  let config: EmailConfig;
  
  if (emailService === 'gmail') {
    config = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_APP_PASSWORD || ''
      }
    };
  } else if (emailService === 'brevo') {
    config = {
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_SMTP_KEY || ''
      }
    };
  } else {
    // Default to Gmail
    config = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_APP_PASSWORD || ''
      }
    };
  }
  
  return nodemailer.createTransport(config);
};

// Send login notification email
export async function sendLoginNotificationEmail(userEmail: string, userName: string) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || (!process.env.EMAIL_APP_PASSWORD && !process.env.EMAIL_SMTP_KEY)) {
      console.log('⚠️ Email not configured - skipping login notification');
      return;
    }

    const transporter = createTransporter();
    
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const mailOptions = {
      from: `"SiteLens - SEO Analytics" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 Welcome Back to SiteLens!',
      text: `Hi ${userName},

You have successfully logged in to SiteLens!

Login Details:
- Time: ${currentTime}
- Account: ${userEmail}
- Platform: SiteLens SEO Analytics

If this wasn't you, please secure your Google account immediately.

Best regards,
The SiteLens Team

---
SiteLens - Professional SEO Analytics & Audit Tool
Visit: https://seositelens.vercel.app`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Welcome Back!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #666; line-height: 1.6;">You have successfully logged in to <strong>SiteLens</strong> - your professional SEO analytics platform!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">📊 Login Details</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Time:</strong> ${currentTime}</li>
                <li><strong>Account:</strong> ${userEmail}</li>
                <li><strong>Platform:</strong> SiteLens SEO Analytics</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://seositelens.vercel.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">🚀 Continue to Dashboard</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              If this wasn't you, please secure your Google account immediately.<br>
              <strong>SiteLens</strong> - Professional SEO Analytics & Audit Tool
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login notification email sent:', info.messageId);
    console.log('📧 Sent to:', userEmail);
    
  } catch (error) {
    console.error('❌ Error sending login notification email:', error);
    // Don't throw error - email failure shouldn't break login
  }
}

// Send welcome email for new users
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || (!process.env.EMAIL_APP_PASSWORD && !process.env.EMAIL_SMTP_KEY)) {
      console.log('⚠️ Email not configured - skipping welcome email');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"SiteLens - SEO Analytics" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Welcome to SiteLens - Your SEO Journey Starts Here!',
      text: `Hi ${userName},

Welcome to SiteLens! 🎉

We're excited to have you on board. SiteLens is your professional SEO analytics and audit tool that helps you:

✅ Analyze website SEO performance
✅ Track meta tags and headings
✅ Monitor social media tags
✅ Get actionable SEO recommendations
✅ Generate comprehensive SEO reports

Get Started:
1. Visit: https://site-lens.tech
2. Enter any website URL to start your SEO analysis
3. Get instant, actionable insights

Need help? Just reply to this email!

Best regards,
The SiteLens Team

---
SiteLens - Professional SEO Analytics & Audit Tool`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Welcome to SiteLens!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your SEO Journey Starts Here</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">We're excited to have you on board! SiteLens is your professional SEO analytics and audit tool.</p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">🚀 What you can do with SiteLens:</h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>✅ Analyze website SEO performance</li>
                <li>✅ Track meta tags and headings</li>
                <li>✅ Monitor social media tags</li>
                <li>✅ Get actionable SEO recommendations</li>
                <li>✅ Generate comprehensive SEO reports</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 25px 0; color: white;">
              <h3 style="margin-top: 0; color: white;">🎯 Quick Start Guide:</h3>
              <ol style="line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Visit your dashboard</li>
                <li>Enter any website URL</li>
                <li>Get instant SEO insights</li>
                <li>Download your analysis report</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://seositelens.vercel.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">🚀 Start Your First SEO Analysis</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              Need help? Just reply to this email!<br>
              <strong>SiteLens</strong> - Professional SEO Analytics & Audit Tool
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    console.log('📧 Sent to:', userEmail);
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error - email failure shouldn't break registration
  }
}