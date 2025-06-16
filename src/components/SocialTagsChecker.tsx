import React, { useState } from 'react';
import { Share2, CheckCircle, XCircle, Loader, Facebook, Twitter } from 'lucide-react';
import axios from 'axios';

interface SocialTag {
  name: string;
  content: string;
  missing: boolean;
}

interface SocialTagsResult {
  url: string;
  openGraph: SocialTag[];
  twitterCard: SocialTag[];
  summary: {
    openGraphComplete: boolean;
    twitterCardComplete: boolean;
    totalTags: number;
    missingTags: number;
  };
}

const StatusIcon: React.FC<{ missing: boolean }> = ({ missing }) => {
  return missing ? (
    <XCircle className="w-4 h-4 text-red-600" />
  ) : (
    <CheckCircle className="w-4 h-4 text-green-600" />
  );
};

export const SocialTagsChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SocialTagsResult | null>(null);
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

      const response = await axios.post(`${API_BASE_URL}/api/social-tags`, {
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
        <div className="p-2 bg-purple-100 rounded-lg">
          <Share2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Social Media Tags Checker</h2>
          <p className="text-sm text-gray-600">Check OpenGraph and Twitter Card tags for social sharing</p>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Social Tags</span>
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
            <h3 className="text-lg font-medium text-gray-900">Social Tags Analysis</h3>
            <button
              onClick={reset}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Check another URL
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${result.summary.openGraphComplete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="font-medium">OpenGraph</span>
                <StatusIcon missing={!result.summary.openGraphComplete} />
              </div>
              <p className="text-sm text-gray-600">
                {result.openGraph.filter(tag => !tag.missing).length} of {result.openGraph.length} tags present
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${result.summary.twitterCardComplete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Twitter Card</span>
                <StatusIcon missing={!result.summary.twitterCardComplete} />
              </div>
              <p className="text-sm text-gray-600">
                {result.twitterCard.filter(tag => !tag.missing).length} of {result.twitterCard.length} tags present
              </p>
            </div>
          </div>

          {/* OpenGraph Tags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">OpenGraph Tags</h4>
            </div>
            <div className="space-y-2">
              {result.openGraph.map((tag, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <StatusIcon missing={tag.missing} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      {tag.missing && <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">Missing</span>}
                    </div>
                    {tag.content ? (
                      <p className="text-sm text-gray-600 break-words">{tag.content}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No content found</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Twitter Card Tags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Twitter className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-gray-900">Twitter Card Tags</h4>
            </div>
            <div className="space-y-2">
              {result.twitterCard.map((tag, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <StatusIcon missing={tag.missing} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      {tag.missing && <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">Missing</span>}
                    </div>
                    {tag.content ? (
                      <p className="text-sm text-gray-600 break-words">{tag.content}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No content found</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};