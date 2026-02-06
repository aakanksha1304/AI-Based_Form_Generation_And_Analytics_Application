import React from 'react'
import { motion } from 'framer-motion'

const ThankYou = ({ formData, onSubmit }) => {
  const handleSubmit = () => {
    onSubmit()
    // You could add a success animation or redirect here
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2
        }}
        className="form-card p-8 w-full max-w-lg text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
            delay: 0.5
          }}
          className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        {/* Thank you message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-3xl font-semibold text-gray-800 mb-4"
        >
          Thank you, {formData.name}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-gray-600 mb-8"
        >
          Your form has been completed successfully. We appreciate you taking the time to share your information with us.
        </motion.p>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-50 rounded-xl p-6 mb-8 text-left"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Your Responses:</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="font-medium text-gray-800">{formData.name}</p>
            </div>
            {formData.motivation && (
              <div>
                <span className="text-sm text-gray-500">Motivation:</span>
                <p className="font-medium text-gray-800">{formData.motivation}</p>
              </div>
            )}
            {formData.vibe && (
              <div>
                <span className="text-sm text-gray-500">Vibe:</span>
                <p className="font-medium text-gray-800">{formData.vibe}</p>
              </div>
            )}
            {formData.image && (
              <div>
                <span className="text-sm text-gray-500">Profile Image:</span>
                <p className="font-medium text-gray-800">{formData.image.name}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Submit button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          onClick={handleSubmit}
          className="btn-primary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Submit Form
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-sm text-gray-500 mt-4"
        >
          This will send your information to our system
        </motion.p>
      </motion.div>
    </div>
  )
}

export default ThankYou