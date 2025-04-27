from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.job import Job, JobCreate, JobStatus
from app.models.region import Region, RegionCreate
from datetime import datetime
import json
import geopandas as gpd
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

def create_job(db: Session, job_data: JobCreate) -> Job:
    """
    Create a new job in the database.
    
    Args:
        db: Database session
        job_data: Job data from request
        
    Returns:
        Created job
    """
    # First, create or get the region
    region = create_region_from_geojson(db, job_data.region_geojson)
    
    # Create the job
    db_job = Job(
        region_id=region.id,
        start_date=job_data.start_date,
        end_date=job_data.end_date,
        status=JobStatus.PENDING
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return db_job

def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
    """
    Get a job by ID.
    
    Args:
        db: Database session
        job_id: Job ID
        
    Returns:
        Job if found, None otherwise
    """
    return db.query(Job).filter(Job.id == job_id).first()

def get_jobs(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Job]:
    """
    Get a list of jobs with optional filtering by status.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Optional status filter
        
    Returns:
        List of jobs
    """
    query = db.query(Job)
    
    if status:
        query = query.filter(Job.status == status)
    
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

def update_job_status(db: Session, job_id: int, status: str, task_id: Optional[str] = None, error_message: Optional[str] = None) -> Job:
    """
    Update the status of a job.
    
    Args:
        db: Database session
        job_id: Job ID
        status: New status
        task_id: Optional Celery task ID
        error_message: Optional error message
        
    Returns:
        Updated job
    """
    job = get_job_by_id(db, job_id)
    
    if job:
        job.status = status
        job.updated_at = datetime.utcnow()
        
        if task_id:
            job.task_id = task_id
            
        if error_message:
            job.error_message = error_message
        
        db.commit()
        db.refresh(job)
    
    return job

def create_region_from_geojson(db: Session, geojson: dict) -> Region:
    """
    Create a region from GeoJSON.
    
    Args:
        db: Database session
        geojson: GeoJSON representation of the region
        
    Returns:
        Created region
    """
    # Extract properties if available
    properties = geojson.get("properties", {})
    name = properties.get("name", "Unnamed Region")
    description = properties.get("description", None)
    
    # Convert GeoJSON to WKT
    geom = shape(geojson["geometry"])
    
    # Check if region already exists with the same geometry
    # This is a simplified check - in a real application, you might want to use
    # spatial queries to check for similar geometries
    
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
