import React, { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { SEOReport } from './components/SEOReport';
import { MetaChecker } from './components/MetaChecker';
import { HeadingsAnalyzer } from './components/HeadingsAnalyzer';
import { SocialTagsChecker } from './components/SocialTagsChecker';
import { useSEOAnalysis } from './hooks/useSEOAnalysis';
import { AlertCircle, Search, Hash, FileText, Share2 } from 'lucide-react';
import sitelensLogo from './assets/sitelens_logo.png';

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
        {/* Top Navigation Bar */}
        <nav className="flex items-center mb-8 px-2">
          <img 
            src={sitelensLogo}
            alt="SEO SiteLens Logo - Website SEO Analyzer" 
            className="h-24 w-auto mr-8 mt-2"
          />
          <div className="flex gap-2 ml-auto">
            <a href="/features" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">SEO Features</a>
            <a href="/contact" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">Contact Us</a>
            <a href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" target="_blank" rel="noopener" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">Google SEO Starter Guide</a>
            <a href="https://moz.com/learn/seo/what-is-seo" target="_blank" rel="noopener" className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">Moz: What is SEO?</a>
          </div>
        </nav>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comprehensive SEO Audit & Optimization Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive SEO analysis tools to optimize your website's search engine performance
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">SEO Audit. Instantly.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Analyze and optimize your website’s SEO in seconds.</p>
        </div>
        {/* Tool Selector - 2x2 grid, tighter spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-xl mx-auto">
          <button
            onClick={() => setActiveTool('full-audit')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${activeTool === 'full-audit' ? 'bg-blue-600 text-white border-transparent shadow-lg scale-105' : 'bg-white text-blue-700 border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
          >Audit Website</button>
          <button
            onClick={() => setActiveTool('meta-checker')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${activeTool === 'meta-checker' ? 'bg-green-600 text-white border-transparent shadow-lg scale-105' : 'bg-white text-green-700 border-gray-200 hover:border-green-300 hover:shadow-md'}`}
          >Meta Checker</button>
          <button
            onClick={() => setActiveTool('headings-analyzer')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${activeTool === 'headings-analyzer' ? 'bg-purple-600 text-white border-transparent shadow-lg scale-105' : 'bg-white text-purple-700 border-gray-200 hover:border-purple-300 hover:shadow-md'}`}
          >Heading Audit</button>
          <button
            onClick={() => setActiveTool('social-tags')}
            className={`p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 text-left ${activeTool === 'social-tags' ? 'bg-pink-600 text-white border-transparent shadow-lg scale-105' : 'bg-white text-pink-700 border-gray-200 hover:border-pink-300 hover:shadow-md'}`}
          >Social Tags</button>
        </div>
        {/* Active Tool Content - form stays centered and simple */}
        <div className="w-full flex justify-center">
          {activeTool === 'full-audit' && (
            <UrlInput onAnalyze={analyzeWebsite} isLoading={isLoading} placeholder="Enter website URL (e.g., https://yourdomain.com)" />
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