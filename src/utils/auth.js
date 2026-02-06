// Authentication utility functions
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Token management
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

// User data management
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired (no buffer for now to prevent premature logout)
    if (payload.exp < currentTime) {
      // Token expired, clean up
      removeAuthToken();
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token format
    removeAuthToken();
    return false;
  }
};

// Validate token with server
export const validateTokenWithServer = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`);
    return response.data.response === true;
  } catch (error) {
    if (error.response?.status === 401) {
      removeAuthToken();
      return false;
    }
    // For other errors, assume token is still valid to prevent unnecessary logouts
    return true;
  }
};

// Logout function
export const logout = () => {
  removeAuthToken();
  window.location.href = '/login';
};

// Axios interceptor setup
export const setupAxiosInterceptors = () => {
  // Request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Only logout if we're not already on login/register page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          console.log('Token expired, redirecting to login');
          logout();
        }
      }
      return Promise.reject(error);
    }
  );
};

// API functions
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting login with:', { email: credentials.email, url: `${API_BASE_URL}/login` });
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    console.log('Login response:', response.data);
    const { token, name, userId } = response.data;
    
    // Store token and user data
    setAuthToken(token);
    setUserData({ email: credentials.email, userId, name });
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Attempting registration with:', { email: userData.email, url: `${API_BASE_URL}/register` });
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    console.log('Registration response:', response.data);
    const { token, name, userId } = response.data;
    
    // Store token and user data
    setAuthToken(token);
    setUserData({ email: userData.email, userId, name });
    
    return response.data;
  } catch (error) {
    console.error('Registration error details:', error.response?.data || error.message);
    throw error;
  }
};