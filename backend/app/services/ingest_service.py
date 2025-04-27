import os
import rasterio
import numpy as np
from datetime import datetime
from shapely.geometry import shape
import geopandas as gpd
from app.core.config import settings

def download_sentinel_data(region_geojson, start_date, end_date):
    """
    Download Sentinel-2 L2A scenes for the given region and date range.
    
    In a real implementation, this would connect to ESA Copernicus or AWS Open Data.
    For the MVP, we simulate this by loading sample data.
    
    Args:
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date for the search (ISO format string)
        end_date: End date for the search (ISO format string)
        
    Returns:
        List of paths to downloaded scenes
    """
    # Convert dates from string to datetime objects
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    
    # In a real implementation, we would:
    # 1. Convert the GeoJSON to a bounding box or WKT
    # 2. Query the Sentinel API for available scenes
    # 3. Filter by cloud cover, etc.
    # 4. Download the scenes
    
    # For the MVP, we simulate this by returning paths to sample data
    # In a real implementation, these would be downloaded to a cache directory
    
    # Create a directory for sample data if it doesn't exist
    os.makedirs("data/sample", exist_ok=True)
    
    # Create a simple simulated Sentinel-2 scene with basic bands
    # In a real implementation, we would download actual Sentinel-2 data
    
    # Create a simple GeoTIFF with 4 bands (Red, Green, Blue, NIR)
    # The size is determined by the region's bounding box
    
    # Get the bounding box of the region
    geom = shape(region_geojson["geometry"])
    gdf = gpd.GeoDataFrame(geometry=[geom], crs="EPSG:4326")
    minx, miny, maxx, maxy = gdf.total_bounds
    
    # Create a simple 100x100 raster with 4 bands
    width, height = 100, 100
    
    # Create a transform from the bounding box
    transform = rasterio.transform.from_bounds(minx, miny, maxx, maxy, width, height)
    
    # Create sample data for each band
    # In a real implementation, these would be actual Sentinel-2 bands
    red_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    green_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    blue_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    nir_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    
    # Stack the bands
    data = np.stack([red_band, green_band, blue_band, nir_band])
    
    # Create a GeoTIFF
    output_path = f"data/sample/sentinel2_sample_{start_dt.strftime('%Y%m%d')}.tif"
    
    with rasterio.open(
        output_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=4,
        dtype=np.uint16,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        dst.write(data)
    
    # Return the path to the sample data
    return [output_path]

def download_landsat_data(region_geojson, start_date, end_date):
    """
    Download Landsat 8/9 L2 scenes for the given region and date range.
    
    In a real implementation, this would connect to USGS EarthExplorer or AWS.
    For the MVP, we simulate this by loading sample data.
    
    Args:
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date for the search (ISO format string)
        end_date: End date for the search (ISO format string)
        
    Returns:
        List of paths to downloaded scenes
    """
    # Similar to Sentinel-2, but for Landsat
    # For the MVP, we simulate this by returning paths to sample data
    
    # Create a directory for sample data if it doesn't exist
    os.makedirs("data/sample", exist_ok=True)
    
    # Convert dates from string to datetime objects
    start_dt = datetime.fromisoformat(start_date)
    
    # Get the bounding box of the region
    geom = shape(region_geojson["geometry"])
    gdf = gpd.GeoDataFrame(geometry=[geom], crs="EPSG:4326")
    minx, miny, maxx, maxy = gdf.total_bounds
    
    # Create a simple 100x100 raster with 6 bands (including SWIR)
    width, height = 100, 100
    
    # Create a transform from the bounding box
    transform = rasterio.transform.from_bounds(minx, miny, maxx, maxy, width, height)
    
    # Create sample data for each band
    # In a real implementation, these would be actual Landsat bands
    blue_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    green_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    red_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    nir_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    swir1_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    swir2_band = np.random.randint(0, 10000, (height, width), dtype=np.uint16)
    
    # Create a QA band for cloud masking
    qa_band = np.zeros((height, width), dtype=np.uint16)
    # Simulate some clouds (value 1 for cloud, 0 for clear)
    qa_band[np.random.rand(height, width) > 0.8] = 1
    
    # Stack the bands
    data = np.stack([blue_band, green_band, red_band, nir_band, swir1_band, swir2_band, qa_band])
    
    # Create a GeoTIFF
    output_path = f"data/sample/landsat_sample_{start_dt.strftime('%Y%m%d')}.tif"
    
    with rasterio.open(
        output_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=7,
        dtype=np.uint16,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        dst.write(data)
    
    # Return the path to the sample data
    return [output_path]

def download_soilgrids_data(region_geojson):
    """
    Download SoilGrids data for the given region.
    
    In a real implementation, this would connect to the SoilGrids API.
    For the MVP, we simulate this by loading sample data.
    
    Args:
        region_geojson: GeoJSON representation of the region of interest
        
    Returns:
        Path to downloaded SoilGrids data
    """
    # Create a directory for sample data if it doesn't exist
    os.makedirs("data/sample", exist_ok=True)
    
    # Get the bounding box of the region
    geom = shape(region_geojson["geometry"])
    gdf = gpd.GeoDataFrame(geometry=[geom], crs="EPSG:4326")
    minx, miny, maxx, maxy = gdf.total_bounds
    
    # Create a simple 100x100 raster with 1 band (SOC)
    width, height = 100, 100
    
    # Create a transform from the bounding box
    transform = rasterio.transform.from_bounds(minx, miny, maxx, maxy, width, height)
    
    # Create sample data for SOC
    # In a real implementation, this would be actual SoilGrids data
    # SOC values typically range from 0 to 150 g/kg
    soc_band = np.random.randint(0, 150, (height, width), dtype=np.uint8)
    
    # Create a GeoTIFF
    output_path = "data/sample/soilgrids_soc_sample.tif"
    
    with rasterio.open(
        output_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=1,
        dtype=np.uint8,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        dst.write(soc_band, 1)
    
    # Return the path to the sample data
    return output_path

def download_weather_data(region_geojson, start_date, end_date):
    """
    Download weather data for the given region and date range.
    
    In a real implementation, this would connect to NASA POWER or NOAA CDO.
    For the MVP, we simulate this by generating sample data.
    
    Args:
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date for the search (ISO format string)
        end_date: End date for the search (ISO format string)
        
    Returns:
        Path to downloaded weather data
    """
    # Create a directory for sample data if it doesn't exist
    os.makedirs("data/sample", exist_ok=True)
    
    # Convert dates from string to datetime objects
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    
    # Calculate the number of days in the date range
    days = (end_dt - start_dt).days + 1
    
    # Get the centroid of the region for point-based weather data
    geom = shape(region_geojson["geometry"])
    centroid = geom.centroid
    
    # Create sample weather data
    # In a real implementation, this would be actual weather data from NASA POWER or NOAA CDO
    dates = [start_dt + datetime.timedelta(days=i) for i in range(days)]
    temperatures = np.random.uniform(15, 30, days)  # Temperature in Celsius
    precipitation = np.random.uniform(0, 10, days)  # Precipitation in mm
    solar_radiation = np.random.uniform(10, 25, days)  # Solar radiation in MJ/m²
    
    # Create a CSV file with the weather data
    output_path = "data/sample/weather_sample.csv"
    
    with open(output_path, "w") as f:
        f.write("date,temperature,precipitation,solar_radiation\n")
        for i in range(days):
            f.write(f"{dates[i].strftime('%Y-%m-%d')},{temperatures[i]:.2f},{precipitation[i]:.2f},{solar_radiation[i]:.2f}\n")
    
    # Return the path to the sample data
    return output_path
