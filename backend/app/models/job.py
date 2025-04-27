from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
import enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.db.session import Base

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default=JobStatus.PENDING)
    task_id = Column(String, nullable=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    region = relationship("Region", back_populates="jobs")
    result = relationship("Result", back_populates="job", uselist=False)

# Pydantic models for API
class JobBase(BaseModel):
    start_date: datetime
    end_date: datetime

class JobCreate(JobBase):
    region_geojson: Dict[str, Any]

class JobResponse(JobBase):
    id: int
    status: str
    task_id: Optional[str] = None
    region_id: int
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None
    
    class Config:
        orm_mode = True
