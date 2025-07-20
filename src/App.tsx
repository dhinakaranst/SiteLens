import React, { useState, useRef, useCallback, useEffect, Suspense, lazy } from 'react';
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
import { AlertCircle, Search, Hash, FileText, Share2, Rocket, Brain, CheckCircle, Zap, Shield, Download, User, Clock, Menu, X, ChevronDown, Globe } from 'lucide-react';
import sitelensLogo from './assets/sitelens_logo.webp';

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

const NotFound = lazy(() => import('./components/NotFound'));

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
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      <section className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in">SEO Analyzer</h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">Scan your website in seconds. Get SEO scores, issues, and fixes with one click.</p>
          
          <form onSubmit={handleAuditSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
            <input
              type="url"
              value={inputs.url}
              onChange={(e) => setInputs({ ...inputs, url: e.target.value })}
              placeholder="Enter website URL (e.g., https://yourdomain.com)"
              className="flex-1 min-w-[320px] px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-400 text-lg bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-500 ease-out hover:shadow-xl focus:shadow-2xl hover:scale-[1.02] focus:scale-[1.02]"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-500 ease-out relative overflow-hidden group"
            >
              <span className="relative z-10">
                <svg aria-hidden="true" className="w-5 h-5 mr-1 -ml-1 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l7-7m0 0l-7-7m7 7H3" /></svg>
              </span>
              <span className="relative z-10">{isLoading ? 'Analyzing...' : 'Run SEO Audit'}</span>
            </button>
          </form>
          <div className="text-blue-600 font-medium text-sm mt-2">100% free. No signup required. 3 free audits/day</div>
        </div>
      </section>
      <section className="bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-blue-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">Instant SEO Reports</h3>
            <p className="text-black">Audit your website in under 30 seconds.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-purple-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M12 4v16m0 0H3" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">AI-Powered Fixes</h3>
            <p className="text-black">Get smart suggestions to improve your SEO.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-green-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17v-6m0 0V7m0 4h4m-4 0H8" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">PDF Reports</h3>
            <p className="text-black">Download and share detailed SEO audits.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-orange-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">No Login Needed</h3>
            <p className="text-black">Use without creating an account.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-blue-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">3 Free Audits Daily</h3>
            <p className="text-black">Fair usage limit to keep it free.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 flex flex-col items-start hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 mb-6 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
              <svg aria-hidden="true" className="w-8 h-8 text-red-600 transition-all duration-500 ease-out group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M12 8v4m0 4h.01" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 text-black">Secure & Private</h3>
            <p className="text-black">Your data is never stored or shared.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

function App() {
  const { isLoading, progress, report, error, analyzeWebsite: originalAnalyzeWebsite, resetReport } = useSEOAnalysis();
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

  // Show loading state with progress
  if (isLoading && activeTab === 'seo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <h2 className="text-xl font-semibold text-gray-900">Analyzing Website</h2>
          </div>
          {progress && progress.stage !== 'initial' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">{progress.message}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: progress.stage === 'fetching' ? '25%' : 
                           progress.stage === 'analyzing' ? '50%' : 
                           progress.stage === 'pagespeed' ? '75%' : 
                           progress.stage === 'ai' ? '90%' : '100%' 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {progress.stage === 'fetching' ? 'Fetching website content...' :
                 progress.stage === 'analyzing' ? 'Analyzing SEO elements...' :
                 progress.stage === 'pagespeed' ? 'Running performance tests...' :
                 progress.stage === 'ai' ? 'Generating AI recommendations...' :
                 'Completing analysis...'}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 text-center">
            This may take up to 60 seconds for large websites
          </p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'seo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Analysis Failed</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          {error.includes('timeout') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Try analyzing a smaller website or wait a few minutes before trying again. 
                Large websites with many resources may take longer to analyze.
              </p>
            </div>
          )}
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
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
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
      </Suspense>
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
    }, 500); // Increased delay for better user experience
  };

  return (
    <>
      {/* Modern Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <img src={sitelensLogo} alt="SiteLens Logo" className="h-8 w-auto lg:h-10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out scale-0 group-hover:scale-150"></div>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-black animate-fade-in">
                SiteLens
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `relative px-3 py-2 text-sm font-medium transition-all duration-500 ease-out hover:scale-105 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">Home</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-pulse-glow"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0 hover:opacity-100 transition-all duration-500 ease-out scale-95 hover:scale-100"></div>
                  </>
                )}
              </NavLink>
              
              {/* Features & Use Cases Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => handleMouseEnter("features")}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-500 ease-out group-hover:scale-105 relative overflow-hidden">
                  <span className="relative z-10">Features & Use Cases</span>
                  <ChevronDown className="ml-1 w-4 h-4 transition-all duration-500 ease-out group-hover:rotate-180 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out scale-95 group-hover:scale-100"></div>
                </button>
                {hoveredMenu === "features" && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-gray-100 animate-in fade-in-0 slide-in-from-top-2 duration-500 ease-out"
                    onMouseEnter={() => handleMouseEnter("features")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <h4 className="text-xs font-semibold text-gray-500 mb-4 px-2 uppercase tracking-wider">Explore SEO Tools</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowSEOAudit(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl flex items-center transition-all duration-500 ease-out hover:scale-105 group/item relative overflow-hidden"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-blue-200 transition-all duration-500 ease-out group-hover/item:scale-110 group-hover/item:rotate-3">
                          <Search className="w-5 h-5 text-blue-600 transition-all duration-500 ease-out group-hover/item:scale-110" />
                        </div>
                        <div className="relative z-10">
                          <div className="font-medium text-gray-900">SEO Checker</div>
                          <div className="text-sm text-gray-500">Complete website analysis</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all duration-500 ease-out scale-95 group-hover/item:scale-100"></div>
                      </button>
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl flex items-center transition-all duration-300 hover:scale-105 group/item"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-green-200 transition-colors">
                          <Hash className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Keyword Checker</div>
                          <div className="text-sm text-gray-500">Keyword analysis & research</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl flex items-center transition-all duration-300 hover:scale-105 group/item"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-purple-200 transition-colors">
                          <Share2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Backlink Checker</div>
                          <div className="text-sm text-gray-500">Analyze backlink profile</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group-hover:scale-105">
                  Resources
                  <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
                {hoveredMenu === "resources" && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-gray-100 animate-in fade-in-0 slide-in-from-top-2 duration-300"
                    onMouseEnter={() => handleMouseEnter("resources")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl flex items-center transition-all duration-300 hover:scale-105 group/item"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-orange-200 transition-colors">
                          <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Documentation</div>
                          <div className="text-sm text-gray-500">Guides & tutorials</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl flex items-center transition-all duration-300 hover:scale-105 group/item"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-indigo-200 transition-colors">
                          <Brain className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Blog</div>
                          <div className="text-sm text-gray-500">SEO insights & tips</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setShowComingSoon(true)} 
                        className="w-full text-left px-3 py-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 rounded-xl flex items-center transition-all duration-300 hover:scale-105 group/item"
                      >
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-pink-200 transition-colors">
                          <Rocket className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Case Studies</div>
                          <div className="text-sm text-gray-500">Success stories</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <NavLink 
                to="/pricing" 
                className={({ isActive }) => 
                  `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Pricing
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    )}
                  </>
                )}
              </NavLink>

              {/* Language Selector */}
              <div className="relative group">
                <button 
                  className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-all duration-300 group-hover:scale-105" 
                  onClick={() => setShowLangDropdown((v: boolean) => !v)}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {lang}
                  <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    {["EN", "ES", "FR"].map(l => (
                      <button 
                        key={l} 
                        className={`block w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors duration-200 ${
                          lang === l ? "font-bold text-blue-600 bg-blue-50" : ""
                        }`} 
                        onClick={() => { 
                          setLang(l); 
                          setShowLangDropdown(false); 
                          localStorage.setItem('lang', l); 
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* User Actions & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="hidden sm:block">
                  <UserProfile />
                </div>
              ) : (
                <div className="hidden sm:block">
                  <GoogleLoginComponent />
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className={`lg:hidden transition-all duration-700 ease-out ${
            mobileMenuOpen 
              ? 'max-h-[500px] opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-b-2xl shadow-lg">
              <NavLink 
                to="/" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-500 ease-out hover:scale-105 relative overflow-hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-0 hover:opacity-100 transition-all duration-500 ease-out scale-95 hover:scale-100"></div>
              </NavLink>
              
              {/* Mobile Features Section */}
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Features</div>
                <div className="space-y-2">
                  <button 
                    className="w-full text-left px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowSEOAudit(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    SEO Checker
                  </button>
                  <button 
                    className="w-full text-left px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-xl transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowComingSoon(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Hash className="w-4 h-4 text-green-600" />
                    </div>
                    Keyword Checker
                  </button>
                  <button 
                    className="w-full text-left px-3 py-3 text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowComingSoon(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Share2 className="w-4 h-4 text-purple-600" />
                    </div>
                    Backlink Checker
                  </button>
                </div>
              </div>

              {/* Mobile Resources Section */}
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Resources</div>
                <div className="space-y-2">
                  <button 
                    className="w-full text-left px-3 py-3 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowComingSoon(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    Documentation
                  </button>
                  <button 
                    className="w-full text-left px-3 py-3 text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 flex items-center"
                    onClick={() => {
                      setShowComingSoon(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    Blog
                  </button>
                </div>
              </div>

              <NavLink 
                to="/pricing" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </NavLink>

              {/* Mobile User Actions */}
              <div className="px-4 py-3 border-t border-gray-100">
                {user ? (
                  <UserProfile />
                ) : (
                  <GoogleLoginComponent />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage analyzeWebsite={analyzeWebsite} isLoading={isLoading} />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="*" element={<NotFound />} />
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
        <SeoAuditSections 
          user={user} 
          setShowSEOAudit={setShowSEOAudit}
          setShowLogin={() => {
            // This will be handled by the scroll and click approach
          }}
        />
      )}
    </>
  );
}

export default App;