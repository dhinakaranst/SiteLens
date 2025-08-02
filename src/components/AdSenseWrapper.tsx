import React from 'react';
import { useLocation } from 'react-router-dom';

interface AdSenseWrapperProps {
  children: React.ReactNode;
  minContentLength?: number;
}

const AdSenseWrapper: React.FC<AdSenseWrapperProps> = ({ 
  children, 
  minContentLength = 1000 
}) => {
  const location = useLocation();
  
  // Define pages where AdSense should be shown (content-rich pages only)
  const allowedPaths = ['/', '/features', '/pricing', '/resources'];
  
  // Check if current page is in allowed paths
  const isAllowedPage = allowedPaths.includes(location.pathname);
  
  // Don't show ads on modal screens, loading screens, or error screens
  const isModalScreen = location.search.includes('modal') || 
                       location.pathname.includes('error') ||
                       location.pathname.includes('loading');
  
  // Only render AdSense on content-rich pages
  const shouldShowAds = isAllowedPage && !isModalScreen;
  
  if (!shouldShowAds) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative">
      {children}
      
      {/* AdSense Display Ad - Only on content pages */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Advertisement</p>
          <div 
            className="bg-gray-100 border border-gray-200 rounded-lg p-4 min-h-[250px] flex items-center justify-center"
            style={{ maxWidth: '728px', margin: '0 auto' }}
          >
            {/* AdSense ad unit will be inserted here */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9811678920807739"
              data-ad-slot="1234567890"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSenseWrapper;
