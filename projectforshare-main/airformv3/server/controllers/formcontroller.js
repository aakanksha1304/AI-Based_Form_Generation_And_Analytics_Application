import formmodel from "../models/formmodel.js";
import submissionmodel from "../models/submissionmodel.js";

// Create a new form
const createForm = async (req, res) => {
  try {
    const { title, description, questions, backgroundMedia, settings } = req.body;
    const userId = req.user._id;

    const formData = {
      title,
      description,
      userId,
      questions,
      backgroundMedia,
      settings: settings || {},
      status: 'published' // Auto-publish when created from builder
    };

    const newForm = new formmodel(formData);
    const savedForm = await newForm.save();

    res.status(201).json({
      response: true,
      message: "Form created successfully",
      form: savedForm
    });
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({
      response: false,
      message: "Error creating form"
    });
  }
};

// Get all forms for a user
const getUserForms = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const forms = await formmodel.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await formmodel.countDocuments(query);

    res.status(200).json({
      response: true,
      forms,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error("Get user forms error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching forms"
    });
  }
};

// Get form by ID (for editing)
const getFormById = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user._id;

    const form = await formmodel.findOne({ _id: formId, userId });
    
    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found"
      });
    }

    res.status(200).json({
      response: true,
      form
    });
  } catch (error) {
    console.error("Get form by ID error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching form"
    });
  }
};

// Get form by shareable link or custom URL (public access)
const getFormByLink = async (req, res) => {
  try {
    const { shareableLink } = req.params;

    // Try to find by custom URL first, then by shareable link
    const form = await formmodel.findOne({ 
      $or: [
        { customUrl: shareableLink },
        { shareableLink: shareableLink }
      ],
      status: 'published' 
    }).populate('userId', 'name');

    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found or not published"
      });
    }

    // Increment view count
    await formmodel.findByIdAndUpdate(form._id, {
      $inc: { 'analytics.views': 1 }
    });

    res.status(200).json({
      response: true,
      form: {
        _id: form._id,
        title: form.title,
        description: form.description,
        questions: form.questions,
        backgroundMedia: form.backgroundMedia,
        settings: form.settings,
        createdBy: form.userId.name
      }
    });
  } catch (error) {
    console.error("Get form by link error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching form"
    });
  }
};

// Update form
const updateForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const form = await formmodel.findOneAndUpdate(
      { _id: formId, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found"
      });
    }

    res.status(200).json({
      response: true,
      message: "Form updated successfully",
      form
    });
  } catch (error) {
    console.error("Update form error:", error);
    res.status(500).json({
      response: false,
      message: "Error updating form"
    });
  }
};

// Delete form
const deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user._id;

    const form = await formmodel.findOneAndDelete({ _id: formId, userId });

    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found"
      });
    }

    // Also delete all submissions for this form
    await submissionmodel.deleteMany({ formId });

    res.status(200).json({
      response: true,
      message: "Form deleted successfully"
    });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({
      response: false,
      message: "Error deleting form"
    });
  }
};

// Get form analytics
const getFormAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { formId } = req.params;
    const { period = '7d' } = req.query; // 7d, 30d, 90d

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
    }

    const form = await formmodel.findOne({ _id: formId, userId });
    if (!form) {
      return res.status(404).json({
        response: false,
        message: "Form not found"
      });
    }

    // Get submissions over time
    const submissions = await submissionmodel.aggregate([
      {
        $match: {
          formId: form._id,
          submittedAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent submissions
    const recentSubmissions = await submissionmodel.find({ formId })
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('submitterInfo submittedAt status responses');

    res.status(200).json({
      response: true,
      analytics: {
        totalViews: form.analytics.views,
        totalSubmissions: form.analytics.submissions,
        completionRate: form.analytics.completionRate,
        submissionsOverTime: submissions,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error("Get form analytics error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching analytics"
    });
  }
};

// Get dashboard analytics (all forms)
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '14d' } = req.query;

    let dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(period.replace('d', '')));

    // Get user's forms
    const userForms = await formmodel.find({ userId }).select('_id analytics');
    const formIds = userForms.map(form => form._id);

    // Total stats
    const totalViews = userForms.reduce((sum, form) => sum + form.analytics.views, 0);
    const totalSubmissions = userForms.reduce((sum, form) => sum + form.analytics.submissions, 0);

    // Submissions over time
    const submissionsOverTime = await submissionmodel.aggregate([
      {
        $match: {
          formOwnerId: userId,
          submittedAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%b %d", date: "$submittedAt" }
          },
          responses: { $sum: 1 },
          // Simulate views (in real app, you'd track this separately)
          views: { $sum: { $multiply: [{ $rand: {} }, 5] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent submissions across all forms
    const recentSubmissions = await submissionmodel.find({ formOwnerId: userId })
      .populate('formId', 'title')
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('formId submitterInfo submittedAt status');

    res.status(200).json({
      response: true,
      analytics: {
        totalForms: userForms.length,
        totalViews,
        totalSubmissions,
        averageCompletionRate: userForms.length > 0 
          ? userForms.reduce((sum, form) => sum + form.analytics.completionRate, 0) / userForms.length 
          : 0,
        submissionsOverTime,
        recentSubmissions: recentSubmissions.map(sub => ({
          id: sub._id,
          formName: sub.formId?.title || 'Unknown Form',
          submittedBy: sub.submitterInfo?.name || sub.submitterInfo?.email || 'Anonymous User',
          submittedAt: sub.submittedAt,
          status: sub.status,
          submitterInfo: sub.submitterInfo
        }))
      }
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    res.status(500).json({
      response: false,
      message: "Error fetching dashboard analytics"
    });
  }
};

export { 
  createForm, 
  getUserForms, 
  getFormById, 
  getFormByLink, 
  updateForm, 
  deleteForm, 
  getFormAnalytics,
  getDashboardAnalytics
};