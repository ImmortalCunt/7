import os
import json
import torch
import numpy as np
from datetime import datetime
from app.core.celery_app import celery_app
from app.tasks.base import BaseTask
from app.db.session import SessionLocal
from app.models.job import JobStatus
from app.services.job_service import update_job_status
from app.services.result_service import create_result
from app.core.minio import upload_file
from app.core.config import settings

@celery_app.task(base=BaseTask, name="app.tasks.task_full_analysis")
def task_full_analysis(job_id, region_geojson, start_date, end_date):
    """
    Main task that orchestrates the full analysis pipeline:
    1. Data ingestion
    2. Preprocessing
    3. ML prediction
    4. Report generation
    """
    db = SessionLocal()
    try:
        # Update job status to processing
        update_job_status(db=db, job_id=job_id, status=JobStatus.PROCESSING)
        
        # Step 1: Data ingestion
        satellite_data = task_ingest.delay(
            job_id=job_id,
            region_geojson=region_geojson,
            start_date=start_date,
            end_date=end_date
        ).get()
        
        # Step 2: Preprocessing
        processed_data = task_preprocess.delay(
            job_id=job_id,
            satellite_data=satellite_data
        ).get()
        
        # Step 3: ML prediction
        prediction_results = task_predict.delay(
            job_id=job_id,
            processed_data=processed_data
        ).get()
        
        # Step 4: Report generation
        report_path = task_generate_report.delay(
            job_id=job_id,
            prediction_results=prediction_results,
            region_geojson=region_geojson,
            start_date=start_date,
            end_date=end_date
        ).get()
        
        # Create result record
        create_result(
            db=db,
            result_data={
                "job_id": job_id,
                "soc_map_path": prediction_results["soc_map_path"],
                "moisture_map_path": prediction_results["moisture_map_path"],
                "report_path": report_path,
                "soc_min": prediction_results["soc_stats"]["min"],
                "soc_max": prediction_results["soc_stats"]["max"],
                "soc_mean": prediction_results["soc_stats"]["mean"],
                "moisture_min": prediction_results["moisture_stats"]["min"],
                "moisture_max": prediction_results["moisture_stats"]["max"],
                "moisture_mean": prediction_results["moisture_stats"]["mean"]
            }
        )
        
        return {"status": "success", "job_id": job_id}
    
    except Exception as e:
        # Update job status to failed
        update_job_status(
            db=db, 
            job_id=job_id, 
            status=JobStatus.FAILED,
            error_message=str(e)
        )
        raise
    finally:
        db.close()
