import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleTokenPayload {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

interface UserDocument {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<UserDocument>;
}

// POST /api/auth/google - Verify Google token and create/login user
router.post('/google', async (req, res) => {
  try {
    console.log('🔐 OAuth request received:', { hasToken: !!req.body.token, hasCredential: !!req.body.credential });
    
    const { token, credential } = req.body;
    const idToken = token || credential;

    if (!idToken) {
      console.log('❌ No token or credential provided');
      return res.status(400).json({ error: 'Token or credential is required' });
    }

    console.log('🔍 Verifying token with Google...');
    
    // Verify the Google token with timeout
    const verifyPromise = client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Token verification timeout')), 10000)
    );

    const ticket = await Promise.race([verifyPromise, timeoutPromise]);
    const payload = ticket.getPayload() as GoogleTokenPayload;

    if (!payload) {
      console.log('❌ Invalid token payload received');
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    console.log('✅ Token verified for user:', payload.email);

    // Check if user exists
    let user = await User.findOne({ googleId: payload.sub }) as UserDocument | null;

    if (!user) {
      console.log('👤 Creating new user:', payload.email);
      // Create new user
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      }) as UserDocument;
      await user.save();
    } else {
      console.log('👤 Existing user found:', payload.email);
    }

    // Return user data
    const userData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt.toISOString(),
      }
    };
    
    console.log('✅ OAuth login successful for:', user.email);
    res.json(userData);

  } catch (error) {
    console.error('❌ Google auth error:', error);
    console.error('🔍 Error details:', {
      message: (error as Error)?.message,
      name: (error as Error)?.name,
      stack: (error as Error)?.stack?.split('\n')[0]
    });
    res.status(500).json({ error: 'Authentication failed', details: (error as Error)?.message });
  }
});

export default router;
