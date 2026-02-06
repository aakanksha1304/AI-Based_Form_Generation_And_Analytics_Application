import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, TrendingUp, Users, Eye, Target, MessageSquare, RefreshCw, BarChart3 } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Navigation from './Navigation';

const DetailedAnalyticsPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisData();
  }, [formId]);

  const loadAnalysisData = () => {
    // Load cached analysis
    const cacheKey = `ai_analysis_${formId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        setAnalysis(parsedCache.data);
        
        // Also load form data from cache or API
        const formCacheKey = `form_${formId}`;
        const formCached = localStorage.getItem(formCacheKey);
        if (formCached) {
          setForm(JSON.parse(formCached));
        }
      } catch (e) {
        console.warn('Invalid cached data');
      }
    }
    setLoading(false);
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

  // Sample chart data (in real app, this would come from analytics)
  const performanceData = [
    { name: 'Views', value: 150, color: '#3b82f6' },
    { name: 'Submissions', value: 45, color: '#10b981' },
    { name: 'Incomplete', value: 105, color: '#f59e0b' }
  ];

  const trendData = [
    { date: 'Mon', views: 20, submissions: 6 },
    { date: 'Tue', views: 25, submissions: 8 },
    { date: 'Wed', views: 30, submissions: 12 },
    { date: 'Thu', views: 22, submissions: 7 },
    { date: 'Fri', views: 28, submissions: 9 },
    { date: 'Sat', views: 15, submissions: 2 },
    { date: 'Sun', views: 10, submissions: 1 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Available</h2>
            <p className="text-gray-600 mb-4">Generate AI analytics from the dashboard first.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Analytics Report</h1>
              <p className="text-gray-600">{form?.title || 'Form Analysis'}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border font-semibold ${getScoreColor(analysis.performanceScore)}`}>
              Grade: {analysis.performanceScore}
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">150</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">30%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{analysis.performanceScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="submissions" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Key Insights */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              {analysis.keyInsights?.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {analysis.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-800 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Analysis */}
        {analysis.responseInsights && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Common Themes */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Common Themes</h4>
                <div className="space-y-2">
                  {analysis.responseInsights.commonThemes?.map((theme, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-800 text-sm">{theme}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Sentiment */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-3">User Sentiment</h4>
                <p className="text-green-800 text-sm">{analysis.responseInsights.userSentiment}</p>
              </div>

              {/* Response Quality */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-3">Response Quality</h4>
                <p className="text-purple-800 text-sm">{analysis.responseInsights.responseQuality}</p>
              </div>
            </div>

            {/* Key Findings */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-3">Key Findings</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {analysis.responseInsights.keyFindings?.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-800 text-sm">{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
          <p className="text-gray-700 leading-relaxed mb-4">{analysis.summary}</p>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Data Generalization</h4>
            <p className="text-gray-700 text-sm">{analysis.dataGeneralization}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsPage;