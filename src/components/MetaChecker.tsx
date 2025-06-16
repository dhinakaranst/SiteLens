import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface MetaCheckResult {
  url: string;
  title: {
    text: string;
    length: number;
    status: 'good' | 'warning' | 'error';
  };
  description: {
    text: string;
    length: number;
    status: 'good' | 'warning' | 'error';
  };
}

const StatusIndicator: React.FC<{ status: 'good' | 'warning' | 'error' }> = ({ status }) => {
  switch (status) {
    case 'good':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
  }
};

const getStatusColor = (status: 'good' | 'warning' | 'error') => {
  switch (status) {
    case 'good': return 'text-green-700 bg-green-50 border-green-200';
    case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'error': return 'text-red-700 bg-red-50 border-red-200';
  }
};

const getOptimalRange = (type: 'title' | 'description') => {
  return type === 'title' ? '50-60 characters' : '150-160 characters';
};

export const MetaChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MetaCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }

      const response = await axios.post(`${API_BASE_URL}/api/meta-check`, {
        url: processedUrl,
      });

      setResult(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setUrl('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meta Title & Description Checker</h2>
          <p className="text-sm text-gray-600">Check if your title and description are optimized for SEO</p>
        </div>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Meta Tags</span>
            )}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Results</h3>
            <button
              onClick={reset}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Check another URL
            </button>
          </div>

          {/* Title Analysis */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(result.title.status)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <StatusIndicator status={result.title.status} />
                <h4 className="font-semibold">Title Tag</h4>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold">{result.title.length} chars</div>
                <div className="text-xs opacity-75">Optimal: {getOptimalRange('title')}</div>
              </div>
            </div>
            <div className="bg-white bg-opacity-50 p-3 rounded border">
              <p className="text-sm font-medium">{result.title.text || 'No title found'}</p>
            </div>
            {result.title.status === 'warning' && (
              <p className="text-xs mt-2 opacity-75">
                {result.title.length < 50 ? 'Title is too short. Consider adding more descriptive keywords.' : 'Title is too long. Consider shortening for better display in search results.'}
              </p>
            )}
            {result.title.status === 'error' && (
              <p className="text-xs mt-2 opacity-75">
                {result.title.length === 0 ? 'Missing title tag. Add a descriptive title for better SEO.' : 'Title length is not optimal for SEO.'}
              </p>
            )}
          </div>

          {/* Description Analysis */}
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(result.description.status)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <StatusIndicator status={result.description.status} />
                <h4 className="font-semibold">Meta Description</h4>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold">{result.description.length} chars</div>
                <div className="text-xs opacity-75">Optimal: {getOptimalRange('description')}</div>
              </div>
            </div>
            <div className="bg-white bg-opacity-50 p-3 rounded border">
              <p className="text-sm">{result.description.text || 'No meta description found'}</p>
            </div>
            {result.description.status === 'warning' && (
              <p className="text-xs mt-2 opacity-75">
                {result.description.length < 150 ? 'Description is too short. Add more compelling details.' : 'Description is too long. Consider shortening for better display.'}
              </p>
            )}
            {result.description.status === 'error' && (
              <p className="text-xs mt-2 opacity-75">
                {result.description.length === 0 ? 'Missing meta description. Add a compelling description for better click-through rates.' : 'Description length is not optimal for SEO.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};