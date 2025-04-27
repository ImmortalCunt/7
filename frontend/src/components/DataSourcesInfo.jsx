import React, { useState } from 'react';
import { Info, HelpCircle, ExternalLink } from 'lucide-react';

const DataSourcesInfo = () => {
  const [activeTab, setActiveTab] = useState('satellite');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="data-sources-container">
      <h2 className="text-2xl font-bold mb-4">Data Sources</h2>
      
      <div className="data-tabs">
        <button 
          className={`data-tab ${activeTab === 'satellite' ? 'active' : ''}`}
          onClick={() => handleTabChange('satellite')}
        >
          Satellite Imagery
        </button>
        <button 
          className={`data-tab ${activeTab === 'soil' ? 'active' : ''}`}
          onClick={() => handleTabChange('soil')}
        >
          Soil Data
        </button>
        <button 
          className={`data-tab ${activeTab === 'climate' ? 'active' : ''}`}
          onClick={() => handleTabChange('climate')}
        >
          Climate Data
        </button>
      </div>
      
      <div className="data-content">
        {activeTab === 'satellite' && (
          <div className="data-section">
            <h3 className="text-xl font-semibold mb-3">Satellite Imagery</h3>
            
            <div className="data-card">
              <div className="data-card-header">
                <h4 className="font-medium">Sentinel-2 L2A</h4>
                <a href="https://registry.opendata.aws/sentinel-2/" target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mb-2">10-20 m optical imagery with atmospheric correction.</p>
              <ul className="data-details">
                <li>Global coverage every 5 days since 2017</li>
                <li>Includes built-in cloud mask (SCL)</li>
                <li>Bands: Blue, Green, Red, NIR, SWIR</li>
                <li>Provider: ESA Copernicus / AWS Open Data</li>
              </ul>
            </div>
            
            <div className="data-card">
              <div className="data-card-header">
                <h4 className="font-medium">Landsat 8/9 Collection 2 L2</h4>
                <a href="https://www.usgs.gov/landsat-missions" target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mb-2">30 m surface reflectance imagery.</p>
              <ul className="data-details">
                <li>Includes shortwave infrared bands</li>
                <li>Comes with CFMask QA band for cloud masking</li>
                <li>Bands: Blue, Green, Red, NIR, SWIR1, SWIR2, Thermal</li>
                <li>Provider: USGS / AWS</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'soil' && (
          <div className="data-section">
            <h3 className="text-xl font-semibold mb-3">Soil Data</h3>
            
            <div className="data-card">
              <div className="data-card-header">
                <h4 className="font-medium">SoilGrids</h4>
                <a href="https://soilgrids.org/" target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mb-2">Global 250 m gridded soil data by ISRIC.</p>
              <ul className="data-details">
                <li>Maps soil organic carbon content, bulk density, texture, etc.</li>
                <li>Available at multiple depths (0-5cm, 5-15cm, 15-30cm, etc.)</li>
                <li>Used for baseline SOC information and training labels</li>
                <li>Provider: ISRIC - World Soil Information</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'climate' && (
          <div className="data-section">
            <h3 className="text-xl font-semibold mb-3">Climate Data</h3>
            
            <div className="data-card">
              <div className="data-card-header">
                <h4 className="font-medium">NASA POWER</h4>
                <a href="https://power.larc.nasa.gov/" target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mb-2">Climate data API for any point.</p>
              <ul className="data-details">
                <li>Temperature, precipitation, solar radiation, etc.</li>
                <li>Daily or hourly time series available</li>
                <li>Global coverage</li>
                <li>Provider: NASA</li>
              </ul>
            </div>
            
            <div className="data-card">
              <div className="data-card-header">
                <h4 className="font-medium">NOAA CDO</h4>
                <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="mb-2">U.S. and global climate data via web services.</p>
              <ul className="data-details">
                <li>Precipitation, temperature from weather stations</li>
                <li>Historical climate data</li>
                <li>Provider: NOAA</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="data-disclaimer">
        <Info size={20} />
        <p>
          All data sources used in AgricarbonX are freely available and properly cited in analysis reports.
          For more information about data processing and methodology, please refer to the documentation.
        </p>
      </div>
    </div>
  );
};

export default DataSourcesInfo;
