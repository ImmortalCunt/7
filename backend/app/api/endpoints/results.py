from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.result import Result, ResultResponse
from app.services.result_service import get_result_by_job_id, get_result_by_id
from app.core.minio import get_presigned_url

router = APIRouter()

@router.get("/{job_id}", response_model=ResultResponse)
def get_job_results(job_id: int, db: Session = Depends(get_db)):
    """
    Get results for a specific job.
    """
    result = get_result_by_job_id(db=db, job_id=job_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Results for job with ID {job_id} not found"
        )
    
    # Generate presigned URLs for result files
    if result.soc_map_path:
        result.soc_map_url = get_presigned_url(
            bucket_name="results",
            object_name=result.soc_map_path,
            expires=3600
        )
    
    if result.moisture_map_path:
        result.moisture_map_url = get_presigned_url(
            bucket_name="results",
            object_name=result.moisture_map_path,
            expires=3600
        )
    
    if result.report_path:
        result.report_url = get_presigned_url(
            bucket_name="reports",
            object_name=result.report_path,
            expires=3600
        )
    
    return result
