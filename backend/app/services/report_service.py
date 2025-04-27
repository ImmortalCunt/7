import os
import json
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as colors
from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import rasterio
from rasterio.plot import show
import jinja2
import pdfkit
from datetime import datetime
from app.core.config import settings
from app.core.minio import upload_file

def generate_map_image(raster_path, output_path, title, colormap='viridis', vmin=None, vmax=None):
    """
    Generate an image from a raster file.
    
    Args:
        raster_path: Path to the raster file
        output_path: Path to save the output image
        title: Title for the map
        colormap: Matplotlib colormap to use
        vmin: Minimum value for color scaling
        vmax: Maximum value for color scaling
        
    Returns:
        Path to the generated image
    """
    # Open the raster file
    with rasterio.open(raster_path) as src:
        # Read the data
        data = src.read(1)
        
        # Create a figure
        fig = Figure(figsize=(10, 8))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        
        # Set vmin and vmax if not provided
        if vmin is None:
            vmin = np.percentile(data, 2)  # 2nd percentile to avoid outliers
        if vmax is None:
            vmax = np.percentile(data, 98)  # 98th percentile to avoid outliers
        
        # Create a normalized colormap
        norm = colors.Normalize(vmin=vmin, vmax=vmax)
        
        # Plot the data
        im = ax.imshow(data, cmap=colormap, norm=norm)
        
        # Add colorbar
        cbar = fig.colorbar(im, ax=ax)
        
        # Add title
        ax.set_title(title)
        
        # Remove axes
        ax.set_axis_off()
        
        # Save the figure
        fig.savefig(output_path, bbox_inches='tight', dpi=150)
        
        return output_path

def generate_histogram(raster_path, output_path, title, bins=30, color='blue'):
    """
    Generate a histogram from a raster file.
    
    Args:
        raster_path: Path to the raster file
        output_path: Path to save the output image
        title: Title for the histogram
        bins: Number of bins for the histogram
        color: Color for the histogram bars
        
    Returns:
        Path to the generated image
    """
    # Open the raster file
    with rasterio.open(raster_path) as src:
        # Read the data
        data = src.read(1)
        
        # Flatten the data and remove NaN values
        data = data.flatten()
        data = data[~np.isnan(data)]
        
        # Create a figure
        fig = Figure(figsize=(10, 6))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        
        # Plot the histogram
        ax.hist(data, bins=bins, color=color, alpha=0.7)
        
        # Add title and labels
        ax.set_title(title)
        ax.set_xlabel('Value')
        ax.set_ylabel('Frequency')
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        # Save the figure
        fig.savefig(output_path, bbox_inches='tight', dpi=150)
        
        return output_path

def generate_report(job_id, soc_path, moisture_path, soc_stats, moisture_stats, region_geojson, start_date, end_date):
    """
    Generate a PDF report for the analysis results.
    
    Args:
        job_id: ID of the job
        soc_path: Path to the SOC prediction raster
        moisture_path: Path to the moisture prediction raster
        soc_stats: Statistics for the SOC prediction
        moisture_stats: Statistics for the moisture prediction
        region_geojson: GeoJSON representation of the region of interest
        start_date: Start date of the analysis period
        end_date: End date of the analysis period
        
    Returns:
        Path to the generated PDF report
    """
    # Create a directory for the report
    report_dir = f"data/reports/job_{job_id}"
    os.makedirs(report_dir, exist_ok=True)
    
    # Generate images for the report
    soc_map_img = generate_map_image(
        soc_path, 
        os.path.join(report_dir, "soc_map.png"),
        "Soil Organic Carbon (g/kg)",
        colormap='YlGn',
        vmin=soc_stats["min"],
        vmax=soc_stats["max"]
    )
    
    moisture_map_img = generate_map_image(
        moisture_path,
        os.path.join(report_dir, "moisture_map.png"),
        "Soil Moisture (%)",
        colormap='Blues',
        vmin=moisture_stats["min"],
        vmax=moisture_stats["max"]
    )
    
    soc_hist_img = generate_histogram(
        soc_path,
        os.path.join(report_dir, "soc_histogram.png"),
        "Distribution of Soil Organic Carbon",
        color='green'
    )
    
    moisture_hist_img = generate_histogram(
        moisture_path,
        os.path.join(report_dir, "moisture_histogram.png"),
        "Distribution of Soil Moisture",
        color='blue'
    )
    
    # Convert dates to readable format
    start_date_obj = datetime.fromisoformat(start_date)
    end_date_obj = datetime.fromisoformat(end_date)
    start_date_str = start_date_obj.strftime("%B %d, %Y")
    end_date_str = end_date_obj.strftime("%B %d, %Y")
    
    # Get region name if available
    region_name = region_geojson.get("properties", {}).get("name", "Selected Region")
    
    # Create a context for the template
    context = {
        "job_id": job_id,
        "region_name": region_name,
        "start_date": start_date_str,
        "end_date": end_date_str,
        "soc_stats": soc_stats,
        "moisture_stats": moisture_stats,
        "generation_date": datetime.now().strftime("%B %d, %Y"),
        "data_sources": [
            {
                "name": "Sentinel-2 L2A",
                "description": "10-20 m optical imagery with atmospheric correction",
                "provider": "ESA Copernicus / AWS Open Data",
                "url": "https://registry.opendata.aws/sentinel-2/"
            },
            {
                "name": "SoilGrids",
                "description": "Global 250 m gridded soil data",
                "provider": "ISRIC",
                "url": "https://soilgrids.org/"
            },
            {
                "name": "NASA POWER",
                "description": "Climate data API (temperature, precipitation, solar, etc.)",
                "provider": "NASA",
                "url": "https://power.larc.nasa.gov/"
            }
        ],
        "model_info": {
            "type": "Convolutional Neural Network",
            "description": "A lightweight CNN model trained on spectral bands and indices",
            "features": "Red, Green, Blue, NIR bands + NDVI, EVI, NDMI indices",
            "training_data": "SoilGrids SOC and moisture data"
        }
    }
    
    # Create a Jinja2 environment
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader("app/templates"),
        autoescape=jinja2.select_autoescape(['html', 'xml'])
    )
    
    # Get the template
    template = env.get_template("report_template.html")
    
    # Render the template
    html_content = template.render(**context)
    
    # Write the HTML file
    html_path = os.path.join(report_dir, f"report_job_{job_id}.html")
    with open(html_path, "w") as f:
        f.write(html_content)
    
    # Convert HTML to PDF
    pdf_path = os.path.join(report_dir, f"report_job_{job_id}.pdf")
    pdfkit.from_file(html_path, pdf_path)
    
    # Upload the PDF to MinIO
    object_name = f"reports/job_{job_id}/report.pdf"
    upload_success = upload_file(
        bucket_name=settings.BUCKET_REPORTS,
        object_name=object_name,
        file_path=pdf_path
    )
    
    if upload_success:
        return object_name
    else:
        return None
