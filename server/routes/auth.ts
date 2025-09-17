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
    const { token, credential } = req.body as { token?: string; credential?: string };
    const idToken = token || credential;

    if (!idToken) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify the Google token with timeout
    const verifyPromise = client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Token verification timeout')), 10000)
    );

    const ticket = await Promise.race([verifyPromise, timeoutPromise]);
    const payload = ticket.getPayload() as GoogleTokenPayload;

    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    // Check if user exists
    let user = await User.findOne({ googleId: payload.sub }) as UserDocument | null;

    if (!user) {
      // Create new user
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      }) as UserDocument;
      await user.save();
    }

    // Return user data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      createdAt: user.createdAt.toISOString(),
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
