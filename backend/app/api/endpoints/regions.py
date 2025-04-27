from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.region import Region, RegionCreate, RegionResponse
from app.services.region_service import create_region, get_region_by_id, get_regions

router = APIRouter()

@router.post("/", response_model=RegionResponse, status_code=status.HTTP_201_CREATED)
def create_new_region(
    region_data: RegionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new region with the provided GeoJSON.
    """
    return create_region(db=db, region_data=region_data)

@router.get("/{region_id}", response_model=RegionResponse)
def get_region(region_id: int, db: Session = Depends(get_db)):
    """
    Get region details by ID.
    """
    region = get_region_by_id(db=db, region_id=region_id)
    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Region with ID {region_id} not found"
        )
    return region

@router.get("/", response_model=List[RegionResponse])
def list_regions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    List all regions.
    """
    return get_regions(db=db, skip=skip, limit=limit)
