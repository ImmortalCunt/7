import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../contexts/JobContext';
import Plot from 'react-plotly.js';
import { FileDown, RefreshCw, AlertTriangle } from 'lucide-react';

const ResultsView = () => {
  const { jobId } = useParams();
  const { getJob, getJobResults, downloadJobReport, loading, error } = useJobs();
  const [job, setJob] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('soc');
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    // Fetch job details and results
    const fetchJobAndResults = async () => {
      try {
        // Fetch job details
        const jobData = await getJob(jobId);
        setJob(jobData);
        
        // If job is completed, fetch results
        if (jobData.status === 'completed') {
          const resultsData = await getJobResults(jobId);
          setResults(resultsData);
          
          // Clear polling if it was set
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } catch (err) {
        console.error('Error in fetchJobAndResults:', err);
        // Error is handled by the context
      }
    };
    
    fetchJobAndResults();
    
    // Set up polling for job status updates if job is still processing
    if (!pollingInterval && (!job || ['pending', 'processing', 'queued'].includes(job.status))) {
      const interval = setInterval(fetchJobAndResults, 5000); // Poll every 5 seconds
      setPollingInterval(interval);
    }
    
    // Clean up interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [jobId, job?.status, getJob, getJobResults, pollingInterval]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDownloadReport = async () => {
    if (results && results.report_path) {
      try {
        await downloadJobReport(jobId);
      } catch (err) {
        console.error('Error downloading report:', err);
        // Error is handled by the context
      }
    }
  };

  if (loading && !job) {
    return (
      <div className="results-loading">
        <RefreshCw className="animate-spin" size={48} />
        <p>Loading results...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="results-error">
        <AlertTriangle size={48} className="text-red-500" />
        <p>{error}</p>
        <Link to="/jobs" className="mt-4 inline-block text-blue-500 hover:underline">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="results-error">
        <AlertTriangle size={48} className="text-red-500" />
        <p>Job not found</p>
        <Link to="/jobs" className="mt-4 inline-block text-blue-500 hover:underline">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (['pending', 'processing', 'queued'].includes(job.status)) {
    return (
      <div className="results-processing">
        <RefreshCw className="animate-spin" size={48} />
        <h2 className="text-xl font-bold mt-4">Your analysis is in progress</h2>
        <p className="mt-2">Current status: {job.status}</p>
        <div className="progress-bar mt-4 w-full max-w-md">
          <div 
            className="progress-fill" 
            style={{ 
              width: job.status === 'pending' ? '10%' : 
                    job.status === 'queued' ? '30%' : 
                    job.status === 'processing' ? '70%' : '0%' 
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">This may take several minutes depending on the size of your region and date range.</p>
      </div>
    );
  }

  if (job.status === 'failed') {
    return (
      <div className="results-error">
        <AlertTriangle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold mt-4">Analysis Failed</h2>
        <p className="mt-2">{job.error_message || 'An unknown error occurred during processing.'}</p>
        <Link to="/new" className="mt-4 inline-block text-blue-500 hover:underline">
          Start a New Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <button 
          className="download-report-btn flex items-center bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          onClick={handleDownloadReport}
          disabled={!results || !results.report_path || loading}
        >
          {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <FileDown size={20} className="mr-2" />}
          Download Report
        </button>
      </div>
      
      <div className="results-tabs flex border-b border-gray-200 mb-6">
        <button 
          className={`tab py-2 px-4 font-medium ${activeTab === 'soc' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('soc')}
        >
          Soil Organic Carbon
        </button>
        <button 
          className={`tab py-2 px-4 font-medium ${activeTab === 'moisture' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('moisture')}
        >
          Soil Moisture
        </button>
      </div>
      
      <div className="results-content">
        {activeTab === 'soc' ? (
          <div className="soc-results">
            <div className="map-container mb-6">
              {results && results.soc_map_path ? (
                <div className="result-map">
                  <h3 className="text-lg font-medium mb-2">Soil Organic Carbon Map</h3>
                  <img 
                    src={`/api/results/image/${results.soc_map_path}`} 
                    alt="Soil Organic Carbon Map" 
                    className="result-image border rounded shadow-sm"
                  />
                </div>
              ) : (
                <div className="no-map p-6 bg-gray-100 rounded text-center">
                  <p>Map visualization not available</p>
                </div>
              )}
            </div>
            
            <div className="stats-container mb-6">
              <h3 className="text-lg font-medium mb-2">SOC Statistics</h3>
              {results ? (
                <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Minimum</span>
                    <span className="stat-value block text-xl font-bold">{results.soc_min?.toFixed(2)} g/kg</span>
                  </div>
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Maximum</span>
                    <span className="stat-value block text-xl font-bold">{results.soc_max?.toFixed(2)} g/kg</span>
                  </div>
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Mean</span>
                    <span className="stat-value block text-xl font-bold">{results.soc_mean?.toFixed(2)} g/kg</span>
                  </div>
                </div>
              ) : (
                <p className="p-4 bg-gray-100 rounded text-center">Statistics not available</p>
              )}
            </div>
            
            {results && (
              <div className="chart-container">
                <h3 className="text-lg font-medium mb-2">SOC Distribution</h3>
                <div className="chart-wrapper border rounded shadow-sm p-4 bg-white">
                  <Plot
                    data={[
                      {
                        x: ['Min', 'Mean', 'Max'],
                        y: [results.soc_min, results.soc_mean, results.soc_max],
                        type: 'bar',
                        marker: {color: 'green'}
                      }
                    ]}
                    layout={{
                      title: 'Soil Organic Carbon Distribution',
                      yaxis: {title: 'SOC (g/kg)'},
                      autosize: true,
                      margin: {l: 50, r: 50, t: 50, b: 50}
                    }}
                    useResizeHandler={true}
                    style={{width: '100%', height: '300px'}}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="moisture-results">
            <div className="map-container mb-6">
              {results && results.moisture_map_path ? (
                <div className="result-map">
                  <h3 className="text-lg font-medium mb-2">Soil Moisture Map</h3>
                  <img 
                    src={`/api/results/image/${results.moisture_map_path}`} 
                    alt="Soil Moisture Map" 
                    className="result-image border rounded shadow-sm"
                  />
                </div>
              ) : (
                <div className="no-map p-6 bg-gray-100 rounded text-center">
                  <p>Map visualization not available</p>
                </div>
              )}
            </div>
            
            <div className="stats-container mb-6">
              <h3 className="text-lg font-medium mb-2">Moisture Statistics</h3>
              {results ? (
                <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Minimum</span>
                    <span className="stat-value block text-xl font-bold">{results.moisture_min?.toFixed(2)}%</span>
                  </div>
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Maximum</span>
                    <span className="stat-value block text-xl font-bold">{results.moisture_max?.toFixed(2)}%</span>
                  </div>
                  <div className="stat-item p-4 bg-white rounded shadow-sm">
                    <span className="stat-label text-sm text-gray-500">Mean</span>
                    <span className="stat-value block text-xl font-bold">{results.moisture_mean?.toFixed(2)}%</span>
                  </div>
                </div>
              ) : (
                <p className="p-4 bg-gray-100 rounded text-center">Statistics not available</p>
              )}
            </div>
            
            {results && (
              <div className="chart-container">
                <h3 className="text-lg font-medium mb-2">Moisture Distribution</h3>
                <div className="chart-wrapper border rounded shadow-sm p-4 bg-white">
                  <Plot
                    data={[
                      {
                        x: ['Min', 'Mean', 'Max'],
                        y: [results.moisture_min, results.moisture_mean, results.moisture_max],
                        type: 'bar',
                        marker: {color: 'blue'}
                      }
                    ]}
                    layout={{
                      title: 'Soil Moisture Distribution',
                      yaxis: {title: 'Moisture (%)'},
                      autosize: true,
                      margin: {l: 50, r: 50, t: 50, b: 50}
                    }}
                    useResizeHandler={true}
                    style={{width: '100%', height: '300px'}}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
