import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Calendar, BarChart2, FileText } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="text-4xl font-bold mb-4">AgricarbonX</h1>
          <p className="text-xl mb-6">
            Open-source soil property estimation platform using satellite, soil, and weather data
          </p>
          <Link to="/new" className="cta-button">
            Start New Analysis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Layers size={32} />
            </div>
            <h3 className="feature-title">Multi-Source Data</h3>
            <p className="feature-description">
              Leverages Sentinel-2, Landsat-8/9, SoilGrids, and climate data for comprehensive analysis
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <Calendar size={32} />
            </div>
            <h3 className="feature-title">Temporal Analysis</h3>
            <p className="feature-description">
              Select custom date ranges to analyze soil properties over time
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <BarChart2 size={32} />
            </div>
            <h3 className="feature-title">Interactive Visualization</h3>
            <p className="feature-description">
              Explore results with interactive maps and charts for better insights
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FileText size={32} />
            </div>
            <h3 className="feature-title">Detailed Reports</h3>
            <p className="feature-description">
              Generate comprehensive PDF reports with maps, statistics, and methodology
            </p>
          </div>
        </div>
      </section>
      
      <section className="workflow-section">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        
        <div className="workflow-steps">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h3 className="step-title">Select Region</h3>
            <p className="step-description">
              Draw a polygon on the map or upload a GeoJSON/Shapefile to define your region of interest
            </p>
          </div>
          
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h3 className="step-title">Choose Date Range</h3>
            <p className="step-description">
              Select the time period for which you want to analyze soil properties
            </p>
          </div>
          
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h3 className="step-title">Process Data</h3>
            <p className="step-description">
              Our system automatically processes satellite imagery and applies ML models
            </p>
          </div>
          
          <div className="workflow-step">
            <div className="step-number">4</div>
            <h3 className="step-title">Explore Results</h3>
            <p className="step-description">
              View interactive maps, charts, and download detailed reports
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link to="/new" className="cta-button-secondary">
            Try It Now
          </Link>
        </div>
      </section>
      
      <section className="about-section">
        <h2 className="text-2xl font-bold mb-4">About AgricarbonX</h2>
        <p className="mb-4">
          AgricarbonX is an open-source platform designed to help researchers, farmers, and environmental scientists
          estimate soil organic carbon (SOC) and moisture using remote sensing data.
        </p>
        <p className="mb-4">
          Our platform leverages open Earth observation data (Sentinel-2, Landsat-8/9) and ancillary datasets
          (SoilGrids soil properties, NOAA/NASA climate data) to provide scientific reports and interactive maps.
        </p>
        <p>
          All code is modular, well-documented, and containerized with Docker Compose. The platform emphasizes
          scientific transparency: all data sources are cited and model metadata is included in outputs.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
