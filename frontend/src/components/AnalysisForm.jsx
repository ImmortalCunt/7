import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegionSelection from './RegionSelection';
import DateSelection from './DateSelection';
import { useJobs } from '../contexts/JobContext';
import { ArrowRight, Send, AlertTriangle, RefreshCw } from 'lucide-react';

const AnalysisForm = () => {
  const navigate = useNavigate();
  const { createJob, loading: jobLoading, error: jobError } = useJobs();
  const [currentStep, setCurrentStep] = useState(1);
  const [regionData, setRegionData] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [localError, setLocalError] = useState(null);

  const handleRegionSelected = (data) => {
    setRegionData(data);
    setLocalError(null);
  };

  const handleDateRangeSelected = (range) => {
    setDateRange(range);
    setLocalError(null);
  };

  const nextStep = () => {
    if (currentStep === 1 && !regionData) {
      setLocalError('Please select a region before proceeding');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateForm = () => {
    if (!regionData) {
      setLocalError('Please select a region');
      setCurrentStep(1);
      return false;
    }
    if (!dateRange) {
      setLocalError('Please select a date range');
      setCurrentStep(2);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLocalError(null);
      
      // Prepare the request data
      const requestData = {
        region_geojson: regionData,
        start_date: dateRange.startDate.toISOString(),
        end_date: dateRange.endDate.toISOString()
      };
      
      // Submit the analysis job using the context
      const newJob = await createJob(requestData);
      
      // Navigate to the job status page
      navigate(`/results/${newJob.id}`);
      
    } catch (err) {
      // Error is handled by the context, but we can show a local message too
      setLocalError('Failed to submit analysis. Please check the details and try again.');
    }
  };

  return (
    <div className="analysis-form-container">
      <div className="steps-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Region</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Select Date Range</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review & Submit</div>
        </div>
      </div>
      
      {(localError || jobError) && (
        <div className="error-alert">
          <AlertTriangle size={20} />
          <span>{localError || jobError}</span>
        </div>
      )}
      
      <div className="form-steps">
        {currentStep === 1 && (
          <div className="step-content">
            <RegionSelection onRegionSelected={handleRegionSelected} />
            <div className="step-navigation">
              <button 
                className="next-button primary-button"
                onClick={nextStep}
                disabled={!regionData}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="step-content">
            <DateSelection onDateRangeSelected={handleDateRangeSelected} />
            <div className="step-navigation">
              <button 
                className="back-button secondary-button"
                onClick={prevStep}
              >
                Back
              </button>
              <button 
                className="next-button primary-button"
                onClick={nextStep}
                disabled={!dateRange}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">Step 3: Review & Submit</h2>
            
            <div className="review-summary">
              <div className="review-section">
                <h3 className="font-medium">Selected Region</h3>
                <div className="review-data">
                  <p>Type: {regionData?.features?.[0]?.geometry?.type || 'Unknown'}</p>
                  <p>Number of points: {regionData?.features?.[0]?.geometry?.coordinates?.[0]?.length || 0}</p>
                </div>
              </div>
              
              <div className="review-section">
                <h3 className="font-medium">Selected Date Range</h3>
                <div className="review-data">
                  <p>Start Date: {dateRange?.startDate.toLocaleDateString()}</p>
                  <p>End Date: {dateRange?.endDate.toLocaleDateString()}</p>
                  <p>Duration: {dateRange ? Math.round((dateRange.endDate - dateRange.startDate) / (24 * 60 * 60 * 1000)) : 0} days</p>
                </div>
              </div>
              
              <div className="review-section">
                <h3 className="font-medium">Analysis Details</h3>
                <div className="review-data">
                  <p>This analysis will process satellite imagery and ancillary data for the selected region and time period to estimate soil organic carbon (SOC) and moisture.</p>
                  <p>Processing may take several minutes depending on the size of the region and date range.</p>
                </div>
              </div>
            </div>
            
            <div className="step-navigation">
              <button 
                className="back-button secondary-button"
                onClick={prevStep}
                disabled={jobLoading}
              >
                Back
              </button>
              <button 
                className="submit-button primary-button"
                onClick={handleSubmit}
                disabled={jobLoading}
              >
                {jobLoading ? <><RefreshCw className="animate-spin mr-2" size={16} /> Processing...</> : <><Send size={16} /> Submit Analysis</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisForm;
