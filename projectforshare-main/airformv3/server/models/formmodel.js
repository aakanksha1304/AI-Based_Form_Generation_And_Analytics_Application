import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'tel', 'url', 'password']
  },
  placeholder: { type: String, default: '' },
  options: [{ type: String }], // For select, radio, checkbox
  required: { type: Boolean, default: false },
  validation: {
    minLength: { type: Number },
    maxLength: { type: Number },
    pattern: { type: String }
  }
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  questions: [questionSchema],
  backgroundMedia: {
    type: { type: String, enum: ['image', 'video'] },
    url: { type: String },
    name: { type: String }
  },
  settings: {
    isPublic: { type: Boolean, default: true },
    allowMultipleSubmissions: { type: Boolean, default: true },
    showProgressBar: { type: Boolean, default: true },
    requireName: { type: Boolean, default: true },
    requireEmail: { type: Boolean, default: false },
    showTitle: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    customTheme: {
      primaryColor: { type: String, default: '#3b82f6' },
      backgroundColor: { type: String, default: '#ffffff' }
    }
  },
  analytics: {
    views: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  shareableLink: { type: String, unique: true },
  customUrl: { type: String, unique: true, sparse: true }, // Custom short URL
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate shareable link and custom URL before saving
formSchema.pre('save', async function(next) {
  if (!this.shareableLink) {
    this.shareableLink = generateShareableId();
  }
  if (!this.customUrl && this.title) {
    // Get user info for URL generation
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    this.customUrl = await generateCustomUrl(this.title, user?.name);
  }
  this.updatedAt = new Date();
  next();
});

function generateShareableId() {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
}

async function generateCustomUrl(title, userName) {
  const Form = mongoose.model('Form');
  
  // Create base from title (first 2-3 words max)
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 2); // Take only first 2 words
  
  const titlePart = titleWords.join('-');
  
  // Create user part (first 3-4 chars of name)
  const userPart = userName 
    ? userName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 3)
    : 'user';
  
  // Generate short random suffix
  const suffix = Math.random().toString(36).substring(2, 4);
  
  // Combine: user-title-suffix (e.g., "john-contact-a1")
  let customUrl = `${userPart}-${titlePart}-${suffix}`;
  
  // Ensure it's not too long (max 20 chars)
  if (customUrl.length > 20) {
    customUrl = `${userPart}-${titlePart.substring(0, 8)}-${suffix}`;
  }
  
  // Check for uniqueness and regenerate if needed
  let attempts = 0;
  while (attempts < 5) {
    const existing = await Form.findOne({ customUrl });
    if (!existing) break;
    
    // Regenerate suffix if URL exists
    const newSuffix = Math.random().toString(36).substring(2, 4);
    customUrl = `${userPart}-${titlePart}-${newSuffix}`;
    attempts++;
  }
  
  return customUrl;
}

export default mongoose.model("Form", formSchema);