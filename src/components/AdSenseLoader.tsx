import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseLoader: React.FC = () => {
  const location = useLocation();
  
  // Only load AdSense on content-rich pages
  const contentPages = ['/', '/features', '/pricing', '/resources'];
  const isContentPage = contentPages.includes(location.pathname);
  
  useEffect(() => {
    if (!isContentPage) return;
    
    // Load AdSense script only when needed
    const loadAdSense = () => {
      if (document.querySelector('script[src*="adsbygoogle"]')) {
        return; // Already loaded
      }
      
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9811678920807739';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      script.onload = () => {
        // Initialize ads after script loads
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.log('AdSense initialization error:', error);
        }
      };
    };
    
    // Load with a small delay to ensure page content is rendered
    const timer = setTimeout(loadAdSense, 1000);
    
    return () => clearTimeout(timer);
  }, [isContentPage, location.pathname]);
  
  if (!isContentPage) {
    return null;
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">Advertisement</p>
        <div className="flex justify-center">
          <ins
            className="adsbygoogle"
            data-ad-client="ca-pub-9811678920807739"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};

export default AdSenseLoader;
