import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ImageUpload from './ImageUpload'

const FormCard = ({ question, onNext, stepNumber, totalSteps }) => {
  const [value, setValue] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.type === 'image') {
      if (imageFile) {
        onNext(imageFile)
      }
    } else if (value.trim()) {
      onNext(value)
    }
  }

  const handleImageSelect = (file) => {
    setImageFile(file)
  }

  const renderInput = () => {
    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder}
            className="input-field min-h-[120px] resize-none"
            rows={4}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-field"
          >
            <option value="">Choose your vibe...</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'image':
        return (
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={imageFile}
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.placeholder}
            className="input-field"
          />
        )
    }
  }

  const isValid = question.type === 'image' ? imageFile : value.trim()

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
      className="w-full max-w-md mx-auto"
    >
      <div className="form-card p-8">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Step {stepNumber} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((stepNumber / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
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
          className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 text-center"
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
            className={`btn-primary w-full ${
              !isValid ? 'opacity-50 cursor-not-allowed transform-none' : ''
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
          className="text-center text-gray-500 text-sm mt-4"
        >
          Press Enter to continue
        </motion.p>
      </div>
    </motion.div>
  )
}

export default FormCard