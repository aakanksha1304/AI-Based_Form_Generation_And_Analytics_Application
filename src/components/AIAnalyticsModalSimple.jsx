import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, RefreshCw, ExternalLink, Lightbulb, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAnalyticsSummary } from '../utils/geminiApi';
import { getFormAnalytics, getFormSubmissions } from '../utils/formApi';

const AIAnalyticsModalSimple = ({ isOpen, onClose, form }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);

  useEffect(() => {
    if (isOpen && form) {
      loadCachedAnalysis();
    }
  }, [isOpen, form]);

  const loadCachedAnalysis = () => {
    const cacheKey = `ai_analysis_${form._id}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        setAnalysis(parsedCache.data);
        setLastGenerated(new Date(parsedCache.timestamp));
      } catch (e) {
        console.warn('Invalid cached analysis data');
        generateNewAnalysis();
      }
    } else {
      generateNewAnalysis();
    }
  };

  const generateNewAnalysis = async () => {
    setLoading(true);
    setError('');

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
      
      // Cache the analysis
      const cacheKey = `ai_analysis_${form._id}`;
      const cacheData = {
        data: aiAnalysis,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      setAnalysis(aiAnalysis);
      setLastGenerated(new Date());
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    // Navigate to detailed analytics page
    navigate(`/form/${form._id}/ai-analytics`);
    onClose();
  };

  const getScoreColor = (score) => {
    switch (score) {
      case 'A': return 'text-green-700 bg-green-50 border-green-200';
      case 'B': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
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
          className="relative w-full max-w-2xl max-h-[80vh] mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Brain className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Analytics Summary</h2>
                <p className="text-sm text-gray-500">{form?.title}</p>
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
          <div className="p-6 flex-1 overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-sm">Generating AI insights...</p>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={generateNewAnalysis}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                {/* Performance Score */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Performance Score</h3>
                    <p className="text-gray-600 text-sm">{analysis.overallPerformance}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-semibold border ${getScoreColor(analysis.performanceScore)}`}>
                    {analysis.performanceScore}
                  </div>
                </div>

                {/* Two Main Boxes */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Recommendations Box */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-blue-900">Top Recommendations</h3>
                    </div>
                    <div className="space-y-1">
                      {analysis.recommendations?.slice(0, 2).map((rec, index) => (
                        <div key={index} className="text-blue-800 text-sm leading-tight">
                          • {rec.length > 60 ? rec.substring(0, 60) + '...' : rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Insights Box */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <h3 className="font-medium text-green-900">User Insights</h3>
                    </div>
                    <div className="space-y-1">
                      {analysis.responseInsights ? (
                        <>
                          <div className="text-green-800 text-sm">
                            <strong>Sentiment:</strong> {analysis.responseInsights.userSentiment?.length > 40 ? 
                              analysis.responseInsights.userSentiment.substring(0, 40) + '...' : 
                              analysis.responseInsights.userSentiment}
                          </div>
                          <div className="text-green-800 text-sm">
                            <strong>Themes:</strong> {analysis.responseInsights.commonThemes?.slice(0, 2).join(', ')?.substring(0, 50)}
                            {analysis.responseInsights.commonThemes?.slice(0, 2).join(', ')?.length > 50 ? '...' : ''}
                          </div>
                        </>
                      ) : (
                        <div className="text-green-700 text-sm">
                          No responses yet. Collect submissions for insights.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 bg-white sticky bottom-0">
                  <div className="flex items-center gap-4">
                    {lastGenerated && (
                      <span className="text-xs text-gray-500">
                        Generated {lastGenerated.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generateNewAnalysis}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button
                      onClick={handleViewDetails}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
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

export default AIAnalyticsModalSimple;