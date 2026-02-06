import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FormPreview = ({ formConfig, onModeSwitch }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isComplete, setIsComplete] = useState(false)

  const { backgroundMedia, selectedMediaData, questions } = formConfig

  if (!backgroundMedia || !selectedMediaData || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Form to Preview</h3>
          <p className="text-gray-500">Create a form in the builder to see the preview</p>
        </div>
      </div>
    )
  }

  const handleNext = (value) => {
    const currentQuestion = questions[currentStep]
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handleSubmit = () => {
    console.log('Form submitted:', formData)
    alert('Form submitted successfully!')
  }

  const renderBackground = () => {
    if (selectedMediaData?.type === 'video') {
      return (
        <video
          src={backgroundMedia}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
        />
      )
    } else {
      return (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundMedia})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {renderBackground()}
        {/* Exit button */}
        <button
          onClick={() => onModeSwitch('builder')}
          className="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 max-w-md w-full text-center mx-4 relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))'
          }}
        >
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">Thank You!</h2>
          <p className="text-white/90 mb-6">Your form has been submitted successfully.</p>
          <button
            onClick={handleSubmit}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-medium transition-colors backdrop-blur-sm border border-white/20"
          >
            Submit
          </button>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {renderBackground()}
      {/* Exit button */}
      <button
        onClick={() => onModeSwitch('builder')}
        className="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        <FormCard
          key={currentStep}
          question={currentQuestion}
          onNext={handleNext}
          stepNumber={currentStep + 1}
          totalSteps={questions.length}
        />
      </AnimatePresence>
    </div>
  )
}

const FormCard = ({ question, onNext, stepNumber, totalSteps }) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onNext(value)
      setValue('')
    }
  }

  const renderInput = () => {
    const glassInputStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white'
    }

    const glassInputClass = "w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/30"

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className={`${glassInputClass} resize-none min-h-[100px]`}
            style={glassInputStyle}
            rows={4}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
        )
      
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
                  name="radio-option"
                  value={option}
                  checked={value === option}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-4 h-4 text-white/80 bg-white/20 border-white/30 focus:ring-white/50 focus:ring-2"
                />
                <span className="text-white/90 font-medium">{option}</span>
              </label>
            ))}
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className={glassInputClass}
            style={glassInputStyle}
          />
        )
    }
  }

  const isValid = question.type === 'radio' ? value : value.trim()

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

        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl font-semibold text-white mb-6 text-center"
        >
          {question.question}
        </motion.h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {renderInput()}
          </motion.div>

          <motion.button
            type="submit"
            disabled={!isValid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 ${
              !isValid ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
            }`}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            {stepNumber === totalSteps ? 'Complete' : 'Next'}
          </motion.button>
        </form>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/70 text-sm mt-4"
        >
          Press Enter to continue
        </motion.p>
      </div>
    </motion.div>
  )
}

export default FormPreview