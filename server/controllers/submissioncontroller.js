import submissionmodel from "../models/submissionmodel.js";
import formmodel from "../models/formmodel.js";

// Global variable to store broadcast function
let broadcastToUser = null;

// Function to set the broadcast function
export const setBroadcastFunction = (fn) => {
  broadcastToUser = fn;
};

// Submit form response (public endpoint)
const submitForm = async (req, res) => {
  try {
    const { shareableLink } = req.params;
    const { responses, submitterInfo, metadata } = req.body;

    // Find the form by custom URL or shareable link
    const form = await formmodel.findOne({ 
      $or: [
        { customUrl: shareableLink },
        { shareableLink: shareableLink }
      ],
      status: 'published' 
    });

    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found or not accepting submissions"
      });
    }

    // Create submission
    const submission = new submissionmodel({
      formId: form._id,
      formOwnerId: form.userId,
      responses,
      submitterInfo: {
        email: submitterInfo?.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        ...submitterInfo
      },
      metadata: {
        timeSpent: metadata?.timeSpent,
        deviceType: getDeviceType(req.get('User-Agent')),
        browser: getBrowser(req.get('User-Agent')),
        referrer: req.get('Referrer'),
        ...metadata
      }
    });

    await submission.save();

    // Update form analytics
    await formmodel.findByIdAndUpdate(form._id, {
      $inc: { 'analytics.submissions': 1 }
    });

    // Calculate and update completion rate
    const totalViews = form.analytics.views + 1; // +1 for current view
    const totalSubmissions = form.analytics.submissions + 1;
    const completionRate = Math.round((totalSubmissions / totalViews) * 100);

    await formmodel.findByIdAndUpdate(form._id, {
      'analytics.completionRate': completionRate
    });

    // Broadcast real-time update to form owner
    if (broadcastToUser) {
      const submitterName = submitterInfo?.name || submitterInfo?.email || 'Anonymous User';
      broadcastToUser(form.userId, {
        type: 'new_submission',
        data: {
          formId: form._id,
          formTitle: form.title,
          submissionId: submission._id,
          submittedBy: submitterName,
          submittedAt: submission.submittedAt,
          responseCount: responses.length
        }
      });
    }

    res.status(201).json({
      response: true,
      message: "Form submitted successfully",
      submissionId: submission._id
    });
  } catch (error) {
    console.error("Submit form error:", error);
    res.status(500).json({
      response: false,
      message: "Error submitting form"
    });
  }
};

// Get submissions for a form (protected)
const getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Verify form ownership
    const form = await formmodel.findOne({ _id: formId, userId });
    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found"
      });
    }

    const query = { formId };
    if (status) query.status = status;

    const submissions = await submissionmodel.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await submissionmodel.countDocuments(query);

    res.status(200).json({
      response: true,
      submissions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get form submissions error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching submissions"
    });
  }
};

// Get all submissions for user (across all forms)
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { formOwnerId: userId };
    if (status) query.status = status;

    const submissions = await submissionmodel.find(query)
      .populate('formId', 'title')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await submissionmodel.countDocuments(query);

    res.status(200).json({
      response: true,
      submissions: submissions.map(sub => ({
        id: sub._id,
        formName: sub.formId?.title || 'Unknown Form',
        submittedBy: sub.submitterInfo?.name || sub.submitterInfo?.email || 'Anonymous User',
        submittedAt: sub.submittedAt,
        status: sub.status,
        responseCount: sub.responses.length,
        submitterInfo: sub.submitterInfo // Include full submitter info for better display
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get user submissions error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching submissions"
    });
  }
};

// Get submission details
const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await submissionmodel.findOne({ 
      _id: submissionId, 
      formOwnerId: userId 
    }).populate('formId', 'title questions');

    if (!submission) {
      return res.status(404).json({
        response: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      response: true,
      submission
    });
  } catch (error) {
    console.error("Get submission details error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching submission details"
    });
  }
};

// Update submission status
const updateSubmissionStatus = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const submission = await submissionmodel.findOneAndUpdate(
      { _id: submissionId, formOwnerId: userId },
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        response: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      response: true,
      message: "Submission status updated",
      submission
    });
  } catch (error) {
    console.error("Update submission status error:", error);
    res.status(500).json({
      response: false,
      message: "Error updating submission status"
    });
  }
};

// Helper functions
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

export { 
  submitForm, 
  getFormSubmissions, 
  getUserSubmissions, 
  getSubmissionDetails, 
  updateSubmissionStatus 
};