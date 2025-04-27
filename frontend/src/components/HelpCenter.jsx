import React, { useState } from 'react';
import { HelpCircle, Book, Code, Database, Server, Globe } from 'lucide-react';

const HelpCenter = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="help-center-container">
      <h1 className="text-2xl font-bold mb-6">Help Center</h1>
      
      <div className="help-layout">
        <div className="help-sidebar">
          <div className="help-nav">
            <button 
              className={`help-nav-item ${activeSection === 'getting-started' ? 'active' : ''}`}
              onClick={() => handleSectionChange('getting-started')}
            >
              <Book size={18} />
              <span>Getting Started</span>
            </button>
            
            <button 
              className={`help-nav-item ${activeSection === 'data-sources' ? 'active' : ''}`}
              onClick={() => handleSectionChange('data-sources')}
            >
              <Database size={18} />
              <span>Data Sources</span>
            </button>
            
            <button 
              className={`help-nav-item ${activeSection === 'analysis' ? 'active' : ''}`}
              onClick={() => handleSectionChange('analysis')}
            >
              <Globe size={18} />
              <span>Running Analysis</span>
            </button>
            
            <button 
              className={`help-nav-item ${activeSection === 'technical' ? 'active' : ''}`}
              onClick={() => handleSectionChange('technical')}
            >
              <Code size={18} />
              <span>Technical Details</span>
            </button>
            
            <button 
              className={`help-nav-item ${activeSection === 'faq' ? 'active' : ''}`}
              onClick={() => handleSectionChange('faq')}
            >
              <HelpCircle size={18} />
              <span>FAQ</span>
            </button>
          </div>
        </div>
        
        <div className="help-content">
          {activeSection === 'getting-started' && (
            <div className="help-section">
              <h2 className="text-xl font-semibold mb-4">Getting Started with AgricarbonX</h2>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">What is AgricarbonX?</h3>
                <p>
                  AgricarbonX is an open-source web platform for estimating soil organic carbon (SOC) and 
                  moisture from satellite, soil, and weather data. It leverages Earth observation data and 
                  machine learning to provide scientific reports and interactive maps.
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Quick Start Guide</h3>
                <ol className="help-steps">
                  <li>
                    <strong>Create a new analysis:</strong> Click on "New Analysis" in the navigation menu.
                  </li>
                  <li>
                    <strong>Select a region:</strong> Draw a polygon on the map or upload a GeoJSON/Shapefile.
                  </li>
                  <li>
                    <strong>Choose a date range:</strong> Select the start and end dates for your analysis.
                  </li>
                  <li>
                    <strong>Submit and wait:</strong> The system will process your request and notify you when it's complete.
                  </li>
                  <li>
                    <strong>View results:</strong> Explore the interactive maps and charts, and download the detailed report.
                  </li>
                </ol>
              </div>
            </div>
          )}
          
          {activeSection === 'data-sources' && (
            <div className="help-section">
              <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Satellite Imagery</h3>
                <p>
                  AgricarbonX uses freely available satellite imagery from Sentinel-2 (10-20m resolution) 
                  and Landsat-8/9 (30m resolution). These provide multispectral data including visible, 
                  near-infrared, and shortwave infrared bands.
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Soil Data</h3>
                <p>
                  SoilGrids (250m resolution) provides global soil property maps including organic carbon 
                  content, bulk density, and texture at multiple depths. This data is used for baseline 
                  information and training the machine learning models.
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Climate Data</h3>
                <p>
                  Weather and climate data come from NASA POWER and NOAA CDO, providing temperature, 
                  precipitation, and solar radiation information. This helps account for seasonal 
                  variations in soil properties.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'analysis' && (
            <div className="help-section">
              <h2 className="text-xl font-semibold mb-4">Running Analysis</h2>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Region Selection Tips</h3>
                <ul className="help-list">
                  <li>Maximum area is limited to 1000 km² to ensure reasonable processing times.</li>
                  <li>For best results, select homogeneous areas (e.g., a single field or forest).</li>
                  <li>Avoid regions with significant water bodies or urban areas.</li>
                  <li>You can upload existing field boundaries as GeoJSON files.</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Date Range Selection</h3>
                <ul className="help-list">
                  <li>Select dates when vegetation is at its peak for best results.</li>
                  <li>Avoid periods with heavy cloud cover if possible.</li>
                  <li>Maximum date range is 1 year to ensure reasonable processing times.</li>
                  <li>Historical data is available from 2017 onwards (Sentinel-2 launch).</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Understanding Results</h3>
                <p>
                  The analysis produces maps of soil organic carbon (g/kg) and moisture (%) for your region. 
                  These are accompanied by statistics (min, max, mean) and distribution charts. The PDF report 
                  includes all this information plus methodology details and data citations.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'technical' && (
            <div className="help-section">
              <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Processing Pipeline</h3>
                <ol className="help-steps">
                  <li>
                    <strong>Data Ingestion:</strong> Download satellite imagery and ancillary data.
                  </li>
                  <li>
                    <strong>Preprocessing:</strong> Apply cloud masking, atmospheric correction, and compute spectral indices (NDVI, EVI, NDMI).
                  </li>
                  <li>
                    <strong>Feature Extraction:</strong> Create a feature stack from bands and indices.
                  </li>
                  <li>
                    <strong>ML Prediction:</strong> Apply trained models to predict SOC and moisture.
                  </li>
                  <li>
                    <strong>Visualization:</strong> Generate maps, charts, and reports.
                  </li>
                </ol>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Machine Learning Models</h3>
                <p>
                  AgricarbonX uses two types of models:
                </p>
                <ul className="help-list">
                  <li><strong>Random Forest:</strong> For pixel-wise prediction using spectral features.</li>
                  <li><strong>Convolutional Neural Network (CNN):</strong> For spatial context-aware prediction.</li>
                </ul>
                <p>
                  Models are trained on SoilGrids data as ground truth, with spectral bands and indices as features.
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">System Architecture</h3>
                <p>
                  AgricarbonX follows a service-oriented architecture:
                </p>
                <ul className="help-list">
                  <li><strong>Frontend:</strong> React with MapLibre GL for mapping.</li>
                  <li><strong>Backend:</strong> FastAPI with Celery for asynchronous processing.</li>
                  <li><strong>Database:</strong> PostgreSQL with PostGIS for spatial data.</li>
                  <li><strong>Storage:</strong> MinIO for S3-compatible object storage.</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeSection === 'faq' && (
            <div className="help-section">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">How accurate are the predictions?</h3>
                <p>
                  The accuracy varies by region and conditions. In general, SOC predictions have an R² of 
                  0.65-0.80 and RMSE of 5-15 g/kg when validated against field measurements. Moisture 
                  predictions have an R² of 0.60-0.75 and RMSE of 3-8%. The models perform best in 
                  agricultural areas with minimal cloud cover.
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">How long does processing take?</h3>
                <p>
                  Processing time depends on the size of your region and the date range. Typically:
                </p>
                <ul className="help-list">
                  <li>Small areas (< 10 km²): 2-5 minutes</li>
                  <li>Medium areas (10-100 km²): 5-15 minutes</li>
                  <li>Large areas (100-1000 km²): 15-60 minutes</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Can I use my own data?</h3>
                <p>
                  Currently, the platform uses pre-configured data sources. However, as an open-source 
                  project, you can fork the repository and modify it to use your own data sources or 
                  custom models. Contributions are welcome!
                </p>
              </div>
              
              <div className="help-card">
                <h3 className="font-medium mb-2">Is the code available?</h3>
                <p>
                  Yes, AgricarbonX is fully open-source under the MIT License. The code is available on 
                  GitHub, including the frontend, backend, ML models, and deployment configurations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
