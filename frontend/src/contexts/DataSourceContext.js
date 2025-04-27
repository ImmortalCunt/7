import React, { createContext, useContext, useState } from 'react';
import { dataSourcesApi } from '../api';

// Create context
const DataSourceContext = createContext();

// Custom hook to use the data source context
export const useDataSources = () => useContext(DataSourceContext);

// Provider component
export const DataSourceProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available satellite data
  const getAvailableSatelliteData = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataSourcesApi.getAvailableSatelliteData(params);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching satellite data:', err);
      setError('Failed to load satellite data. Please try again later.');
      setLoading(false);
      throw err;
    }
  };

  // Get available soil data
  const getAvailableSoilData = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataSourcesApi.getAvailableSoilData(params);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching soil data:', err);
      setError('Failed to load soil data. Please try again later.');
      setLoading(false);
      throw err;
    }
  };

  // Get available climate data
  const getAvailableClimateData = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataSourcesApi.getAvailableClimateData(params);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching climate data:', err);
      setError('Failed to load climate data. Please try again later.');
      setLoading(false);
      throw err;
    }
  };

  // Context value
  const value = {
    loading,
    error,
    getAvailableSatelliteData,
    getAvailableSoilData,
    getAvailableClimateData
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

export default DataSourceContext;
