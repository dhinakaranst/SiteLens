import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GoogleLoginComponent: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the same API base URL configuration as other components
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Debug logging
  console.log('🔧 Debug Info:', {
    API_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV
  });

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    setIsLoading(true);
    console.log('🚀 Starting Google OAuth login...');
    console.log('📡 API URL:', `${API_BASE_URL}/api/auth/google`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      }, {
        timeout: 15000 // 15 second timeout
      });

      if (response.data.user) {
        login(response.data.user);
        console.log('✅ Login successful:', response.data.user.name);
      }
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      
      // Type guard for error object
      const isErrorWithProperties = (err: unknown): err is { 
        message?: string; 
        code?: string; 
        response?: { status?: number; statusText?: string; data?: unknown } 
      } => {
        return typeof err === 'object' && err !== null;
      };
      
      if (isErrorWithProperties(error)) {
        console.error('🔍 Error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (isErrorWithProperties(error) && error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running and try again.';
      } else if (isErrorWithProperties(error) && error.code === 'ECONNABORTED') {
        errorMessage = 'Login timeout. Please check your connection and try again.';
      } else if (isErrorWithProperties(error) && error.response?.status === 408) {
        errorMessage = 'Authentication timeout. Please try again.';
      } else if (isErrorWithProperties(error) && error.response?.status === 401) {
        errorMessage = 'Invalid authentication. Please try again.';
      } else if (isErrorWithProperties(error) && error.response?.status === 403) {
        errorMessage = 'Access denied. Please check your Google OAuth configuration.';
      } else if (isErrorWithProperties(error) && error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check server configuration.';
      } else if (isErrorWithProperties(error) && error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        errorMessage = String(error.response.data.error);
      } else if (isErrorWithProperties(error) && error.message) {
        errorMessage = error.message;
      }
      
      // Use a more user-friendly notification instead of alert
      console.error('Login error:', errorMessage);
      // You could replace this with a toast notification
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error?: unknown) => {
    console.error('Google login failed:', error);
    
    let message = 'Google login failed. Please try again.';
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        message = error.message;
      } else if ('toString' in error && typeof error.toString === 'function') {
        message = error.toString();
      }
    }
    
    alert(message);
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