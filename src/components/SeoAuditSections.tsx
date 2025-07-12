import React from 'react';
import { CheckCircle } from 'lucide-react';
import sitelensLogo from '../assets/sitelens_logo.png';

interface SeoAuditSectionsProps {
  user: any;
  setShowSEOAudit: (show: boolean) => void;
}

export default function SeoAuditSections({ user, setShowSEOAudit }: SeoAuditSectionsProps) {
  return (
    <>
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

      {/* CTA at bottom */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Free – Google Login Required</h2>
          <p className="text-xl text-blue-100 mb-8">Get started with 3 free checks per day. Upgrade for unlimited access and premium PDF reports!</p>
          {user ? (
            <button
              className="px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              onClick={() => setShowSEOAudit(true)}
            >
              Start Free SEO Audit
            </button>
          ) : (
            <button
              className="px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Login with Google to Start Free
            </button>
          )}
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
    </>
  );
} 