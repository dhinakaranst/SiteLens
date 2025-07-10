import React, { useState } from 'react';
import { Search, Globe, Loader } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps & { placeholder?: string }> = ({ onAnalyze, isLoading, placeholder }) => {
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Globe className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="website-url"
          name="website-url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          placeholder={placeholder || "Enter website URL (e.g., example.com or https://example.com)"}
          className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
          disabled={isLoading}
          aria-label="Website URL"
          aria-describedby={error ? "url-error" : undefined}
        />
      </div>
      {error && (
        <p id="url-error" className="text-red-600 text-sm mt-2 px-1">{error}</p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/30"
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
  );
};