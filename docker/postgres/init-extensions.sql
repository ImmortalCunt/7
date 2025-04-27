-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Set search path
SET search_path TO agricarbonx, public;

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING GIST(geom);

-- Create additional functions for spatial analysis
CREATE OR REPLACE FUNCTION agricarbonx.calculate_area(geom geometry)
RETURNS float AS $$
BEGIN
    RETURN ST_Area(geom::geography) / 10000; -- Convert to hectares
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate centroid
CREATE OR REPLACE FUNCTION agricarbonx.calculate_centroid(geom geometry)
RETURNS geometry AS $$
BEGIN
    RETURN ST_Centroid(geom);
END;
$$ LANGUAGE plpgsql;

-- Create view for region statistics
CREATE OR REPLACE VIEW agricarbonx.region_stats AS
SELECT 
    r.id,
    r.name,
    agricarbonx.calculate_area(r.geom) AS area_hectares,
    ST_AsGeoJSON(agricarbonx.calculate_centroid(r.geom)) AS centroid,
    COUNT(j.id) AS job_count,
    MAX(j.created_at) AS last_job_date
FROM 
    agricarbonx.regions r
LEFT JOIN 
    agricarbonx.jobs j ON r.id = j.region_id
GROUP BY 
    r.id, r.name, r.geom;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA agricarbonx TO agricarbonx;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA agricarbonx TO agricarbonx;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA agricarbonx TO agricarbonx;
