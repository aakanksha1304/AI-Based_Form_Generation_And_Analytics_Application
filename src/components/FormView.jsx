import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFormByLink, submitFormResponse } from '../utils/formApi';

const FormView = () => {
  const { shareableLink } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await getFormByLink(shareableLink);
        if (response.response) {
          const formData = response.form;
  
          
          // Create Name/Email fields based on form settings - ensure they exist
          const identityFields = [];
          
          // Default to requiring name if no settings exist (for backward compatibility)
          const requireName = formData.settings?.requireName !== false;
          const requireEmail = formData.settings?.requireEmail === true;
          
          if (requireName) {
            identityFields.push({
              id: 'submitter_name',
              question: 'Your Name',
              type: 'text',
              placeholder: 'Enter your full name',
              required: true,
              isIdentityField: true
            });
          }
          
          if (requireEmail) {
            identityFields.push({
              id: 'submitter_email',
              question: 'Your Email',
              type: 'email',
              placeholder: 'Enter your email address',
              required: true,
              isIdentityField: true
            });
          }
          
          // Combine identity fields with form questions
          const allQuestions = [...identityFields, ...formData.questions];
          const updatedForm = { ...formData, questions: allQuestions };
          
          setForm(updatedForm);
          
          // Initialize responses object
          const initialResponses = {};
          allQuestions.forEach(q => {
            initialResponses[q.id] = '';
          });
          setResponses(initialResponses);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        setError('Form not found or no longer available');
      } finally {
        setLoading(false);
      }
    };

    if (shareableLink) {
      fetchForm();
    }
  }, [shareableLink]);

  const handleInputChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < form.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Extract submitter info from identity fields
      const submitterName = responses['submitter_name'] || '';
      const submitterEmail = responses['submitter_email'] || '';
      
      // Filter out identity fields from responses (they're not form questions)
      const formResponses = form.questions
        .filter(q => !q.isIdentityField)
        .map(q => ({
          questionId: q.id,
          question: q.question,
          answer: responses[q.id],
          questionType: q.type
        }));

      const submissionData = {
        responses: formResponses,
        submitterInfo: {
          name: submitterName,
          email: submitterEmail
        },
        metadata: {
          timeSpent: Math.round((Date.now() - startTime) / 1000),
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        }
      };

      const response = await submitFormResponse(shareableLink, submissionData);
      if (response.response) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={question.type}
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
            required
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 resize-none"
            required
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
            required
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(question.id, [...currentValues, option]);
                    } else {
                      handleInputChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {form?.backgroundMedia ? (
          <>
            {form.backgroundMedia.type === 'video' ? (
              <video
                src={form.backgroundMedia.url}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${form.backgroundMedia.url})` }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-800" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div 
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
            }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
            <p className="text-white/80 mb-6">Your response has been submitted successfully.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
            >
              Create Your Own Form
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!form) return null;

  const currentQ = form.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / form.questions.length) * 100;

  const renderBackground = () => {
    if (form.backgroundMedia?.type === 'video') {
      return (
        <video
          src={form.backgroundMedia.url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
        />
      );
    } else if (form.backgroundMedia?.url) {
      return (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${form.backgroundMedia.url})` }}
        />
      );
    }
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800" />
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {renderBackground()}
      <div className="absolute inset-0 bg-black/30" />

      <AnimatePresence mode="wait">
        <FormCard
          key={currentQuestion}
          question={currentQ}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          stepNumber={currentQuestion + 1}
          totalSteps={form.questions.length}
          isLastQuestion={currentQuestion === form.questions.length - 1}
          responses={responses}
          setResponses={setResponses}
          submitting={submitting}
          form={form}
        />
      </AnimatePresence>
    </div>
  );
};

const FormCard = ({ 
  question, 
  onNext, 
  onPrevious, 
  onSubmit, 
  stepNumber, 
  totalSteps, 
  isLastQuestion, 
  responses, 
  setResponses, 
  submitting,
  form 
}) => {
  const [value, setValue] = useState(responses[question.id] || '');

  useEffect(() => {
    setValue(responses[question.id] || '');
  }, [question.id, responses]);

  const handleInputChange = (newValue) => {
    setValue(newValue);
    setResponses(prev => ({
      ...prev,
      [question.id]: newValue
    }));
  };

  const handleNext = () => {
    if (value.trim() || question.type === 'radio') {
      onNext();
    }
  };

  const handleSubmit = () => {
    if (value.trim() || question.type === 'radio') {
      onSubmit();
    }
  };

  const renderInput = () => {
    const glassInputStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white'
    };

    const glassInputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/30";

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className={`${glassInputClass} resize-none min-h-[100px]`}
            style={glassInputStyle}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            className={glassInputClass}
            style={glassInputStyle}
          >
            <option value="" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
              {question.placeholder || "Choose an option..."}
            </option>
            {(question.options || []).map((option, index) => (
              <option key={index} value={option} style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            {(question.options || []).map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:bg-white/10"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <input
                  type="radio"
                  name={`radio-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-4 h-4 text-white/80 bg-white/20 border-white/30 focus:ring-white/50 focus:ring-2"
                />
                <span className="text-white/90 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {(question.options || []).map((option, index) => (
              <label 
                key={index} 
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:bg-white/10"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange([...currentValues, option]);
                    } else {
                      handleInputChange(currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-white/80 bg-white/20 border-white/30 focus:ring-white/50 focus:ring-2"
                />
                <span className="text-white/90 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type={question.type || 'text'}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className={glassInputClass}
            style={glassInputStyle}
          />
        );
    }
  };

  const isValid = question.type === 'radio' || question.type === 'checkbox' ? value : value.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="w-full max-w-md mx-4"
    >
      <div 
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
        }}
      >
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">
              Step {stepNumber} of {totalSteps}
            </span>
            <span className="text-sm text-white/80">
              {Math.round((stepNumber / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white/80 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Form Title and Description - Only show if enabled and exist */}
        {stepNumber === 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            {form.settings?.showTitle !== false && form.title && (
              <h1 className="text-2xl font-bold text-white mb-2">{form.title}</h1>
            )}
            {form.settings?.showDescription !== false && form.description && (
              <p className="text-white/80 text-sm">{form.description}</p>
            )}
          </motion.div>
        )}

        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl font-semibold text-white mb-6 text-center"
        >
          {question.question}
        </motion.h2>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          {renderInput()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={stepNumber === 1}
            className="px-4 py-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <motion.button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              disabled={!isValid}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FormView;