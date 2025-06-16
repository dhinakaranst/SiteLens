import React, { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { SEOReport } from './components/SEOReport';
import { MetaChecker } from './components/MetaChecker';
import { HeadingsAnalyzer } from './components/HeadingsAnalyzer';
import { SocialTagsChecker } from './components/SocialTagsChecker';
import { useSEOAnalysis } from './hooks/useSEOAnalysis';
import { AlertCircle, Search, Hash, FileText, Share2 } from 'lucide-react';

type ActiveTool = 'full-audit' | 'meta-checker' | 'headings-analyzer' | 'social-tags';

function App() {
  const { isLoading, report, error, analyzeWebsite, resetReport } = useSEOAnalysis();
  const [activeTool, setActiveTool] = useState<ActiveTool>('full-audit');

  const tools = [
    {
      id: 'full-audit' as ActiveTool,
      name: 'Full SEO Audit',
      description: 'Complete website analysis',
      icon: Search,
      color: 'blue'
    },
    {
      id: 'meta-checker' as ActiveTool,
      name: 'Meta Tags Checker',
      description: 'Title & description length',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'headings-analyzer' as ActiveTool,
      name: 'Headings Analyzer',
      description: 'H1-H6 structure analysis',
      icon: Hash,
      color: 'purple'
    },
    {
      id: 'social-tags' as ActiveTool,
      name: 'Social Tags Checker',
      description: 'OpenGraph & Twitter cards',
      icon: Share2,
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      pink: isActive ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (error && activeTool === 'full-audit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analysis Failed</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={resetReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <p className="text-xs text-gray-500 text-center">
              Make sure the website is accessible and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (report && activeTool === 'full-audit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8">
        <SEOReport report={report} onBack={resetReport} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SEO Analysis Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive SEO analysis tools to optimize your website's search engine performance
          </p>
        </div>

        {/* Tool Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isActive 
                    ? 'border-transparent shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${getColorClasses(tool.color, isActive)}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className="w-6 h-6" />
                  <h3 className="font-semibold">{tool.name}</h3>
                </div>
                <p className={`text-sm ${isActive ? 'text-white/90' : 'opacity-75'}`}>
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Tool Content */}
        <div className="w-full">
          {activeTool === 'full-audit' && (
            <div className="flex items-center justify-center">
              <UrlInput onAnalyze={analyzeWebsite} isLoading={isLoading} />
            </div>
          )}
          {activeTool === 'meta-checker' && <MetaChecker />}
          {activeTool === 'headings-analyzer' && <HeadingsAnalyzer />}
          {activeTool === 'social-tags' && <SocialTagsChecker />}
        </div>
      </div>
    </div>
  );
}

export default App;