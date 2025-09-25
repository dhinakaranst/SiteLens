import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Development-only JWT decoder to bypass timing validation
function decodeJWTPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        // Basic validation - check if it's from Google and for our client
        if (payload.iss !== 'https://accounts.google.com' ||
            payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            return null;
        }
        return {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture
        };
    }
    catch {
        return null;
    }
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
        let payload = null;
        // Try normal verification first
        try {
            const verifyPromise = client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Token verification timeout')), 10000));
            const ticket = await Promise.race([verifyPromise, timeoutPromise]);
            payload = ticket.getPayload();
        }
        catch (error) {
            const errorMessage = error?.message;
            console.log('⚠️ Standard verification failed:', errorMessage);
            // In development, if timing error, use manual decoding
            if (process.env.NODE_ENV === 'development' &&
                (errorMessage?.includes('Token used too early') || errorMessage?.includes('too late'))) {
                console.log('🛠️ Using development JWT decoder for timing issue...');
                payload = decodeJWTPayload(idToken);
                if (!payload) {
                    console.log('❌ Manual JWT decode also failed');
                    throw error;
                }
                console.log('✅ Manual JWT decode successful');
            }
            else {
                throw error;
            }
        }
        if (!payload) {
            console.log('❌ Invalid token payload received');
            return res.status(400).json({ error: 'Invalid token payload' });
        }
        console.log('✅ Token verified for user:', payload.email);
        // Check if user exists
        let user = await User.findOne({ googleId: payload.sub });
        if (!user) {
            console.log('👤 Creating new user:', payload.email);
            // Create new user
            user = new User({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            });
            await user.save();
        }
        else {
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
    }
    catch (error) {
        console.error('❌ Google auth error:', error);
        console.error('🔍 Error details:', {
            message: error?.message,
            name: error?.name,
            stack: error?.stack?.split('\n')[0]
        });
        res.status(500).json({ error: 'Authentication failed', details: error?.message });
    }
});
export default router;
