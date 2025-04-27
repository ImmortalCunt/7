import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MapView = ({ onRegionSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(3);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (zoom buttons)
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add drawing tools
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });
    map.current.addControl(draw.current, 'top-left');

    // Update coordinates as user moves around the map
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    // Handle draw events
    map.current.on('draw.create', updateArea);
    map.current.on('draw.update', updateArea);
    map.current.on('draw.delete', updateArea);

    return () => {
      map.current.remove();
    };
  }, []);

  // Function to handle area updates
  const updateArea = (e) => {
    const data = draw.current.getAll();
    if (data.features.length > 0 && onRegionSelect) {
      // Pass the GeoJSON to the parent component
      onRegionSelect(data);
    }
  };

  return (
    <div className="map-container">
      <div className="map-info">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-view" />
      <div className="map-instructions">
        <h3>Instructions:</h3>
        <p>Use the polygon tool to draw your region of interest.</p>
        <p>Click points to create a polygon, and double-click to finish.</p>
        <p>Use the trash tool to delete and start over.</p>
        <p>Maximum area: 1000 km²</p>
      </div>
    </div>
  );
};

export default MapView;
