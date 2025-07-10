import React, { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { SEOReport } from './components/SEOReport';
import { MetaChecker } from './components/MetaChecker';
import { HeadingsAnalyzer } from './components/HeadingsAnalyzer';
import { SocialTagsChecker } from './components/SocialTagsChecker';
import { useSEOAnalysis } from './hooks/useSEOAnalysis';
import { AlertCircle, Search, Hash, FileText, Share2, Rocket, Brain, CheckCircle, Zap, Shield, Download, User, Clock } from 'lucide-react';
import sitelensLogo from './assets/sitelens_logo.png';

type ActiveTool = 'full-audit' | 'meta-checker' | 'headings-analyzer' | 'social-tags';

function App() {
  const { isLoading, report, error, analyzeWebsite, resetReport } = useSEOAnalysis();
  const [activeTool, setActiveTool] = useState<ActiveTool>('full-audit');
  const [urlInput, setUrlInput] = useState('');
  const [checksLeft, setChecksLeft] = useState(3);

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
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={sitelensLogo}
                alt="SiteLens Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">SiteLens</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features & Use Cases</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#resources" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Resources</a>
              <div className="relative">
                <button className="flex items-center px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-sm">
                  EN
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Log in</a>
              <a href="#try" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors">Try it Free</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            SEO Audit. Instantly.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Scan your website in seconds. Get SEO scores, issues, and fixes with one click.
          </p>
          
          <form className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4 mb-6" 
                onSubmit={e => { e.preventDefault(); analyzeWebsite(urlInput); }}>
            <input
              type="text"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="Enter website URL (e.g., https://yourdomain.com)"
              className="flex-1 px-6 py-4 rounded-lg border border-gray-200 shadow-sm text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              disabled={isLoading || !urlInput}
            >
              <Rocket className="w-5 h-5" />
              {isLoading ? 'Auditing...' : 'Run SEO Audit'}
            </button>
          </form>
          
          <p className="text-blue-600 font-medium mb-2">100% free. No signup required. 3 free audits/day</p>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant SEO Reports</h3>
              <p className="text-gray-600">Audit your website in under 30 seconds.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Fixes</h3>
              <p className="text-gray-600">Get smart suggestions to improve your SEO.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Reports</h3>
              <p className="text-gray-600">Download and share detailed SEO audits.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Login Needed</h3>
              <p className="text-gray-600">Use without creating an account.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3 Free Audits Daily</h3>
              <p className="text-gray-600">Fair usage limit to keep it free.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is never stored or shared.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Meta Information */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Meta Information</h3>
              <p className="text-gray-600 mb-6">Ensure search engines and LLMs understand your content.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Meta title/description too short/long</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Missing canonical tags</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Robots meta tag issues</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Language declaration inconsistencies</span>
                </li>
              </ul>
            </div>

            {/* Page Quality */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Page Quality</h3>
              <p className="text-gray-600 mb-6">Unfold the full potential of your content.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Low word count</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Missing ALT tags</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Duplicate content</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Poor mobile optimization</span>
                </li>
              </ul>
            </div>

            {/* Page & Link Structure */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Page & Link Structure</h3>
              <p className="text-gray-600 mb-6">Make your site easy to crawl.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Missing or misordered heading tags</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dynamic internal link parameters</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Duplicate anchor text</span>
                </li>
              </ul>
            </div>

            {/* Server Configuration */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Server Configuration</h3>
              <p className="text-gray-600 mb-6">Technical foundation matters.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Redirect issues (www vs non-www)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Long page load time</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Excessive CSS/JS files</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Large HTML size</span>
                </li>
              </ul>
            </div>

            {/* External Factors */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 lg:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">External Factors</h3>
              <p className="text-gray-600 mb-6">Boost your authority and rankings.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Weak backlink profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Missing off-page optimizations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Free SEO Audit Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of website owners who trust SiteLens for their SEO analysis
          </p>
          <button
            onClick={() => document.getElementById('audit-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            Try it Free – No Signup Needed
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={sitelensLogo} alt="SiteLens Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold">SiteLens</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Professional SEO audit tools to help you improve your website's search engine rankings and performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li><a href="#privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:dhinakarant104@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                    dhinakarant104@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/dhinakaran-t-493308259" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/>
                    </svg>
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 SiteLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;