import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  Image, 
  Link, 
  Smartphone, 
  Monitor,
  FileText,
  Share,
  Target,
  ArrowLeft
} from 'lucide-react';
import { SEOReport as SEOReportType } from '../types/seo';

interface SEOReportProps {
  report: SEOReportType;
  onBack: () => void;
}

const ScoreCircle: React.FC<{ score: number; size?: 'sm' | 'lg' }> = ({ score, size = 'lg' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const sizeClasses = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-16 h-16 text-lg';

  return (
    <div className={`${sizeClasses} rounded-full border-4 ${getScoreBackground(score)} flex items-center justify-center font-bold ${getScoreColor(score)}`}>
      {score}
    </div>
  );
};

const StatusIcon: React.FC<{ status: boolean }> = ({ status }) => {
  return status ? (
    <CheckCircle className="w-5 h-5 text-green-600" />
  ) : (
    <XCircle className="w-5 h-5 text-red-600" />
  );
};

export const SEOReport: React.FC<SEOReportProps> = ({ report, onBack }) => {
  const { headings } = report;
  const totalHeadings = Object.values(headings).reduce((sum, count) => sum + count, 0);

  const handleDownloadPDF = () => {
    const element = document.getElementById('audit-report');
    if (!element) return;
    html2pdf().set({
      margin: 0.5,
      filename: 'SEO_Audit_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0,
        useCORS: true,
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait'
      }
    }).from(element).save();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <style>{`
        #audit-report {
          padding: 20px;
          background-color: white;
          color: black;
          height: auto !important;
          overflow: visible !important;
        }
        #audit-report * {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `}</style>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 relative">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              {new URL(report.url).hostname}
            </span>
          </div>
          {/* Download PDF Report button - locked for non-premium users */}
          <button
            disabled
            className="ml-4 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg font-semibold shadow cursor-not-allowed absolute right-6 top-6 relative group"
            title="Download PDF Report (Premium Only)"
          >
            Download PDF Report
            <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Available only for premium users
            </span>
          </button>
        </div>
        <div id="audit-report">
          {/* Everything below will be included in the PDF */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {report.title || 'Untitled Page'}
              </h1>
              <p className="text-gray-600 max-w-3xl">
                {report.description || 'No meta description found'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <ScoreCircle score={report.seoScore} />
                <p className="text-sm text-gray-600 mt-2 font-medium">SEO Score</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* ...Performance, Content, Links, Social, Technical, Recommendations, AI sections... */}
            {/* Copy all the rest of the report sections here, as in the original return, so they are inside #audit-report */}

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Mobile Performance</h3>
              </div>
              <div className="flex items-center space-x-4">
                <ScoreCircle score={report.performance.mobile || 0} size="sm" />
                <div>
                  <p className="text-sm text-gray-600">PageSpeed Score</p>
                  <p className="text-xs text-gray-500">Mobile optimization rating</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Monitor className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Desktop Performance</h3>
              </div>
              <div className="flex items-center space-x-4">
                <ScoreCircle score={report.performance.desktop || 0} size="sm" />
                <div>
                  <p className="text-sm text-gray-600">PageSpeed Score</p>
                  <p className="text-xs text-gray-500">Desktop optimization rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Content Structure */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Content Structure</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">H1 Tags</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${headings.h1 === 1 ? 'text-green-600' : 'text-red-600'}`}>{headings.h1}</span>
                    <StatusIcon status={headings.h1 === 1} />
                  </div>
                </div>
                {totalHeadings > 1 && (
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {Object.entries(headings).slice(1).map(([tag, count]) => (
                      <div key={tag} className="p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-900">{tag.toUpperCase()}</div>
                        <div className="text-blue-700">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Images Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Image className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Images</span>
                  <span className="text-sm font-semibold text-gray-900">{report.images.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">With Alt Text</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-green-600">{report.images.withAlt}</span>
                    <StatusIcon status={report.images.withoutAlt === 0} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Missing Alt Text</span>
                  <span className={`text-sm font-semibold ${report.images.withoutAlt === 0 ? 'text-green-600' : 'text-red-600'}`}>{report.images.withoutAlt}</span>
                </div>
              </div>
            </div>
            {/* Links Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Link className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Links</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Internal Links</span>
                  <span className="text-sm font-semibold text-blue-600">{report.links.internal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">External Links</span>
                  <span className="text-sm font-semibold text-purple-600">{report.links.external}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Broken Links</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${report.links.broken.length === 0 ? 'text-green-600' : 'text-red-600'}`}>{report.links.broken.length}</span>
                    <StatusIcon status={report.links.broken.length === 0} />
                  </div>
                </div>
              </div>
            </div>
            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Share className="w-6 h-6 text-pink-600" />
                <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">OpenGraph</span>
                    <span className="text-xs text-gray-500">{Object.values(report.openGraph).filter(Boolean).length}/4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.openGraph.hasOgTitle} />
                      <span>Title</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.openGraph.hasOgDescription} />
                      <span>Description</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.openGraph.hasOgImage} />
                      <span>Image</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.openGraph.hasOgUrl} />
                      <span>URL</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Twitter Card</span>
                    <span className="text-xs text-gray-500">{Object.values(report.twitterCard).filter(Boolean).length}/4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.twitterCard.hasCardType} />
                      <span>Card</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.twitterCard.hasTitle} />
                      <span>Title</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.twitterCard.hasDescription} />
                      <span>Description</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon status={report.twitterCard.hasImage} />
                      <span>Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical SEO */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Technical SEO</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <StatusIcon status={report.technical.viewport} />
                <span className="text-sm text-gray-700">Viewport Meta</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={report.technical.charset} />
                <span className="text-sm text-gray-700">Charset</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={report.technical.hasRobotsTxt} />
                <span className="text-sm text-gray-700">Robots.txt</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={report.technical.hasSitemap} />
                <span className="text-sm text-gray-700">XML Sitemap</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            </div>
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-yellow-800">{index + 1}</span>
                  </div>
                  <p className="text-sm text-yellow-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          {report.aiRecommendations && report.aiRecommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Optimization Suggestions</h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {report.aiRecommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};