export interface SEOCheck {
  category: string;
  check: string;
  status: 'good' | 'critical' | 'recommended';
  message: string;
  details?: string;
}

export interface SEOSummary {
  totalChecks: number;
  passedChecks: number;
  criticalIssues: number;
  recommendedIssues: number;
  goodResults: number;
}

export interface Keyword {
  word: string;
  count: number;
}

export interface SearchPreview {
  title: string;
  url: string;
  description: string;
}

export interface SEOReport {
  url: string;
  title: string;
  description: string;
  seoScore: number;
  
  // Summary statistics
  summary?: SEOSummary;
  
  // Detailed checks
  checks?: SEOCheck[];
  
  // Keywords found
  keywords?: Keyword[];
  
  // Search preview
  searchPreview?: SearchPreview;
  
  // Performance scores
  performance: {
    mobile: number | null;
    desktop: number | null;
  };
  
  // Legacy format support
  headings?: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  images?: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    missingAltImages: string[];
  };
  links?: {
    internal: number;
    external: number;
    broken: string[];
  };
  openGraph?: {
    hasOgTitle?: boolean;
    hasOgDescription?: boolean;
    hasOgImage?: boolean;
    hasOgUrl?: boolean;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
  };
  twitterCard?: {
    hasCardType?: boolean;
    hasTitle?: boolean;
    hasDescription?: boolean;
    hasImage?: boolean;
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
  };
  technical?: {
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    viewport: boolean;
    charset: boolean;
    canonical?: boolean;
    noindex?: boolean;
    isHttps?: boolean;
    hasStructuredData?: boolean;
    wwwRedirectsCorrectly?: boolean;
    htmlSizeKb?: number;
    estimatedRequests?: number;
    isJsMinified?: boolean;
    isCssMinified?: boolean;
    responseTime?: string;
  };
  
  recommendations?: string[];
  aiRecommendations?: string[];
}