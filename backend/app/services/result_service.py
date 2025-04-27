from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.result import Result, ResultCreate
from app.core.config import settings

def create_result(db: Session, result_data: Dict[str, Any]) -> Result:
    """
    Create a new result in the database.
    
    Args:
        db: Database session
        result_data: Result data
        
    Returns:
        Created result
    """
    # Create the result
    db_result = Result(
        job_id=result_data["job_id"],
        soc_map_path=result_data.get("soc_map_path"),
        moisture_map_path=result_data.get("moisture_map_path"),
        report_path=result_data.get("report_path"),
        soc_min=result_data.get("soc_min"),
        soc_max=result_data.get("soc_max"),
        soc_mean=result_data.get("soc_mean"),
        moisture_min=result_data.get("moisture_min"),
        moisture_max=result_data.get("moisture_max"),
        moisture_mean=result_data.get("moisture_mean")
    )
    
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    
    return db_result

def get_result_by_id(db: Session, result_id: int) -> Optional[Result]:
    """
    Get a result by ID.
    
    Args:
        db: Database session
        result_id: Result ID
        
    Returns:
        Result if found, None otherwise
    """
    return db.query(Result).filter(Result.id == result_id).first()

def get_result_by_job_id(db: Session, job_id: int) -> Optional[Result]:
    """
    Get a result by job ID.
    
    Args:
        db: Database session
        job_id: Job ID
        
    Returns:
        Result if found, None otherwise
    """
    return db.query(Result).filter(Result.job_id == job_id).first()

def get_results(db: Session, skip: int = 0, limit: int = 100) -> List[Result]:
    """
    Get a list of results.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of results
    """
    return db.query(Result).order_by(Result.created_at.desc()).offset(skip).limit(limit).all()
