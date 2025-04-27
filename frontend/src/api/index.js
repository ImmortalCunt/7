import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints for jobs
export const jobsApi = {
  // Create a new job
  createJob: (jobData) => {
    return api.post('/api/jobs', jobData);
  },
  
  // Get a job by ID
  getJob: (jobId) => {
    return api.get(`/api/jobs/${jobId}`);
  },
  
  // Get all jobs with optional filtering
  getJobs: (params = {}) => {
    return api.get('/api/jobs', { params });
  },
  
  // Cancel a job
  cancelJob: (jobId) => {
    return api.post(`/api/jobs/${jobId}/cancel`);
  }
};

// API endpoints for regions
export const regionsApi = {
  // Create a new region
  createRegion: (regionData) => {
    return api.post('/api/regions', regionData);
  },
  
  // Get a region by ID
  getRegion: (regionId) => {
    return api.get(`/api/regions/${regionId}`);
  },
  
  // Get all regions
  getRegions: (params = {}) => {
    return api.get('/api/regions', { params });
  }
};

// API endpoints for results
export const resultsApi = {
  // Get results for a job
  getResultsByJobId: (jobId) => {
    return api.get(`/api/results/job/${jobId}`);
  },
  
  // Get a result by ID
  getResult: (resultId) => {
    return api.get(`/api/results/${resultId}`);
  },
  
  // Download a report
  downloadReport: (jobId) => {
    return api.get(`/api/results/job/${jobId}/report`, {
      responseType: 'blob'
    });
  }
};

// API endpoints for data sources
export const dataSourcesApi = {
  // Get available satellite data for a region and date range
  getAvailableSatelliteData: (params) => {
    return api.get('/api/data-sources/satellite', { params });
  },
  
  // Get available soil data for a region
  getAvailableSoilData: (params) => {
    return api.get('/api/data-sources/soil', { params });
  },
  
  // Get available climate data for a region and date range
  getAvailableClimateData: (params) => {
    return api.get('/api/data-sources/climate', { params });
  }
};

// Request interceptor for handling auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear auth token and redirect to login if needed
        localStorage.removeItem('auth_token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
