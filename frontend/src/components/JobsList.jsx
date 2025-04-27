import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../contexts/JobContext';
import { Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const JobsList = () => {
  const { jobs, loading, error, refreshJobs } = useJobs();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Initial fetch of jobs is handled by the JobContext
    // We can add a refresh on component mount if needed
    refreshJobs();
  }, [refreshJobs]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'pending':
      case 'queued':
        return <Clock className="text-yellow-500" size={20} />;
      case 'processing':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  if (loading && jobs.length === 0) {
    return (
      <div className="jobs-loading flex flex-col items-center justify-center p-12">
        <RefreshCw className="animate-spin mb-4" size={48} />
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="jobs-error flex flex-col items-center justify-center p-12">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-center">{error}</p>
        <button 
          onClick={refreshJobs}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Analysis Jobs</h1>
        <div className="flex items-center">
          <div className="filter-controls mr-4">
            <span className="mr-2">Filter:</span>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select p-2 border rounded bg-white"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="queued">Queued</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button 
            onClick={refreshJobs}
            className="refresh-btn p-2 rounded hover:bg-gray-100"
            title="Refresh jobs"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className="no-jobs p-12 bg-gray-50 rounded text-center">
          <p className="mb-4">No jobs found. Start a new analysis to see results here.</p>
          <Link 
            to="/new" 
            className="new-analysis-btn px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Start New Analysis
          </Link>
        </div>
      ) : (
        <div className="jobs-list overflow-x-auto">
          <table className="jobs-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border-b">ID</th>
                <th className="p-3 text-left border-b">Status</th>
                <th className="p-3 text-left border-b">Region</th>
                <th className="p-3 text-left border-b">Date Range</th>
                <th className="p-3 text-left border-b">Created</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} className={`job-row hover:bg-gray-50 status-${job.status}`}>
                  <td className="p-3 border-b">{job.id}</td>
                  <td className="p-3 border-b">
                    <div className="status-cell flex items-center">
                      {getStatusIcon(job.status)}
                      <span className="ml-2 capitalize">{job.status}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b">{job.region_name || job.region_id}</td>
                  <td className="p-3 border-b">
                    {formatDate(job.start_date).split(' ')[0]} to {formatDate(job.end_date).split(' ')[0]}
                  </td>
                  <td className="p-3 border-b">{formatDate(job.created_at)}</td>
                  <td className="p-3 border-b">
                    <Link 
                      to={`/results/${job.id}`}
                      className={`view-results-btn px-3 py-1 rounded text-white text-sm ${
                        job.status === 'completed' 
                          ? 'bg-primary-600 hover:bg-primary-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      aria-disabled={job.status !== 'completed'}
                      onClick={(e) => job.status !== 'completed' && e.preventDefault()}
                    >
                      View Results
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobsList;
