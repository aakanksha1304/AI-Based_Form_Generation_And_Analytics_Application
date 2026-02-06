import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Form Management
export const createForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forms`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserForms = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forms`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFormById = async (formId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forms/${formId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateForm = async (formId, formData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/forms/${formId}`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteForm = async (formId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/forms/${formId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Public Form Access
export const getFormByLink = async (shareableLink) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/f/${shareableLink}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitFormResponse = async (shareableLink, submissionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/f/${shareableLink}/submit`, submissionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Analytics
export const getFormAnalytics = async (formId, period = '7d') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forms/${formId}/analytics`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardAnalytics = async (period = '14d') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submissions
export const getFormSubmissions = async (formId, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forms/${formId}/submissions`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserSubmissions = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/submissions`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubmissionDetails = async (submissionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubmissionStatus = async (submissionId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/submissions/${submissionId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};