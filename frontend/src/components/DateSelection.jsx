import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

const DateSelection = ({ onDateRangeSelected }) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Default to 30 days ago
  const [endDate, setEndDate] = useState(new Date()); // Default to today
  const [error, setError] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setError(null);
    validateDateRange(date, endDate);
    
    if (onDateRangeSelected && !error) {
      onDateRangeSelected({ startDate: date, endDate });
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setError(null);
    validateDateRange(startDate, date);
    
    if (onDateRangeSelected && !error) {
      onDateRangeSelected({ startDate, endDate: date });
    }
  };

  const validateDateRange = (start, end) => {
    // Check if end date is after start date
    if (end < start) {
      setError('End date must be after start date');
      return false;
    }

    // Check if date range is not too long (e.g., max 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (end - start > oneYear) {
      setError('Date range cannot exceed 1 year');
      return false;
    }

    // Check if start date is not too old (e.g., max 5 years ago)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    if (start < fiveYearsAgo) {
      setError('Start date cannot be more than 5 years ago');
      return false;
    }

    // Check if end date is not in the future
    if (end > new Date()) {
      setError('End date cannot be in the future');
      return false;
    }

    return true;
  };

  return (
    <div className="date-selection-container">
      <h2 className="text-xl font-semibold mb-4">Step 2: Select Date Range</h2>
      
      <p className="mb-4">
        Select the start and end dates for your analysis. This will determine the time period
        for which satellite imagery and climate data will be analyzed.
      </p>
      
      <div className="date-pickers flex flex-col md:flex-row md:space-x-6">
        <div className="date-picker-container mb-4 md:mb-0">
          <label className="block mb-2 font-medium">Start Date</label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              className="date-input"
            />
            <Calendar className="date-icon" size={20} />
          </div>
        </div>
        
        <div className="date-picker-container">
          <label className="block mb-2 font-medium">End Date</label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="date-input"
            />
            <Calendar className="date-icon" size={20} />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-message mt-2">
          {error}
        </div>
      )}
      
      <div className="date-info mt-4 p-4 border rounded">
        <h3 className="font-semibold">Selected Date Range</h3>
        <p>Start: {startDate.toLocaleDateString()}</p>
        <p>End: {endDate.toLocaleDateString()}</p>
        <p>Duration: {Math.round((endDate - startDate) / (24 * 60 * 60 * 1000))} days</p>
      </div>
    </div>
  );
};

export default DateSelection;
