import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GoogleLoginComponent: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      // Set timeout for the request
      const response = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential
      }, {
        timeout: 15000 // 15 second timeout
      });

      if (response.data.user) {
        login(response.data.user);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Login timeout. Please check your connection and try again.';
      } else if (error.response?.status === 408) {
        errorMessage = 'Authentication timeout. Please try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid authentication. Please try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <button 
          disabled 
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Signing in...
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
      />
    </div>
  );
};

export default GoogleLoginComponent; 