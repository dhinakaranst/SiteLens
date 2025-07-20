import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
const router = express.Router();
// Initialize Google OAuth client with caching
let client = null;
const getOAuthClient = () => {
    if (!client) {
        client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
    }
    return client;
};
// Google OAuth login endpoint with performance optimizations
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'No credential provided' });
        }
        // Set a timeout for the entire operation
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
        });
        // Verify the Google ID token with timeout
        const verificationPromise = getOAuthClient().verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID
        });
        const ticket = await Promise.race([verificationPromise, timeoutPromise]);
        if (!ticket || typeof ticket === 'string') {
            return res.status(400).json({ error: 'Token verification timeout or failed' });
        }
        const loginTicket = ticket;
        const payload = loginTicket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        const { sub: googleId, name, email, picture } = payload;
        // Check if user already exists with timeout
        const userPromise = User.findOne({ googleId });
        let user = await Promise.race([userPromise, timeoutPromise]);
        if (typeof user === 'string') {
            return res.status(500).json({ error: 'Database timeout' });
        }
        if (!user) {
            // Create new user with timeout
            const newUser = new User({
                googleId,
                name,
                email,
                picture
            });
            user = await Promise.race([newUser.save(), timeoutPromise]);
            if (typeof user === 'string') {
                return res.status(500).json({ error: 'Database timeout' });
            }
        }
        // Return user data (without sensitive info)
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('Google OAuth error:', error);
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('timeout')) {
                return res.status(408).json({ error: 'Authentication timeout. Please try again.' });
            }
            if (error.message.includes('invalid_token')) {
                return res.status(401).json({ error: 'Invalid authentication token.' });
            }
        }
        res.status(500).json({ error: 'Authentication failed. Please try again.' });
    }
});
// Get current user endpoint
router.get('/me', async (req, res) => {
    try {
        const userId = req.headers.authorization?.replace('Bearer ', '');
        if (!userId) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});
export default router;
