from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from app.db.session import Base

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    geometry = Column(Geometry('POLYGON'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    jobs = relationship("Job", back_populates="region")

# Pydantic models for API
class RegionBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RegionCreate(RegionBase):
    geojson: Dict[str, Any]

class RegionResponse(RegionBase):
    id: int
    created_at: datetime
    geojson: Dict[str, Any]
    
    class Config:
        orm_mode = True
