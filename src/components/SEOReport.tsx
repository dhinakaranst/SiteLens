import React from 'react';
import html2pdf from 'html2pdf.js';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  Smartphone, 
  Monitor,
  FileText,
  Target,
  ArrowLeft,
  Download,
  Shield,
  Zap,
  Search,
  Hash
} from 'lucide-react';
import { SEOReport as SEOReportType, SEOCheck, Keyword } from '../types/seo';

interface SEOReportProps {
  report: SEOReportType;
  onBack: () => void;
}

const ScoreCircle: React.FC<{ score: number; size?: 'sm' | 'lg' | 'xl' }> = ({ score, size = 'lg' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} rounded-full border-4 ${getScoreBackground(score)} flex items-center justify-center font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      {size === 'xl' && (
        <div className="mt-2 text-center">
          <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
            {getScoreText(score)}
          </div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
      )}
    </div>
  );
};

const CheckItem: React.FC<{ 
  status: 'good' | 'critical' | 'recommended',
  children: React.ReactNode 
}> = ({ status, children }) => {
  const getIcon = () => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'recommended':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'recommended':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border ${getBgColor()}`}>
      {getIcon()}
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
};

export const SEOReport: React.FC<SEOReportProps> = ({ report, onBack }) => {
  if (!report) {
    return <div className="p-8 text-red-600">No report data available.</div>;
  }
  
  // Handle both old and new report formats
  const summary = report.summary || {
    totalChecks: report.checks?.length || 0,
    passedChecks: report.checks?.filter((c: SEOCheck) => c.status === 'good').length || 0,
    criticalIssues: report.checks?.filter((c: SEOCheck) => c.status === 'critical').length || 0,
    recommendedIssues: report.checks?.filter((c: SEOCheck) => c.status === 'recommended').length || 0,
    goodResults: report.checks?.filter((c: SEOCheck) => c.status === 'good').length || 0
  };

  const checks = report.checks || [];
  const keywords = report.keywords || [];
  const searchPreview = report.searchPreview || {
    title: report.title,
    url: report.url,
    description: report.description
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('audit-report');
    if (!element) return;
    
    const domain = new URL(report.url).hostname.replace('www.', '');
    const date = new Date().toISOString().split('T')[0];
    
    // Temporarily adjust styles for PDF generation
    const originalStyle = element.style.cssText;
    element.style.cssText = `
      width: 8.5in !important;
      max-width: 8.5in !important;
      padding: 0.75in !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      font-size: 12px !important;
      line-height: 1.5 !important;
    `;
    
    const opt = {
      margin: [0.5, 0.5, 0.75, 0.5], // top, left, bottom, right
      filename: `SiteLens_SEO_Report_${domain}_${date}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.95,
        crossOrigin: 'anonymous'
      },
      html2canvas: {
        scale: 1.5, // Reduced scale for better performance
        scrollY: 0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 816, // 8.5 inches * 96 DPI
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        removeContainer: true,
        onrendered: function() {
          // Restore original styles after capture
          element.style.cssText = originalStyle;
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
        compress: true,
        precision: 2
      },
      pagebreak: {
        mode: ['avoid-all', 'css'],
        before: '.print-section',
        after: '.print-section'
      }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore original styles
      element.style.cssText = originalStyle;
    }).catch(() => {
      // Restore original styles even on error
      element.style.cssText = originalStyle;
    });
  };

  // Group checks by category
  const groupedChecks = checks.reduce((acc: Record<string, SEOCheck[]>, check: SEOCheck) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <style>{`
        #audit-report {
          padding: 40px 30px;
          background-color: white;
          color: black;
          height: auto !important;
          overflow: visible !important;
          position: relative;
          max-width: none !important;
          width: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }
        #audit-report * {
          page-break-inside: avoid;
          break-inside: avoid;
          box-sizing: border-box;
        }
        .print-section {
          margin-bottom: 30px;
          position: relative;
          clear: both;
          width: 100%;
        }
        .print-watermark {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) rotate(-45deg) !important;
          font-size: 6rem !important;
          font-weight: 900 !important;
          color: rgba(0, 0, 0, 0.02) !important;
          z-index: -1 !important;
          pointer-events: none !important;
          white-space: nowrap !important;
        }
        @media print {
          #audit-report {
            padding: 20px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          .print-watermark {
            display: block !important;
            opacity: 0.03 !important;
          }
          .print-section {
            margin-bottom: 25px !important;
            page-break-inside: avoid !important;
          }
          .grid {
            display: block !important;
          }
          .grid > div {
            display: block !important;
            width: 100% !important;
            margin-bottom: 15px !important;
          }
        }
        /* Subtle background watermarks for sections */
        .print-section::before {
          content: "SiteLens";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 3rem;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.015);
          z-index: -1;
          pointer-events: none;
          white-space: nowrap;
        }
        /* Ensure proper text alignment */
        .text-center {
          text-align: center !important;
        }
        .text-left {
          text-align: left !important;
        }
        /* Fix grid layouts for PDF */
        .pdf-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: space-between;
        }
        .pdf-grid > div {
          flex: 1;
          min-width: 45%;
        }
        /* Header styling fixes */
        .report-header {
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .brand-logo {
          max-width: 48px;
          max-height: 48px;
          object-fit: contain;
        }
        /* Score circle fixes */
        .score-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          margin: 0 auto;
        }
        /* Footer fixes */
        .report-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-300 ease-out hover:scale-105 flex items-center space-x-2"
            title="Download PDF Report"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>

        <div id="audit-report">
          {/* Report Header with SiteLens Branding */}
          <div className="print-section report-header text-center">
            {/* SiteLens Header */}
            <div className="mb-6 pb-4">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <img 
                  src="/assets/sitelens_logo.webp" 
                  alt="SiteLens Logo" 
                  className="brand-logo w-12 h-12 object-contain"
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <h1 className="text-4xl font-bold text-blue-600 m-0">SiteLens</h1>
              </div>
              <p className="text-lg text-gray-600 mb-2 m-0">Professional SEO Analysis Report</p>
              <p className="text-sm text-gray-500 m-0">site-lens.tech</p>
            </div>
            
            {/* Report Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4 m-0">Your Free SEO Report is here!</h2>
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
              <Globe className="w-5 h-5" />
              <span className="font-medium">{report.url}</span>
            </div>
            
            {/* Watermark for PDF */}
            <div className="print-watermark">
              <div className="transform rotate-45 text-6xl font-bold text-gray-400">
                SiteLens
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="print-section text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Overall Site Score</h2>
            <p className="text-gray-600 mb-4">A very good score is between 60 and 80. For best results, you should strive for 70 and above.</p>
            <div className="mb-6">
              <ScoreCircle score={report.seoScore || 0} size="xl" />
            </div>
            
            {/* Summary Stats */}
            <div className="pdf-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{summary.totalChecks}</div>
                <div className="text-sm text-gray-600">of {summary.totalChecks}</div>
                <div className="text-xs text-gray-500">All Items</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{summary.criticalIssues}</div>
                <div className="text-sm text-gray-600">of {summary.totalChecks}</div>
                <div className="text-xs text-gray-500">Critical Issues</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-yellow-600">{summary.recommendedIssues}</div>
                <div className="text-sm text-gray-600">of {summary.totalChecks}</div>
                <div className="text-xs text-gray-500">Recommended</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{summary.goodResults}</div>
                <div className="text-sm text-gray-600">of {summary.totalChecks}</div>
                <div className="text-xs text-gray-500">Good Results</div>
              </div>
            </div>
          </div>

          {/* Performance Scores */}
          {report.performance && (
            <div className="print-section pdf-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Mobile Snapshot</h3>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <ScoreCircle score={report.performance.mobile || 0} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600">Mobile Performance</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Monitor className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Desktop Performance</h3>
                </div>
                <div className="text-center">
                  <div className="mb-2">
                    <ScoreCircle score={report.performance.desktop || 0} size="lg" />
                  </div>
                  <p className="text-sm text-gray-600">Desktop Performance</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Preview */}
          <div className="print-section bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Search Preview</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Here is how the site may appear in search results:</p>
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-blue-600 hover:underline text-lg font-medium mb-1">
                {searchPreview.title || 'Untitled Page'}
              </div>
              <div className="text-green-600 text-sm mb-2">{searchPreview.url}</div>
              <div className="text-gray-700 text-sm">
                {searchPreview.description || 'No meta description available'}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="print-section bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Hash className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold">Keywords</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Here are the most common keywords we found on the page:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {keywords.slice(0, 15).map((keyword: Keyword, index: number) => (
                  <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{keyword.count}</div>
                    <div className="text-sm text-gray-700">{keyword.word}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Checks by Category */}
          {Object.entries(groupedChecks).map(([category, categoryChecks]: [string, SEOCheck[]]) => (
            <div key={category} className="print-section bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                {category === 'Basic SEO' && <FileText className="w-6 h-6 text-blue-600" />}
                {category === 'Advanced SEO' && <Target className="w-6 h-6 text-purple-600" />}
                {category === 'Performance' && <Zap className="w-6 h-6 text-yellow-600" />}
                {category === 'Security' && <Shield className="w-6 h-6 text-green-600" />}
                <h3 className="text-xl font-semibold">{category}</h3>
              </div>
              <div className="space-y-3">
                {categoryChecks.map((check: SEOCheck, index: number) => (
                  <CheckItem key={index} status={check.status}>
                    <div>
                      <div className="font-medium mb-1">{check.message}</div>
                      {check.details && (
                        <div className="text-gray-600 text-xs">{check.details}</div>
                      )}
                    </div>
                  </CheckItem>
                ))}
              </div>
            </div>
          ))}

          {/* AI Recommendations */}
          {report.aiRecommendations && report.aiRecommendations.length > 0 && (
            <div className="print-section bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold">AI-Powered Optimization Suggestions</h3>
              </div>
              <div className="space-y-3">
                {report.aiRecommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-indigo-800">{index + 1}</span>
                    </div>
                    <p className="text-sm text-indigo-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Footer with SiteLens Branding */}
          <div className="print-section report-footer text-center relative">
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <img 
                  src="/assets/sitelens_logo.webp" 
                  alt="SiteLens Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="text-lg font-bold text-blue-600">SiteLens</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Professional SEO Analysis & Website Optimization</div>
              <div className="text-sm font-medium text-blue-600">site-lens.tech</div>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Report generated on {new Date().toLocaleDateString()} • Powered by SiteLens AI
            </p>
            <p className="text-xs text-gray-400">
              For more insights, advanced features, and regular monitoring, visit site-lens.tech
            </p>
            
            {/* Footer watermark */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-400 opacity-60">
              site-lens.tech
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};