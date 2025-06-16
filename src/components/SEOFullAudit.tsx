import React, { useState } from 'react';
import { useSEOAnalysis, AnalysisProgress } from '../hooks/useSEOAnalysis';
import { SEOReport } from '../types/seo';
import { SEOReport as SEOReportDisplay } from './SEOReport';
import { UrlInput } from './UrlInput';

const getProgressColor = (stage: AnalysisProgress['stage']) => {
  switch (stage) {
    case 'initial':
      return 'text-blue-500';
    case 'fetching':
      return 'text-blue-600';
    case 'analyzing':
      return 'text-purple-600';
    case 'pagespeed':
      return 'text-orange-600';
    case 'ai':
      return 'text-green-600';
    case 'complete':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const SEOFullAudit: React.FC = () => {
  const [url, setUrl] = useState('');
  const { isLoading, progress, report, error, analyzeWebsite, resetReport } = useSEOAnalysis();

  const handleAnalyze = (urlToAnalyze: string) => {
    setUrl(urlToAnalyze);
    analyzeWebsite(urlToAnalyze);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Full SEO Audit</h2>
        <UrlInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />

        {progress && progress.stage !== 'initial' && (
          <div className={`mt-4 p-4 rounded-lg border ${getProgressColor(progress.stage)}`}>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              )}
              <span className="font-medium">{progress.message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {report && <SEOReportDisplay report={report} onBack={resetReport} />}
    </div>
  );
}; 