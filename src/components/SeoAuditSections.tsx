import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SeoAuditSectionsProps {
  user: unknown;
  setShowSEOAudit: (show: boolean) => void;
  setShowLogin?: (show: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SeoAuditSections({ user, setShowSEOAudit, ...props }: SeoAuditSectionsProps) {

export default function SeoAuditSections({ user, setShowSEOAudit }: SeoAuditSectionsProps) {
  return (
    <>
      {/* Feature Deep-Dive Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Meta Information */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover-lift transition-all duration-500 ease-out group animate-fade-in">
              <h3 className="text-2xl font-bold text-black mb-4">Meta Information</h3>
              <p className="text-black mb-6">Ensure search engines and LLMs understand your content.</p>
              <ul className="space-y-3">
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Meta title/description too short/long</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Missing canonical tags</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Robots meta tag issues</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Language declaration inconsistencies</span>
                </li>
              </ul>
            </div>

            {/* Page Quality */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h3 className="text-2xl font-bold text-black mb-4">Page Quality</h3>
              <p className="text-black mb-6">Unfold the full potential of your content.</p>
              <ul className="space-y-3">
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Low word count</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Missing ALT tags</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Duplicate content</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Poor mobile optimization</span>
                </li>
              </ul>
            </div>

            {/* Page & Link Structure */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h3 className="text-2xl font-bold text-black mb-4">Page & Link Structure</h3>
              <p className="text-black mb-6">Make your site easy to crawl.</p>
              <ul className="space-y-3">
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Missing or misordered heading tags</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Dynamic internal link parameters</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Duplicate anchor text</span>
                </li>
              </ul>
            </div>

            {/* Server Configuration */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover-lift transition-all duration-500 ease-out group animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h3 className="text-2xl font-bold text-black mb-4">Server Configuration</h3>
              <p className="text-black mb-6">Technical foundation matters.</p>
              <ul className="space-y-3">
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Redirect issues (www vs non-www)</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Long page load time</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Excessive CSS/JS files</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Large HTML size</span>
                </li>
              </ul>
            </div>

            {/* External Factors */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-gray-100 hover-lift transition-all duration-500 ease-out group animate-fade-in lg:col-span-2" style={{animationDelay: '0.4s'}}>
              <h3 className="text-2xl font-bold text-black mb-4">External Factors</h3>
              <p className="text-black mb-6">Boost your authority and rankings.</p>
              <ul className="space-y-3">
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Weak backlink profile</span>
                </li>
                <li className="flex items-start group/item hover:bg-gray-50 rounded-lg p-2 transition-all duration-300 ease-out">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 transition-all duration-300 ease-out group-hover/item:scale-110" />
                  <span className="text-black">Missing off-page optimizations</span>
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
              className="px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 ease-out"
              onClick={() => {
                // Scroll to top and trigger login
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Add a small delay to ensure scroll completes before showing login
                setTimeout(() => {
                  // This will trigger the login component to show
                  const loginButton = document.querySelector('[data-login-trigger]');
                  if (loginButton) {
                    (loginButton as HTMLElement).click();
                  }
                }, 1000);
              }}
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
                <img
                  src="/assets/sitelens_logo.webp"
                  alt="SEO Site Lens Logo"
                  loading="lazy"
                  width="140"
                  height="40"
                  className="w-full max-w-[140px] h-auto"
                />
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
                  <a href="mailto:&#100;&#104;&#105;&#110;&#97;&#107;&#97;&#114;&#97;&#110;&#116;&#49;&#48;&#52;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;" className="text-gray-400 hover:text-white transition-colors">
                    &#100;&#104;&#105;&#110;&#97;&#107;&#97;&#114;&#97;&#110;&#116;&#49;&#48;&#52;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;
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
        <div className="mt-8 flex justify-center">
          <div className="addthis_inline_share_toolbox"></div>
        </div>
      </footer>
    </>
  );
} 