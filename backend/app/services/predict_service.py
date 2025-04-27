import os
import torch
import numpy as np
import rasterio
from datetime import datetime
from app.core.config import settings

class SoilCNN(torch.nn.Module):
    """
    A simple CNN model for soil property prediction.
    
    This is a lightweight CNN that takes a stack of spectral bands and indices
    as input and outputs predicted soil organic carbon (SOC).
    """
    def __init__(self, in_channels=7):
        super().__init__()
        self.conv1 = torch.nn.Conv2d(in_channels=in_channels, out_channels=16, kernel_size=3, padding=1)
        self.relu = torch.nn.ReLU()
        self.conv2 = torch.nn.Conv2d(in_channels=16, out_channels=1, kernel_size=3, padding=1)
        
    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.conv2(x)
        return x

def load_model(model_path, model_type="soc"):
    """
    Load a pre-trained model for soil property prediction.
    
    Args:
        model_path: Path to the model file
        model_type: Type of model ("soc" or "moisture")
        
    Returns:
        Loaded model
    """
    # In a real implementation, we would load the model from the provided path
    # For the MVP, we create a new model with random weights
    
    if model_type == "soc":
        model = SoilCNN(in_channels=7)  # 4 bands + 3 indices
    else:  # moisture
        model = SoilCNN(in_channels=7)  # 4 bands + 3 indices
    
    # In a real implementation, we would load the weights from the model file
    # model = torch.jit.load(model_path)
    
    return model

def predict_soc(feature_stack_path, model_path=None):
    """
    Predict soil organic carbon (SOC) from a feature stack.
    
    Args:
        feature_stack_path: Path to the feature stack
        model_path: Path to the pre-trained model (optional)
        
    Returns:
        Path to the predicted SOC map
    """
    # Load the feature stack
    with rasterio.open(feature_stack_path) as src:
        feature_stack = src.read()
        profile = src.profile
    
    # Load the model
    if model_path is None:
        model_path = settings.SOC_MODEL_PATH
    
    model = load_model(model_path, model_type="soc")
    
    # Convert the feature stack to a PyTorch tensor
    # Normalize the data (in a real implementation, we would use the same normalization as during training)
    feature_stack = feature_stack.astype(np.float32) / 10000.0  # Simple normalization
    
    # Add batch dimension
    feature_stack = np.expand_dims(feature_stack, axis=0)
    
    # Convert to PyTorch tensor
    feature_tensor = torch.from_numpy(feature_stack)
    
    # Make prediction
    with torch.no_grad():
        prediction = model(feature_tensor)
    
    # Convert prediction to numpy array
    soc_map = prediction.numpy()[0, 0]  # Remove batch and channel dimensions
    
    # Scale the prediction to realistic SOC values (g/kg)
    # In a real implementation, this would be based on the model's training
    soc_map = soc_map * 50.0 + 50.0  # Scale to range [0, 100] g/kg
    
    # Create output path
    output_dir = os.path.dirname(feature_stack_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"soc_prediction_{timestamp}.tif")
    
    # Update the profile for the output
    profile.update(count=1, dtype=rasterio.float32)
    
    # Write the prediction
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(soc_map.astype(np.float32), 1)
    
    # Calculate statistics
    soc_stats = {
        "min": float(np.min(soc_map)),
        "max": float(np.max(soc_map)),
        "mean": float(np.mean(soc_map)),
        "std": float(np.std(soc_map))
    }
    
    return output_path, soc_stats

def predict_moisture(feature_stack_path, model_path=None):
    """
    Predict soil moisture from a feature stack.
    
    Args:
        feature_stack_path: Path to the feature stack
        model_path: Path to the pre-trained model (optional)
        
    Returns:
        Path to the predicted moisture map
    """
    # Load the feature stack
    with rasterio.open(feature_stack_path) as src:
        feature_stack = src.read()
        profile = src.profile
    
    # Load the model
    if model_path is None:
        model_path = settings.MOISTURE_MODEL_PATH
    
    model = load_model(model_path, model_type="moisture")
    
    # Convert the feature stack to a PyTorch tensor
    # Normalize the data (in a real implementation, we would use the same normalization as during training)
    feature_stack = feature_stack.astype(np.float32) / 10000.0  # Simple normalization
    
    # Add batch dimension
    feature_stack = np.expand_dims(feature_stack, axis=0)
    
    # Convert to PyTorch tensor
    feature_tensor = torch.from_numpy(feature_stack)
    
    # Make prediction
    with torch.no_grad():
        prediction = model(feature_tensor)
    
    # Convert prediction to numpy array
    moisture_map = prediction.numpy()[0, 0]  # Remove batch and channel dimensions
    
    # Scale the prediction to realistic moisture values (%)
    # In a real implementation, this would be based on the model's training
    moisture_map = moisture_map * 25.0 + 25.0  # Scale to range [0, 50] %
    
    # Create output path
    output_dir = os.path.dirname(feature_stack_path)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"moisture_prediction_{timestamp}.tif")
    
    # Update the profile for the output
    profile.update(count=1, dtype=rasterio.float32)
    
    # Write the prediction
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(moisture_map.astype(np.float32), 1)
    
    # Calculate statistics
    moisture_stats = {
        "min": float(np.min(moisture_map)),
        "max": float(np.max(moisture_map)),
        "mean": float(np.mean(moisture_map)),
        "std": float(np.std(moisture_map))
    }
    
    return output_path, moisture_stats
