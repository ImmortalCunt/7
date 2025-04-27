import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { AlertTriangle, RefreshCw, Download, Layers, Eye, EyeOff } from 'lucide-react';

// Component to handle map view updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const AdvancedMapView = ({ initialRegion = null, readOnly = false, onRegionSelect = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [layers, setLayers] = useState({
    soc: true,
    moisture: false,
    satellite: true
  });

  useEffect(() => {
    // If an initial region is provided, center the map on it
    if (initialRegion) {
      try {
        const coordinates = initialRegion.features[0].geometry.coordinates[0];
        // Calculate center of polygon
        const lats = coordinates.map(coord => coord[1]);
        const lngs = coordinates.map(coord => coord[0]);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        
        setMapCenter([centerLat, centerLng]);
        setMapZoom(10); // Adjust zoom level based on region size
      } catch (err) {
        console.error('Error parsing initial region:', err);
      }
    }
    
    // If in read-only mode, fetch results
    if (readOnly) {
      fetchResults();
    }
  }, [initialRegion, readOnly]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch results from the API
      // For now, we'll simulate a response
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            name: 'SOC Map',
            type: 'soc',
            url: '/mock-soc-map.png',
            geojson: initialRegion
          },
          {
            id: 2,
            name: 'Moisture Map',
            type: 'moisture',
            url: '/mock-moisture-map.png',
            geojson: initialRegion
          }
        ];
        
        setResults(mockResults);
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load map data. Please try again later.');
      setLoading(false);
    }
  };

  const handleRegionDraw = (e) => {
    if (onRegionSelect) {
      // Convert the drawn shape to GeoJSON
      const drawnLayer = e.layer;
      const geoJson = drawnLayer.toGeoJSON();
      onRegionSelect(geoJson);
    }
  };

  const toggleLayer = (layer) => {
    setLayers({
      ...layers,
      [layer]: !layers[layer]
    });
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);
  };

  const handleDownload = (result) => {
    // In a real implementation, this would download the result
    alert(`Downloading ${result.name}`);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <RefreshCw className="animate-spin" size={48} />
        <p>Loading map data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <AlertTriangle size={48} className="text-red-500" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="advanced-map-container">
      <div className="map-controls">
        <div className="layer-toggles">
          <button 
            className={`layer-toggle ${layers.soc ? 'active' : ''}`}
            onClick={() => toggleLayer('soc')}
            title="Toggle SOC Layer"
          >
            {layers.soc ? <Eye size={16} /> : <EyeOff size={16} />} SOC
          </button>
          <button 
            className={`layer-toggle ${layers.moisture ? 'active' : ''}`}
            onClick={() => toggleLayer('moisture')}
            title="Toggle Moisture Layer"
          >
            {layers.moisture ? <Eye size={16} /> : <EyeOff size={16} />} Moisture
          </button>
          <button 
            className={`layer-toggle ${layers.satellite ? 'active' : ''}`}
            onClick={() => toggleLayer('satellite')}
            title="Toggle Satellite Layer"
          >
            {layers.satellite ? <Eye size={16} /> : <EyeOff size={16} />} Satellite
          </button>
        </div>
      </div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {/* Base map layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Satellite layer */}
        {layers.satellite && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        )}
        
        {/* Initial region or results */}
        {initialRegion && (
          <GeoJSON 
            data={initialRegion}
            style={{
              color: '#22c55e',
              weight: 2,
              opacity: 0.7,
              fillOpacity: 0.2
            }}
          />
        )}
        
        {/* Result layers */}
        {readOnly && results.map(result => (
          (result.type === 'soc' && layers.soc) || (result.type === 'moisture' && layers.moisture) ? (
            <GeoJSON 
              key={result.id}
              data={result.geojson}
              style={{
                color: result.type === 'soc' ? '#22c55e' : '#0ea5e9',
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.4
              }}
              eventHandlers={{
                click: () => handleResultClick(result)
              }}
            />
          ) : null
        ))}
        
        {/* Popup for selected result */}
        {selectedResult && (
          <Popup
            position={mapCenter}
            onClose={() => setSelectedResult(null)}
          >
            <div className="result-popup">
              <h3>{selectedResult.name}</h3>
              <img 
                src={selectedResult.url} 
                alt={selectedResult.name} 
                className="popup-image"
              />
              <button 
                className="download-btn"
                onClick={() => handleDownload(selectedResult)}
              >
                <Download size={16} /> Download
              </button>
            </div>
          </Popup>
        )}
      </MapContainer>
      
      {!readOnly && (
        <div className="map-instructions">
          <h3>Instructions:</h3>
          <p>Use the drawing tools to define your region of interest.</p>
          <p>Click points to create a polygon, and double-click to finish.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedMapView;
