import React, { createContext, useContext, useState, useEffect } from 'react';
import { regionsApi } from '../api';

// Create context
const RegionContext = createContext();

// Custom hook to use the region context
export const useRegions = () => useContext(RegionContext);

// Provider component
export const RegionProvider = ({ children }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await regionsApi.getRegions();
        setRegions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching regions:', err);
        setError('Failed to load regions. Please try again later.');
        setLoading(false);
      }
    };

    fetchRegions();
  }, [refreshTrigger]);

  // Create a new region
  const createRegion = async (regionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await regionsApi.createRegion(regionData);
      // Refresh the regions list
      setRefreshTrigger(prev => prev + 1);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error creating region:', err);
      setError(err.response?.data?.detail || 'Failed to create region. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  // Get a region by ID
  const getRegion = async (regionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await regionsApi.getRegion(regionId);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error(`Error fetching region ${regionId}:`, err);
      setError(`Failed to load region ${regionId}. Please try again later.`);
      setLoading(false);
      throw err;
    }
  };

  // Refresh regions list
  const refreshRegions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Context value
  const value = {
    regions,
    loading,
    error,
    createRegion,
    getRegion,
    refreshRegions
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};

export default RegionContext;
