from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

from app.db.session import Base

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), unique=True)
    soc_map_path = Column(String, nullable=True)
    moisture_map_path = Column(String, nullable=True)
    report_path = Column(String, nullable=True)
    soc_min = Column(Float, nullable=True)
    soc_max = Column(Float, nullable=True)
    soc_mean = Column(Float, nullable=True)
    moisture_min = Column(Float, nullable=True)
    moisture_max = Column(Float, nullable=True)
    moisture_mean = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="result")

# Pydantic models for API
class ResultBase(BaseModel):
    job_id: int
    soc_map_path: Optional[str] = None
    moisture_map_path: Optional[str] = None
    report_path: Optional[str] = None
    soc_min: Optional[float] = None
    soc_max: Optional[float] = None
    soc_mean: Optional[float] = None
    moisture_min: Optional[float] = None
    moisture_max: Optional[float] = None
    moisture_mean: Optional[float] = None

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase):
    id: int
    created_at: datetime
    soc_map_url: Optional[str] = None
    moisture_map_url: Optional[str] = None
    report_url: Optional[str] = None
    
    class Config:
        orm_mode = True
