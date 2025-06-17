import React, { useState } from 'react';
import { Hash, CheckCircle, AlertTriangle, XCircle, Loader, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface HeadingItem {
  tag: string;
  text: string;
  level: number;
}

interface HeadingsResult {
  url: string;
  headings: HeadingItem[];
  summary: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    total: number;
  };
  warnings: string[];
}

const getHeadingColor = (level: number) => {
  const colors = [
    'bg-red-100 text-red-800 border-red-200',      // H1
    'bg-blue-100 text-blue-800 border-blue-200',   // H2
    'bg-green-100 text-green-800 border-green-200', // H3
    'bg-yellow-100 text-yellow-800 border-yellow-200', // H4
    'bg-purple-100 text-purple-800 border-purple-200', // H5
    'bg-pink-100 text-pink-800 border-pink-200',   // H6
  ];
  return colors[level - 1] || colors[0];
};

const getIndentation = (level: number) => {
  return `ml-${Math.min((level - 1) * 4, 16)}`;
};

export const HeadingsAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HeadingsResult | null>(null);
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

      const response = await axios.post(`${API_BASE_URL}/api/headings`, {
        url: processedUrl,
      });

      setResult(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
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
        <div className="p-2 bg-green-100 rounded-lg">
          <Hash className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Headings Analyzer</h2>
          <p className="text-sm text-gray-600">Analyze heading structure and hierarchy (H1-H6)</p>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze Headings</span>
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
            <h3 className="text-lg font-medium text-gray-900">Headings Structure</h3>
            <button
              onClick={reset}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Analyze another URL
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(result.summary).slice(0, 6).map(([key, count]) => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600 uppercase">{key.replace('Count', '')}</div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span>Issues Found</span>
              </h4>
              {result.warnings.map((warning, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{warning}</p>
                </div>
              ))}
            </div>
          )}

          {/* Headings List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Heading Structure</h4>
            {result.headings.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No headings found on this page</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.headings.map((heading, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getIndentation(heading.level)}`}
                    style={{ marginLeft: `${(heading.level - 1) * 16}px` }}
                  >
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {heading.level > 1 && (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getHeadingColor(heading.level)}`}>
                        {heading.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1 min-w-0">
                      {heading.text || <em className="text-gray-400">Empty heading</em>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};