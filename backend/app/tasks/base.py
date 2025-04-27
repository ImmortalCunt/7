from celery import Task
from app.db.session import SessionLocal
from app.models.job import Job, JobStatus
from app.services.job_service import update_job_status

class BaseTask(Task):
    """Base Celery Task with database session handling and job status updates"""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Handler called on task success"""
        if 'job_id' in kwargs:
            self._update_job_status(kwargs['job_id'], JobStatus.COMPLETED)
        return super().on_success(retval, task_id, args, kwargs)
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handler called on task failure"""
        if 'job_id' in kwargs:
            self._update_job_status(
                kwargs['job_id'], 
                JobStatus.FAILED, 
                error_message=str(exc)
            )
        return super().on_failure(exc, task_id, args, kwargs, einfo)
    
    def _update_job_status(self, job_id, status, error_message=None):
        """Update job status in database"""
        db = SessionLocal()
        try:
            update_job_status(
                db=db,
                job_id=job_id,
                status=status,
                error_message=error_message
            )
        finally:
            db.close()
