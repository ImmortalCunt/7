import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobsApi, resultsApi } from '../api';

// Create context
const JobContext = createContext();

// Custom hook to use the job context
export const useJobs = () => useContext(JobContext);

// Provider component
export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobsApi.getJobs();
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, [refreshTrigger]);

  // Create a new job
  const createJob = async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.createJob(jobData);
      // Refresh the jobs list
      setRefreshTrigger(prev => prev + 1);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.detail || 'Failed to create job. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  // Get a job by ID
  const getJob = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobsApi.getJob(jobId);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error(`Error fetching job ${jobId}:`, err);
      setError(`Failed to load job ${jobId}. Please try again later.`);
      setLoading(false);
      throw err;
    }
  };

  // Cancel a job
  const cancelJob = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      await jobsApi.cancelJob(jobId);
      // Refresh the jobs list
      setRefreshTrigger(prev => prev + 1);
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error cancelling job ${jobId}:`, err);
      setError(`Failed to cancel job ${jobId}. Please try again.`);
      setLoading(false);
      throw err;
    }
  };

  // Get results for a job
  const getJobResults = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await resultsApi.getResultsByJobId(jobId);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error(`Error fetching results for job ${jobId}:`, err);
      setError(`Failed to load results for job ${jobId}. Please try again later.`);
      setLoading(false);
      throw err;
    }
  };

  // Download a report for a job
  const downloadJobReport = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await resultsApi.downloadReport(jobId);
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_job_${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error downloading report for job ${jobId}:`, err);
      setError(`Failed to download report for job ${jobId}. Please try again later.`);
      setLoading(false);
      throw err;
    }
  };

  // Refresh jobs list
  const refreshJobs = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Context value
  const value = {
    jobs,
    loading,
    error,
    createJob,
    getJob,
    cancelJob,
    getJobResults,
    downloadJobReport,
    refreshJobs
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export default JobContext;
