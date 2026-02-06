import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, TrendingUp, Target, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAnalyticsSummary } from '../utils/geminiApi';
import { getFormAnalytics, getFormSubmissions } from '../utils/formApi';

const AIAnalyticsModal = ({ isOpen, onClose, form }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);
  const [cachedAnalysis, setCachedAnalysis] = useState(null);

  useEffect(() => {
    if (isOpen && form) {
      // Check if we have cached analysis for this form
      const cacheKey = `ai_analysis_${form._id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          // Check if cache is less than 1 hour old
          if (Date.now() - parsedCache.timestamp < 3600000) {
            setAnalysis(parsedCache.data);
            setCachedAnalysis(parsedCache.data);
            return;
          }
        } catch (e) {
          console.warn('Invalid cached analysis data');
        }
      }
      
      // Generate new analysis if no valid cache
      generateAnalysis();
    }
  }, [isOpen, form]);

  const generateAnalysis = async () => {
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      // Fetch form analytics
      const analyticsResponse = await getFormAnalytics(form._id);
      
      if (!analyticsResponse.response) {
        throw new Error('Failed to fetch analytics data');
      }

      // Fetch form submissions for response analysis
      let submissionsData = null;
      try {
        const submissionsResponse = await getFormSubmissions(form._id, { limit: 20 });
        if (submissionsResponse.response && submissionsResponse.submissions) {
          submissionsData = submissionsResponse.submissions;
        }
      } catch (submissionError) {
        console.warn('Could not fetch submissions for response analysis:', submissionError);
      }

      // Generate AI summary with response data
      const aiAnalysis = await generateAnalyticsSummary(form, analyticsResponse.analytics, submissionsData);
      setAnalysis(aiAnalysis);
      setCachedAnalysis(aiAnalysis);
      
      // Cache the analysis
      const cacheKey = `ai_analysis_${form._id}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        data: aiAnalysis,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    switch (score) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Analytics Summary</h2>
                <p className="text-sm text-gray-600">{form?.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <Brain className="w-6 h-6 text-purple-600 absolute top-3 left-3 animate-pulse" />
                </div>
                <p className="mt-4 text-gray-600">AI is analyzing your form performance...</p>
                <p className="text-sm text-gray-500 mt-1">Including response content analysis and user insights</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-red-800 font-medium">Analysis Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={generateAnalysis}
                  className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Performance Score Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <h3 className="font-semibold text-gray-900">Performance Grade</h3>
                    <p className="text-gray-600 text-sm mt-1">{analysis.overallPerformance}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(analysis.performanceScore)}`}>
                    {analysis.performanceScore}
                  </div>
                </div>

                {/* Two Main Boxes */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Analytics Recommendations */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-gray-700" />
                      <h3 className="font-semibold text-gray-900">Analytics Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.recommendations?.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Insights */}
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-gray-700" />
                      <h3 className="font-semibold text-gray-900">Response Insights</h3>
                    </div>
                    {analysis.responseInsights ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 text-sm mb-1">User Sentiment</h4>
                          <p className="text-gray-600 text-sm">{analysis.responseInsights.userSentiment}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 text-sm mb-1">Key Themes</h4>
                          <p className="text-gray-600 text-sm">
                            {analysis.responseInsights.commonThemes?.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">No responses available for analysis yet. Insights will appear once users submit responses.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Brain className="w-4 h-4" />
                      <span>AI Analysis {cachedAnalysis ? '(Cached)' : '(Fresh)'}</span>
                    </div>
                    <button
                      onClick={() => window.open(`/analytics/${form._id}`, '_blank')}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      View Detailed Report
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={generateAnalysis}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIAnalyticsModal;