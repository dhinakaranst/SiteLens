import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { UrlInput } from './components/UrlInput';
import { SEOReport } from './components/SEOReport';
import { MetaChecker } from './components/MetaChecker';
import { HeadingsAnalyzer } from './components/HeadingsAnalyzer';
import { SocialTagsChecker } from './components/SocialTagsChecker';
import { useSEOAnalysis } from './hooks/useSEOAnalysis';
import { useAuth } from './contexts/AuthContext';
import GoogleLoginComponent from './components/GoogleLogin';
import UserProfile from './components/UserProfile';
import SeoAuditSections from './components/SeoAuditSections';
import { AlertCircle, Search, Hash, FileText, Share2, Rocket, Brain, CheckCircle, Zap, Shield, Download, User, Clock } from 'lucide-react';
import sitelensLogo from './assets/sitelens_logo.png';

type ActiveTool = 'full-audit' | 'meta-checker' | 'headings-analyzer' | 'social-tags';

const PDFPremiumModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-gray-600 mb-6">PDF reports are available for Pro users. Upgrade to unlock this feature!</p>
        <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Got it
        </button>
      </div>
    </div>
  );
};

const Toast = ({ message, show }: { message: string; show: boolean }) => (
  <div className={`fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
    {message}
  </div>
);

const ComingSoonModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-6">This feature is currently in development. Stay tuned for updates!</p>
        <button onClick={onClose} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Got it
        </button>
      </div>
    </div>
  );
};

const SEOAuditModal = ({ open, onClose, isLoading, checksLeft, handleToolAction, showPDFModal, setShowPDFModal }: any) => {
  const [inputs, setInputs] = useState({ url: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.url.trim()) {
      handleToolAction('seo');
      onClose();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4 w-full">
        <h2 className="text-2xl font-bold mb-4">SEO Audit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              value={inputs.url}
              onChange={(e) => setInputs({ ...inputs, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Start Audit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
        <p className="text-sm text-gray-500 mt-4">Checks remaining: {checksLeft}</p>
      </div>
    </div>
  );
};

const FeaturesPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Features & Use Cases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">SEO Audit</h2>
          <p className="text-gray-600">Complete website analysis with detailed recommendations.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Meta Tags Checker</h2>
          <p className="text-gray-600">Analyze title and description optimization.</p>
        </div>
      </div>
    </div>
  </div>
);

const PricingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your SEO needs. Start free and upgrade as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-gray-600">Perfect for getting started</p>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">3 SEO audits per day</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Basic SEO reports</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Meta tags analysis</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Headings structure check</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Social media tags</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Email support</span>
            </li>
          </ul>
          
          <button className="w-full bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            Get Started Free
          </button>
        </div>

        {/* Pro Plan - Featured */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative transform scale-105">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-blue-600">$29</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-gray-600">For serious SEO professionals</p>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Unlimited SEO audits</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Premium PDF reports</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Advanced analytics</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Competitor analysis</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Keyword tracking</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Priority support</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">API access</span>
            </li>
          </ul>
          
          <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Start Pro Trial
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">$99</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="text-gray-600">For teams and agencies</p>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Everything in Pro</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Team collaboration</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">White-label reports</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Custom integrations</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">Dedicated account manager</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">24/7 phone support</span>
            </li>
          </ul>
          
          <button className="w-full bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-gray-600">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
            <p className="text-gray-600">Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
            <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ResourcesPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>
          <p className="text-gray-600">Learn how to use our SEO tools effectively.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Blog</h2>
          <p className="text-gray-600">Latest SEO tips and industry insights.</p>
        </div>
      </div>
    </div>
  </div>
);

// ProtectedRoute wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  return <>{children}</>;
}

const HomePage = ({ 
  analyzeWebsite, 
  isLoading 
}: { 
  analyzeWebsite: (url: string) => void;
  isLoading: boolean;
}) => {
  const [inputs, setInputs] = useState({ url: '' });

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.url.trim()) {
      analyzeWebsite(inputs.url);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">SEO Audit. Instantly.</h1>
          <p className="text-xl text-gray-600 mb-8">Scan your website in seconds. Get SEO scores, issues, and fixes with one click.</p>
          <form onSubmit={handleAuditSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <input
              type="url"
              value={inputs.url}
              onChange={(e) => setInputs({ ...inputs, url: e.target.value })}
              placeholder="Enter website URL (e.g., https://yourdomain.com)"
              className="flex-1 min-w-[320px] px-6 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg bg-white shadow-sm transition-all duration-300"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-lg hover:bg-blue-600 hover:scale-105 hover:shadow-lg transition-all duration-200"
            >
              <span>
                <svg aria-hidden="true" className="w-5 h-5 mr-1 -ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" /></svg>
              </span>
              {isLoading ? 'Analyzing...' : 'Run SEO Audit'}
            </button>
          </form>
          <div className="text-blue-600 font-medium text-sm mt-2">100% free. No signup required. 3 free audits/day</div>
        </div>
      </section>
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-blue-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Instant SEO Reports</h3>
            <p className="text-gray-600">Audit your website in under 30 seconds.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-purple-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M12 4v16m0 0H3" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">AI-Powered Fixes</h3>
            <p className="text-gray-600">Get smart suggestions to improve your SEO.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-green-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17v-6m0 0V7m0 4h4m-4 0H8" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">PDF Reports</h3>
            <p className="text-gray-600">Download and share detailed SEO audits.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-orange-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">No Login Needed</h3>
            <p className="text-gray-600">Use without creating an account.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-blue-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">3 Free Audits Daily</h3>
            <p className="text-gray-600">Fair usage limit to keep it free.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
            <div className="bg-red-100 rounded-lg p-3 mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M12 8v4m0 4h.01" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Secure & Private</h3>
            <p className="text-gray-600">Your data is never stored or shared.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

function App() {
  const { isLoading, report, error, analyzeWebsite: originalAnalyzeWebsite, resetReport } = useSEOAnalysis();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('seo');
  const [showToast, setShowToast] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [checksLeft, setChecksLeft] = useState(3);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showSEOAudit, setShowSEOAudit] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const [showResources, setShowResources] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [lang, setLang] = useState('EN');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setHoveredMenu(null);
        setShowLangDropdown(false);
      }
      if (!target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Handle hover with delay
  const handleMouseEnter = (menuType: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredMenu(menuType);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredMenu(null);
    }, 300); // 300ms delay before closing
    setHoverTimeout(timeout);
  };

  // Memoize the analyzeWebsite function to prevent unnecessary re-renders
  const analyzeWebsite = useCallback((url: string) => {
    originalAnalyzeWebsite(url);
  }, [originalAnalyzeWebsite]);

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

  // Simulate tool action (replace with real logic)
  const handleToolAction = (tabId: string) => {
    if (checksLeft <= 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }
    if (tabId === 'seo') {
      // This will be handled by the HomePage component now
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } else {
      // Simulate check for other tools
      setChecksLeft(c => c - 1);
    }
  };

  // Helper for smooth scroll
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (user) {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (error && activeTab === 'seo') {
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

  if (report && activeTab === 'seo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8">
        <SEOReport report={report} onBack={resetReport} />
      </div>
    );
  }

  return (
    <>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LayoutWrapper 
          analyzeWebsite={analyzeWebsite}
          isLoading={isLoading}
          showToast={showToast}
          setShowToast={setShowToast}
          showPDFModal={showPDFModal}
          setShowPDFModal={setShowPDFModal}
          showComingSoon={showComingSoon}
          setShowComingSoon={setShowComingSoon}
          showSEOAudit={showSEOAudit}
          setShowSEOAudit={setShowSEOAudit}
          checksLeft={checksLeft}
          handleToolAction={handleToolAction}
          hoveredMenu={hoveredMenu}
          setHoveredMenu={setHoveredMenu}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          showLangDropdown={showLangDropdown}
          setShowLangDropdown={setShowLangDropdown}
          lang={lang}
          setLang={setLang}
          user={user}
        />
      </Router>
    </>
  );
}

// Layout wrapper to handle conditional rendering based on route
function LayoutWrapper({
  analyzeWebsite,
  isLoading,
  showToast,
  setShowToast,
  showPDFModal,
  setShowPDFModal,
  showComingSoon,
  setShowComingSoon,
  showSEOAudit,
  setShowSEOAudit,
  checksLeft,
  handleToolAction,
  hoveredMenu,
  setHoveredMenu,
  mobileMenuOpen,
  setMobileMenuOpen,
  showLangDropdown,
  setShowLangDropdown,
  lang,
  setLang,
  user
}: any) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isPricing = location.pathname === "/pricing";

  // Handle hover with delay
  const handleMouseEnter = (menuType: string) => {
    setHoveredMenu(menuType);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setHoveredMenu(null);
    }, 800); // Increased to 800ms for better usability
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={sitelensLogo} alt="SiteLens Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">SiteLens</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-600 font-medium transition-colors"}>Home</NavLink>
              
              {/* Features & Use Cases Dropdown */}
              <div
                className="relative dropdown-container"
                onMouseEnter={() => handleMouseEnter("features")}
                onMouseLeave={handleMouseLeave}
              >
                <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Features & Use Cases
                </button>
                {hoveredMenu === "features" && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[400px] bg-white shadow-lg rounded-xl p-4 border border-gray-100 animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    onMouseEnter={() => handleMouseEnter("features")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <h4 className="text-sm text-gray-500 mb-2 px-2">Explore SEO Tools</h4>
                    <ul className="text-sm space-y-2">
                      <li><button onClick={() => setShowSEOAudit(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">🔍 SEO Checker</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">🔑 Keyword Checker</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">🔗 Backlink Checker</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">📈 Ranking Checker</button></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative dropdown-container"
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Resources
                </button>
                {hoveredMenu === "resources" && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[300px] bg-white shadow-lg rounded-xl p-4 border border-gray-100 animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    onMouseEnter={() => handleMouseEnter("resources")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <ul className="text-sm space-y-2">
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">📘 Documentation</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">📝 Blog</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">🎥 Video Tutorials</button></li>
                      <li><button onClick={() => setShowComingSoon(true)} className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded flex items-center">📊 Case Studies</button></li>
                    </ul>
                  </div>
                )}
              </div>

              <NavLink to="/pricing" className={({ isActive }) => isActive ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-600 font-medium transition-colors"}>Pricing</NavLink>
              <div className="relative dropdown-container">
                <button className="flex items-center px-3 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-sm" onClick={() => setShowLangDropdown((v: boolean) => !v)}>
                  {lang}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow z-50">
                    {["EN", "ES", "FR"].map(l => (
                      <button key={l} className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${lang === l ? "font-bold text-blue-600" : ""}`} onClick={() => { setLang(l); setShowLangDropdown(false); localStorage.setItem('lang', l); }}>
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (<UserProfile />) : (<GoogleLoginComponent />)}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mobile-menu-container">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <NavLink 
                  to="/" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
                <div className="px-3 py-2">
                  <button 
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setShowSEOAudit(true)}
                  >
                    🔍 SEO Checker
                  </button>
                </div>
                <div className="px-3 py-2">
                  <button 
                    className="text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setShowComingSoon(true)}
                  >
                    📘 Documentation
                  </button>
                </div>
                <NavLink 
                  to="/pricing" 
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage analyzeWebsite={analyzeWebsite} isLoading={isLoading} />} />
        <Route path="/features" element={<ProtectedRoute><FeaturesPage /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toast and Modal components */}
      <Toast message="Daily limit reached. Upgrade to Pro for unlimited checks." show={showToast} />
      <PDFPremiumModal open={showPDFModal} onClose={() => setShowPDFModal(false)} />
      <ComingSoonModal open={showComingSoon} onClose={() => setShowComingSoon(false)} />
      <SEOAuditModal
        open={showSEOAudit}
        onClose={() => setShowSEOAudit(false)}
        isLoading={isLoading}
        checksLeft={checksLeft}
        handleToolAction={handleToolAction}
        showPDFModal={showPDFModal}
        setShowPDFModal={setShowPDFModal}
      />
      
      {/* Show SEO sections only on home page */}
      {isHome && (
        <SeoAuditSections user={user} setShowSEOAudit={setShowSEOAudit} />
      )}
    </>
  );
}

export default App;