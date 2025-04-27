#!/bin/bash
set -e

# Create extension in the database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
    CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
EOSQL

echo "PostGIS extensions have been created."

# Create schema and tables if they don't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create schema
    CREATE SCHEMA IF NOT EXISTS agricarbonx;
    
    -- Set search path
    SET search_path TO agricarbonx, public;
    
    -- Create tables if they don't exist
    CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        geom GEOMETRY(POLYGON, 4326) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        region_id INTEGER REFERENCES regions(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        task_id VARCHAR(255),
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id),
        soc_map_path VARCHAR(255),
        moisture_map_path VARCHAR(255),
        report_path VARCHAR(255),
        soc_min FLOAT,
        soc_max FLOAT,
        soc_mean FLOAT,
        soc_std FLOAT,
        moisture_min FLOAT,
        moisture_max FLOAT,
        moisture_mean FLOAT,
        moisture_std FLOAT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING GIST(geom);
    CREATE INDEX IF NOT EXISTS idx_jobs_region_id ON jobs(region_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_results_job_id ON results(job_id);
EOSQL

echo "Database schema and tables have been created."
