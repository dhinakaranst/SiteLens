import { useState } from 'react';
import axios from 'axios';
import { SEOReport } from '../types/seo';

export type AnalysisProgress = {
  stage: 'initial' | 'fetching' | 'analyzing' | 'pagespeed' | 'ai' | 'complete' | 'error';
  message: string;
};

export const useSEOAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({ stage: 'initial', message: '' });
  const [report, setReport] = useState<SEOReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const analyzeWebsite = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setProgress({ stage: 'initial', message: 'Starting analysis...' });

    // Create an EventSource for progress updates
    const eventSource = new EventSource(`${API_BASE_URL}/api/audit/progress?url=${encodeURIComponent(url)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    try {
      // Start with optimistic update
      setProgress({ stage: 'fetching', message: 'Fetching website content...' });
      
      const response = await axios.post(`${API_BASE_URL}/api/audit`, {
        url,
      }, {
        timeout: 60000, // Increased back to 60 seconds for better reliability
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress({ 
              stage: 'fetching', 
              message: `Fetching website content... ${percentCompleted}%` 
            });
          }
        }
      });

      setProgress({ stage: 'complete', message: 'Analysis complete!' });
      setReport(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          setError('Analysis timed out. The website might be slow or too large. Please try again or try a smaller website.');
        } else if (err.response?.status === 404) {
          setError('Server is starting up. Please wait a moment and try again. This can take up to 50 seconds on the free tier.');
        } else if (err.response?.status === 503 || err.response?.status === 502) {
          setError('Server is temporarily unavailable. Please try again in a few moments.');
        } else {
          setError(err.response?.data?.error || err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
      eventSource.close();
    }
  };

  return {
    isLoading,
    progress,
    report,
    error,
    analyzeWebsite,
    resetReport: () => {
      setReport(null);
      setError(null);
      setProgress({ stage: 'initial', message: '' });
    },
  };
};