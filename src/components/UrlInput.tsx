import React, { useState } from 'react';
import { Search, Globe, Loader } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = `https://${processedUrl}`;
    }

    if (!validateUrl(processedUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    onAnalyze(processedUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <Globe className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SEO Audit Tool
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get comprehensive SEO insights for any website. Analyze meta tags, performance metrics, 
          and discover optimization opportunities in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="Enter website URL (e.g., example.com or https://example.com)"
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
              error ? 'border-red-300' : 'border-gray-200'
            }`}
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2 px-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Analyze Website</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="font-semibold text-blue-900">Meta Analysis</div>
          <div className="text-sm text-blue-700">Titles, descriptions, headings</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="font-semibold text-green-900">Performance</div>
          <div className="text-sm text-green-700">Speed & mobile-friendliness</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="font-semibold text-purple-900">Technical SEO</div>
          <div className="text-sm text-purple-700">Structure & accessibility</div>
        </div>
      </div>
    </div>
  );
};