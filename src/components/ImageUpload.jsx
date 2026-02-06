import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const ImageUpload = ({ onImageSelect, selectedImage }) => {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFiles = (files) => {
    const file = files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedImage
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-xs">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-48 object-contain rounded-lg shadow-md"
                style={{
                  aspectRatio: 'auto',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </div>
            <div className="text-sm text-green-600 font-medium">
              ✓ Image selected
            </div>
            <div className="text-xs text-gray-500">
              Click to change image
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="text-gray-600 font-medium">
                Drop your image here, or click to browse
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Supports any image format and dimension
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-gray-600 text-center"
        >
          <span className="font-medium">{selectedImage.name}</span>
          <span className="text-gray-400 ml-2">
            ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </motion.div>
      )}
    </div>
  )
}

export default ImageUpload