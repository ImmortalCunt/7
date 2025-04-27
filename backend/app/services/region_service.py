from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.region import Region, RegionCreate
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape
import json
import geopandas as gpd

def create_region(db: Session, region_data: RegionCreate) -> Region:
    """
    Create a new region in the database.
    
    Args:
        db: Database session
        region_data: Region data from request
        
    Returns:
        Created region
    """
    # Extract properties if available
    properties = region_data.geojson.get("properties", {})
    name = properties.get("name", region_data.name) if region_data.name is None else region_data.name
    description = properties.get("description", region_data.description) if region_data.description is None else region_data.description
    
    # Convert GeoJSON to WKT
    geom = shape(region_data.geojson["geometry"])
    
    # Create the region
    db_region = Region(
        name=name,
        description=description,
        geometry=from_shape(geom, srid=4326)
    )
    
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    
    return db_region

def get_region_by_id(db: Session, region_id: int) -> Optional[Region]:
    """
    Get a region by ID.
    
    Args:
        db: Database session
        region_id: Region ID
        
    Returns:
        Region if found, None otherwise
    """
    return db.query(Region).filter(Region.id == region_id).first()

def get_regions(db: Session, skip: int = 0, limit: int = 100) -> List[Region]:
    """
    Get a list of regions.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of regions
    """
    return db.query(Region).order_by(Region.created_at.desc()).offset(skip).limit(limit).all()

def region_to_geojson(region: Region) -> dict:
    """
    Convert a region to GeoJSON.
    
    Args:
        region: Region to convert
        
    Returns:
        GeoJSON representation of the region
    """
    # Convert WKB to shapely geometry
    geom = to_shape(region.geometry)
    
    # Convert to GeoJSON
    geojson = {
        "type": "Feature",
        "geometry": json.loads(geom.wkt),
        "properties": {
            "id": region.id,
            "name": region.name,
            "description": region.description,
            "created_at": region.created_at.isoformat() if region.created_at else None
        }
    }
    
    return geojson
