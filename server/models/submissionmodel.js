import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  formOwnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  responses: [{
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string, array, etc.
    questionType: { type: String, required: true }
  }],
  submitterInfo: {
    name: { type: String },
    email: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: {
      country: { type: String },
      city: { type: String }
    }
  },
  metadata: {
    timeSpent: { type: Number }, // in seconds
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    browser: { type: String },
    referrer: { type: String }
  },
  status: { 
    type: String, 
    enum: ['new', 'reviewed', 'processed', 'archived'], 
    default: 'new' 
  },
  submittedAt: { type: Date, default: Date.now }
});

// Index for better query performance
submissionSchema.index({ formId: 1, submittedAt: -1 });
submissionSchema.index({ formOwnerId: 1, submittedAt: -1 });

export default mongoose.model("Submission", submissionSchema);