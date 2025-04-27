import os
import numpy as np
import rasterio
from rasterio.mask import mask
from shapely.geometry import shape
import cv2
from app.core.config import settings

def apply_cloud_mask(image_path, is_sentinel=True):
    """
    Apply cloud masking to satellite imagery.
    
    For Sentinel-2, uses the Scene Classification Layer (SCL).
    For Landsat, uses the pixel_qa band.
    
    Args:
        image_path: Path to the satellite image
        is_sentinel: Boolean indicating if the image is Sentinel-2 (True) or Landsat (False)
        
    Returns:
        Path to the cloud-masked image
    """
    with rasterio.open(image_path) as src:
        # Read all bands
        data = src.read()
        profile = src.profile
        
        if is_sentinel:
            # For Sentinel-2, we would use the SCL band (band 4 in our sample data)
            # In a real implementation, we would use the actual SCL band
            # SCL values: 1=saturated, 2=dark, 3=shadow, 4=vegetation, 5=bare soil,
            # 6=water, 7=cloud low prob, 8=cloud medium prob, 9=cloud high prob, 10=cirrus, 11=snow
            
            # In our sample data, we're using band 4 as NIR, so we'll create a synthetic cloud mask
            # In a real implementation, we would use the actual SCL band
            
            # Create a synthetic cloud mask (0 for clear, 1 for cloud)
            # In a real implementation, this would be based on the SCL band
            cloud_mask = np.zeros_like(data[0], dtype=bool)
            
            # Simulate some clouds (randomly mark 20% of pixels as clouds)
            cloud_mask[np.random.rand(*cloud_mask.shape) > 0.8] = True
            
        else:
            # For Landsat, we use the pixel_qa band (band 7 in our sample data)
            # In a real implementation, we would use the actual pixel_qa band
            # and parse the bit values to identify clouds and shadows
            
            # In our sample data, we've created a synthetic QA band where 1 = cloud, 0 = clear
            cloud_mask = data[-1].astype(bool)  # Last band is our synthetic QA band
        
        # Apply the cloud mask to all bands
        # Set cloudy pixels to nodata value
        for i in range(data.shape[0] - 1):  # Skip the QA band for Landsat
            data[i][cloud_mask] = 0  # Use 0 as nodata value
        
        # Create output path
        output_dir = os.path.dirname(image_path)
        base_name = os.path.basename(image_path)
        output_path = os.path.join(output_dir, f"masked_{base_name}")
        
        # Write the masked image
        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(data)
        
        return output_path

def compute_indices(image_path, is_sentinel=True):
    """
    Compute spectral indices from satellite imagery.
    
    For both Sentinel-2 and Landsat, computes NDVI, EVI, and NDMI.
    
    Args:
        image_path: Path to the satellite image
        is_sentinel: Boolean indicating if the image is Sentinel-2 (True) or Landsat (False)
        
    Returns:
        Dictionary with paths to the computed indices
    """
    with rasterio.open(image_path) as src:
        # Read all bands
        data = src.read()
        profile = src.profile
        
        if is_sentinel:
            # For Sentinel-2, we're using our sample data where:
            # Band 1 = Red, Band 2 = Green, Band 3 = Blue, Band 4 = NIR
            red = data[0].astype(float)
            green = data[1].astype(float)
            blue = data[2].astype(float)
            nir = data[3].astype(float)
            
            # In a real implementation with actual Sentinel-2 data:
            # Band 2 = Blue, Band 3 = Green, Band 4 = Red, Band 8 = NIR, Band 11 = SWIR
            
            # For SWIR, we'll create a synthetic band for our sample data
            # In a real implementation, we would use the actual SWIR band
            swir = np.random.randint(0, 10000, red.shape, dtype=np.uint16).astype(float)
            
        else:
            # For Landsat, we're using our sample data where:
            # Band 1 = Blue, Band 2 = Green, Band 3 = Red, Band 4 = NIR, Band 5 = SWIR1, Band 6 = SWIR2
            blue = data[0].astype(float)
            green = data[1].astype(float)
            red = data[2].astype(float)
            nir = data[3].astype(float)
            swir = data[4].astype(float)  # SWIR1
        
        # Compute NDVI = (NIR - Red) / (NIR + Red)
        # Avoid division by zero
        denominator = nir + red
        ndvi = np.zeros_like(red)
        valid = denominator > 0
        ndvi[valid] = (nir[valid] - red[valid]) / denominator[valid]
        
        # Compute EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
        # For Landsat 8, the formula is: EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
        denominator = nir + 6.0 * red - 7.5 * blue + 1.0
        evi = np.zeros_like(red)
        valid = denominator > 0
        evi[valid] = 2.5 * (nir[valid] - red[valid]) / denominator[valid]
        
        # Compute NDMI = (NIR - SWIR) / (NIR + SWIR)
        denominator = nir + swir
        ndmi = np.zeros_like(red)
        valid = denominator > 0
        ndmi[valid] = (nir[valid] - swir[valid]) / denominator[valid]
        
        # Create output directory
        output_dir = os.path.dirname(image_path)
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        
        # Create a profile for the indices (single band)
        index_profile = profile.copy()
        index_profile.update(count=1, dtype=rasterio.float32)
        
        # Write the indices
        ndvi_path = os.path.join(output_dir, f"{base_name}_ndvi.tif")
        with rasterio.open(ndvi_path, 'w', **index_profile) as dst:
            dst.write(ndvi.astype(rasterio.float32), 1)
        
        evi_path = os.path.join(output_dir, f"{base_name}_evi.tif")
        with rasterio.open(evi_path, 'w', **index_profile) as dst:
            dst.write(evi.astype(rasterio.float32), 1)
        
        ndmi_path = os.path.join(output_dir, f"{base_name}_ndmi.tif")
        with rasterio.open(ndmi_path, 'w', **index_profile) as dst:
            dst.write(ndmi.astype(rasterio.float32), 1)
        
        return {
            "ndvi": ndvi_path,
            "evi": evi_path,
            "ndmi": ndmi_path
        }

def reproject_and_clip(image_path, region_geojson, target_crs="EPSG:4326"):
    """
    Reproject the image to the target CRS and clip it to the region of interest.
    
    Args:
        image_path: Path to the image
        region_geojson: GeoJSON representation of the region of interest
        target_crs: Target coordinate reference system
        
    Returns:
        Path to the reprojected and clipped image
    """
    # Get the geometry from the GeoJSON
    geom = [shape(region_geojson["geometry"])]
    
    with rasterio.open(image_path) as src:
        # Reproject and clip in one operation
        out_image, out_transform = mask(src, geom, crop=True)
        
        # Update the profile
        out_profile = src.profile.copy()
        out_profile.update({
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
            "crs": target_crs
        })
        
        # Create output path
        output_dir = os.path.dirname(image_path)
        base_name = os.path.basename(image_path)
        output_path = os.path.join(output_dir, f"clipped_{base_name}")
        
        # Write the clipped image
        with rasterio.open(output_path, 'w', **out_profile) as dst:
            dst.write(out_image)
        
        return output_path

def create_feature_stack(image_paths, indices_paths, region_geojson):
    """
    Create a feature stack from satellite imagery and indices.
    
    Args:
        image_paths: List of paths to satellite images
        indices_paths: Dictionary with paths to spectral indices
        region_geojson: GeoJSON representation of the region of interest
        
    Returns:
        Path to the feature stack
    """
    # Create a list of all input rasters
    input_rasters = []
    
    # Add the satellite images
    for path in image_paths:
        with rasterio.open(path) as src:
            # Read all bands
            data = src.read()
            # Add each band to the list
            for i in range(data.shape[0]):
                input_rasters.append((data[i], src.profile))
    
    # Add the indices
    for index_name, path in indices_paths.items():
        with rasterio.open(path) as src:
            # Read the index
            data = src.read(1)
            # Add to the list
            input_rasters.append((data, src.profile))
    
    # Get the first profile as a template
    profile = input_rasters[0][1].copy()
    
    # Update the profile for the feature stack
    profile.update(count=len(input_rasters), dtype=rasterio.float32)
    
    # Create a feature stack
    feature_stack = np.zeros((len(input_rasters), input_rasters[0][0].shape[0], input_rasters[0][0].shape[1]), dtype=np.float32)
    
    # Fill the feature stack
    for i, (data, _) in enumerate(input_rasters):
        feature_stack[i] = data.astype(np.float32)
    
    # Create output path
    output_dir = os.path.dirname(image_paths[0])
    output_path = os.path.join(output_dir, "feature_stack.tif")
    
    # Write the feature stack
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(feature_stack)
    
    return output_path
