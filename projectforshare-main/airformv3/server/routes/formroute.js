import express from "express";
import { 
  createForm, 
  getUserForms, 
  getFormById, 
  getFormByLink, 
  updateForm, 
  deleteForm, 
  getFormAnalytics,
  getDashboardAnalytics
} from "../controllers/formcontroller.js";
import { 
  submitForm, 
  getFormSubmissions, 
  getUserSubmissions, 
  getSubmissionDetails, 
  updateSubmissionStatus 
} from "../controllers/submissioncontroller.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Form routes (protected)
router.post("/forms", authenticateToken, createForm);
router.get("/forms", authenticateToken, getUserForms);
router.get("/forms/:formId", authenticateToken, getFormById);
router.put("/forms/:formId", authenticateToken, updateForm);
router.delete("/forms/:formId", authenticateToken, deleteForm);

// Analytics routes (protected)
router.get("/forms/:formId/analytics", authenticateToken, getFormAnalytics);
router.get("/dashboard/analytics", authenticateToken, getDashboardAnalytics);

// Submission routes (protected)
router.get("/forms/:formId/submissions", authenticateToken, getFormSubmissions);
router.get("/submissions", authenticateToken, getUserSubmissions);
router.get("/submissions/:submissionId", authenticateToken, getSubmissionDetails);
router.put("/submissions/:submissionId/status", authenticateToken, updateSubmissionStatus);

// Public routes (no authentication required)
router.get("/f/:shareableLink", getFormByLink); // Public form access
router.post("/f/:shareableLink/submit", submitForm); // Public form submission

export default router;