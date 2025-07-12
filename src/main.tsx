import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('Environment check:', {
  clientId: clientId ? 'Present' : 'Missing',
  nodeEnv: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL
});

if (!clientId) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
  console.error('Please check your .env file and ensure VITE_GOOGLE_CLIENT_ID is set');
} else {
  console.log('✅ Google OAuth Client ID loaded successfully');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId || ''}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
