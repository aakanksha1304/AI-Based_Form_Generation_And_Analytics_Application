import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom'
import FormBuilder from './components/FormBuilder'
import FormPreview from './components/FormPreview'
import { AuthForm } from './components/auth/AuthForm'
import { Dashboard } from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import FormView from './components/FormView'
import FormResponsesView from './components/FormResponsesView'
import DetailedAnalyticsPage from './components/DetailedAnalyticsPage'
import { setupAxiosInterceptors } from './utils/auth'

import { Input } from '@/components/ui/input'
import { generateFormFromPrompt } from './utils/geminiApi'
import { sampleImages } from './data/sampleImages'
import { sampleVideos } from './data/sampleVideos'
import Navigation from './components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Toaster } from "@/components/ui/sonner"

// Form Builder Wrapper Component
function FormBuilderApp({ editMode = false }) {
  const { formId } = useParams();
  const [mode, setMode] = useState('builder') // 'builder', 'preview', or 'processing'
  const [searchQuery, setSearchQuery] = useState('')
  const [showBuilder, setShowBuilder] = useState(editMode) // Show builder immediately in edit mode
  const [formConfig, setFormConfig] = useState({
    backgroundMedia: null,
    selectedMediaData: null,
    questions: [],
    title: '',
    description: '',
    requireName: true,
    requireEmail: false,
    showTitle: true,
    showDescription: true
  })
  const [loading, setLoading] = useState(editMode)

  // Load existing form data in edit mode
  useEffect(() => {
    if (editMode && formId) {
      loadFormData();
    }
  }, [editMode, formId]);

  const loadFormData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          const form = data.form;
          setFormConfig({
            backgroundMedia: form.backgroundMedia?.url || null,
            selectedMediaData: form.backgroundMedia || null,
            questions: form.questions || [],
            title: form.title || '',
            description: form.description || '',
            requireName: form.settings?.requireName !== false,
            requireEmail: form.settings?.requireEmail === true,
            showTitle: form.settings?.showTitle !== false,
            showDescription: form.settings?.showDescription !== false
          });
        }
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      alert('Error loading form data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormUpdate = (config) => {
    setFormConfig(config)
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
  }

  const handleGetStarted = () => {
    setShowBuilder(false) // Reset to show search input
  }

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    const input = e.target.querySelector('input')
    const query = input?.value || searchQuery
    if (query.trim()) {
      setSearchQuery(query)
      setMode('processing')

      try {
        // Call Gemini API to generate form
        const geminiResponse = await generateFormFromPrompt(query)
        console.log('Gemini API Response:', geminiResponse)

        // Convert Gemini response to our form format
        const generatedQuestions = geminiResponse.fields.map(field => ({
          id: field.id || Date.now() + Math.random(),
          question: field.question,
          type: field.type,
          placeholder: field.placeholder || '',
          options: field.options || []
        }))

        setFormConfig(prev => ({
          ...prev,
          questions: generatedQuestions,
          title: geminiResponse.title,
          description: geminiResponse.description
        }))

        setShowBuilder(true) // Show the full builder interface
        setMode('builder')
      } catch (error) {
        console.error('Error generating form:', error)
        // Show error message instead of fallback
        alert('Failed to generate form using AI. Please try again or create questions manually using the form builder.')
        setMode('builder')
        setShowBuilder(true)
      }
    }
  }



  if (mode === 'preview') {
    return (
      <FormPreview
        formConfig={formConfig}
        onModeSwitch={handleModeSwitch}
      />
    )
  }

  if (mode === 'processing') {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
        <Navigation />

        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Creating your form...</h2>
            <p className="text-white/70">Using AI to analyze "{searchQuery}" and generate questions</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
        <Navigation />

        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Loading form...</h2>
            <p className="text-white/70">Please wait while we load your form data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation
        mode={mode}
        handleModeSwitch={handleModeSwitch}
        handleGetStarted={handleGetStarted}
      />

      {/* Main Content */}
      <div className="pt-20">
        {!showBuilder ? (
          // Show search input initially - GLASSMORPHISM VERSION
          <div className="relative flex items-center justify-center min-h-[80vh] p-6">
            {/* Background Video Section */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {/* Video Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
              >
                <source src="\src" type="video/mp4" />
              </video>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 z-10"></div>
            </div>
            
            <div className="relative w-full max-w-2xl mx-auto z-20">
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    What would you like to create?
                  </h1>
                  <p className="text-xl text-white/80 mb-8">
                    Describe your form and we'll help you build it
                  </p>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Describe your form (e.g., Create a contact form for my website)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-white text-gray-900 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                  >
                    Generate Form with AI
                  </button>
                </form>

                <div className="text-center mt-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-px bg-white/20 flex-1"></div>
                    <span className="px-4 text-white/60 text-sm">OR</span>
                    <div className="h-px bg-white/20 flex-1"></div>
                  </div>
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="px-8 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold hover:bg-white/20 transition-all duration-200"
                  >
                    Create Manually
                  </button>
                </div>
              </div>
            </div>
          </div>


        ) : (
          // Show full builder interface after search
          <FormBuilder
            formConfig={formConfig}
            onFormUpdate={handleFormUpdate}
            sampleImages={sampleImages}
            sampleVideos={sampleVideos}
            editMode={editMode}
            formId={formId}
          />
        )}
      </div>
    </div>
  )
}

// Main App Component with Routing
function App() {
  useEffect(() => {
    // Setup Axios interceptors when app loads
    setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthForm />} />
        <Route path="/register" element={<AuthForm />} />
        <Route path="/home" element={<FormBuilderApp />} />
        <Route path="/form/:shareableLink" element={<FormView />} />
        <Route path="/f/:shareableLink" element={<FormView />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-form"
          element={
            <ProtectedRoute>
              <FormBuilderApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-form/:formId"
          element={
            <ProtectedRoute>
              <FormBuilderApp editMode={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <FormBuilderApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responses"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl text-white">Responses Page - Coming Soon</h1>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/form/:formId/responses"
          element={
            <ProtectedRoute>
              <FormResponsesView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/form/:formId/ai-analytics"
          element={
            <ProtectedRoute>
              <DetailedAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  )
}

// Uncomment one of these to test individual pages:

// Test Login Page
// function App() {
//   return <LoginForm />
// }

// Test Register Page  
// function App() {
//   return <RegisterForm />
// }

// Test Dashboard Page
// function App() {
//   return <Dashboard />
// }

// Test Form Builder Page
// function App() {
//   return <FormBuilderApp />
// }

export default App