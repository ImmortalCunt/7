from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.job import Job, JobCreate, JobResponse, JobStatus
from app.services.job_service import create_job, get_job_by_id, get_jobs, update_job_status
from app.core.celery_app import celery_app

router = APIRouter()

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_analysis_job(
    job_data: JobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create a new analysis job with the provided region and date range.
    """
    # Create job in database
    job = create_job(db=db, job_data=job_data)
    
    # Start Celery task
    task = celery_app.send_task(
        "app.tasks.task_full_analysis",
        kwargs={
            "job_id": job.id,
            "region_geojson": job_data.region_geojson,
            "start_date": job_data.start_date.isoformat(),
            "end_date": job_data.end_date.isoformat()
        }
    )
    
    # Update job with task_id
    job = update_job_status(
        db=db, 
        job_id=job.id, 
        status=JobStatus.QUEUED,
        task_id=task.id
    )
    
    return job

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Get job details by ID.
    """
    job = get_job_by_id(db=db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    return job

@router.get("/", response_model=List[JobResponse])
def list_jobs(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all jobs with optional filtering by status.
    """
    return get_jobs(db=db, skip=skip, limit=limit, status=status)
