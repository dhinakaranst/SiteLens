import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
    createdAt?: string;
  };
}

const GoogleLoginComponent: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the same API base URL configuration as other components
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSuccess = async (credentialResponse: unknown) => {
    setIsLoading(true);
    console.log('🚀 Starting Google OAuth login...');
    console.log('📡 API URL:', `${API_BASE_URL}/api/auth/google`);
    
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/google`, {
        credential: (credentialResponse as { credential: string }).credential
      }, {
        timeout: 15000 // 15 second timeout
      });

      if (response.data.user) {
        // Ensure createdAt is present for the User interface
        const userData = {
          ...response.data.user,
          createdAt: response.data.user.createdAt || new Date().toISOString()
        };
        login(userData);
        console.log('✅ Login successful:', userData.name);
      }
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if ((error as { code?: string })?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running and try again.';
      } else if ((error as { code?: string })?.code === 'ECONNABORTED') {
        errorMessage = 'Login timeout. Please check your connection and try again.';
      } else if ((error as { response?: { status?: number } })?.response?.status === 401) {
        errorMessage = 'Invalid authentication. Please try again.';
      } else if ((error as { response?: { status?: number } })?.response?.status === 403) {
        errorMessage = 'Access denied. Please check your Google OAuth configuration.';
      } else if ((error as { response?: { data?: { error?: string } } })?.response?.data?.error) {
        errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      
      console.error('Login error:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error?: unknown) => {
    console.error('Google login failed:', error);
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : 'Google login failed. Please try again.';
    alert(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <button 
          disabled 
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl opacity-75 cursor-not-allowed shadow-lg transition-all duration-300"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          <span className="font-medium">Signing in...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_blue"
        size="large"
        text="signin_with"
        shape="rectangular"
        data-login-trigger="true"
      />
    </div>
  );
};

export default GoogleLoginComponent;
