from celery import Celery
from app.core.config import settings
from app.tasks.base import BaseTask
from app.services.ingest_service import download_sentinel_data, download_landsat_data, download_soilgrids_data, download_weather_data
from app.services.preprocess_service import apply_cloud_mask, compute_indices, reproject_and_clip, create_feature_stack
from app.services.predict_service import predict_soc, predict_moisture
from app.services.report_service import generate_report

# Initialize Celery
celery_app = Celery(
    "worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.task_routes = {
    "app.tasks.worker.*": {"queue": "main-queue"}
}

@celery_app.task(base=BaseTask, name="app.tasks.worker.task_ingest")
def task_ingest(job_id, region_geojson, start_date, end_date):
    """
    Task to ingest satellite imagery and ancillary data.
    
    Args:
        job_id: Job ID
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date for the search (ISO format string)
        end_date: End date for the search (ISO format string)
        
    Returns:
        Dictionary with paths to downloaded data
    """
    # Download Sentinel-2 data
    sentinel_paths = download_sentinel_data(region_geojson, start_date, end_date)
    
    # Download Landsat data
    landsat_paths = download_landsat_data(region_geojson, start_date, end_date)
    
    # Download SoilGrids data
    soilgrids_path = download_soilgrids_data(region_geojson)
    
    # Download weather data
    weather_path = download_weather_data(region_geojson, start_date, end_date)
    
    return {
        "sentinel_paths": sentinel_paths,
        "landsat_paths": landsat_paths,
        "soilgrids_path": soilgrids_path,
        "weather_path": weather_path
    }

@celery_app.task(base=BaseTask, name="app.tasks.worker.task_preprocess")
def task_preprocess(job_id, satellite_data):
    """
    Task to preprocess satellite imagery.
    
    Args:
        job_id: Job ID
        satellite_data: Dictionary with paths to satellite data
        
    Returns:
        Dictionary with paths to preprocessed data
    """
    # Apply cloud masking to Sentinel-2 data
    masked_sentinel_paths = []
    for path in satellite_data["sentinel_paths"]:
        masked_path = apply_cloud_mask(path, is_sentinel=True)
        masked_sentinel_paths.append(masked_path)
    
    # Apply cloud masking to Landsat data
    masked_landsat_paths = []
    for path in satellite_data["landsat_paths"]:
        masked_path = apply_cloud_mask(path, is_sentinel=False)
        masked_landsat_paths.append(masked_path)
    
    # Compute indices for Sentinel-2 data
    sentinel_indices = {}
    for path in masked_sentinel_paths:
        indices = compute_indices(path, is_sentinel=True)
        sentinel_indices[path] = indices
    
    # Compute indices for Landsat data
    landsat_indices = {}
    for path in masked_landsat_paths:
        indices = compute_indices(path, is_sentinel=False)
        landsat_indices[path] = indices
    
    # Create a feature stack
    # For simplicity, we'll use the first Sentinel-2 image and its indices
    sentinel_path = masked_sentinel_paths[0]
    indices_paths = sentinel_indices[sentinel_path]
    
    # Create a feature stack
    feature_stack_path = create_feature_stack(
        [sentinel_path],
        indices_paths,
        satellite_data["region_geojson"]
    )
    
    return {
        "feature_stack_path": feature_stack_path,
        "masked_sentinel_paths": masked_sentinel_paths,
        "masked_landsat_paths": masked_landsat_paths,
        "sentinel_indices": sentinel_indices,
        "landsat_indices": landsat_indices
    }

@celery_app.task(base=BaseTask, name="app.tasks.worker.task_predict")
def task_predict(job_id, processed_data):
    """
    Task to predict soil properties.
    
    Args:
        job_id: Job ID
        processed_data: Dictionary with paths to preprocessed data
        
    Returns:
        Dictionary with paths to prediction results
    """
    # Predict SOC
    soc_path, soc_stats = predict_soc(processed_data["feature_stack_path"])
    
    # Predict moisture
    moisture_path, moisture_stats = predict_moisture(processed_data["feature_stack_path"])
    
    return {
        "soc_map_path": soc_path,
        "moisture_map_path": moisture_path,
        "soc_stats": soc_stats,
        "moisture_stats": moisture_stats
    }

@celery_app.task(base=BaseTask, name="app.tasks.worker.task_generate_report")
def task_generate_report(job_id, prediction_results, region_geojson, start_date, end_date):
    """
    Task to generate a report.
    
    Args:
        job_id: Job ID
        prediction_results: Dictionary with paths to prediction results
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date for the analysis (ISO format string)
        end_date: End date for the analysis (ISO format string)
        
    Returns:
        Path to the generated report
    """
    # Generate a report
    report_path = generate_report(
        job_id,
        prediction_results["soc_map_path"],
        prediction_results["moisture_map_path"],
        prediction_results["soc_stats"],
        prediction_results["moisture_stats"],
        region_geojson,
        start_date,
        end_date
    )
    
    return report_path
