from fastapi import APIRouter

router = APIRouter()

# Import and include all route modules
from app.api.endpoints import jobs, regions, results

router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(regions.router, prefix="/regions", tags=["regions"])
router.include_router(results.router, prefix="/results", tags=["results"])
