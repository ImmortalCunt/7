import React, { useState } from 'react';
import MapView from './MapView';
import { Upload, FileUp } from 'lucide-react';

const RegionSelection = ({ onRegionSelected }) => {
  const [selectedMethod, setSelectedMethod] = useState('draw');
  const [selectedFile, setSelectedFile] = useState(null);
  const [regionData, setRegionData] = useState(null);
  const [error, setError] = useState(null);

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null);

    if (file) {
      // Check file type
      if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json') && !file.name.endsWith('.shp')) {
        setError('Please upload a GeoJSON or Shapefile');
        return;
      }

      // For GeoJSON files, we can parse them directly
      if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const geojson = JSON.parse(e.target.result);
            setRegionData(geojson);
            if (onRegionSelected) {
              onRegionSelected(geojson);
            }
          } catch (error) {
            setError('Invalid GeoJSON file');
          }
        };
        reader.readAsText(file);
      } else {
        // For Shapefiles, we would need a server-side conversion
        // In a real implementation, we would upload the file to the server
        setError('Shapefile support requires server-side processing');
      }
    }
  };

  const handleRegionSelect = (data) => {
    setRegionData(data);
    if (onRegionSelected) {
      onRegionSelected(data);
    }
  };

  return (
    <div className="region-selection-container">
      <h2 className="text-xl font-semibold mb-4">Step 1: Select Region of Interest</h2>
      
      <div className="method-selector mb-4">
        <div className="flex space-x-4">
          <button 
            className={`method-button ${selectedMethod === 'draw' ? 'active' : ''}`}
            onClick={() => handleMethodChange('draw')}
          >
            Draw on Map
          </button>
          <button 
            className={`method-button ${selectedMethod === 'upload' ? 'active' : ''}`}
            onClick={() => handleMethodChange('upload')}
          >
            Upload File
          </button>
        </div>
      </div>
      
      {selectedMethod === 'draw' ? (
        <div className="draw-container">
          <p className="mb-4">Draw a polygon on the map to define your region of interest.</p>
          <MapView onRegionSelect={handleRegionSelect} />
        </div>
      ) : (
        <div className="upload-container">
          <p className="mb-4">Upload a GeoJSON or Shapefile containing your region of interest.</p>
          
          <div className="file-upload-area">
            <label className="file-upload-label">
              <input 
                type="file" 
                accept=".geojson,.json,.shp" 
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="upload-placeholder">
                <FileUp size={48} className="mb-2" />
                <span>{selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}</span>
                <span className="text-sm text-gray-500">GeoJSON or Shapefile</span>
              </div>
            </label>
          </div>
          
          {error && (
            <div className="error-message mt-2">
              {error}
            </div>
          )}
        </div>
      )}
      
      {regionData && (
        <div className="region-info mt-4 p-4 border rounded">
          <h3 className="font-semibold">Selected Region</h3>
          <p>Type: {regionData.features?.[0]?.geometry?.type || 'Unknown'}</p>
          <p>Number of points: {regionData.features?.[0]?.geometry?.coordinates?.[0]?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default RegionSelection;
