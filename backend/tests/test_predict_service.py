import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import torch
import numpy as np

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.predict_service import load_model, predict_soc, predict_moisture, SoilCNN

class TestPredictService(unittest.TestCase):
    
    def test_soil_cnn_model_structure(self):
        # Test the CNN model structure
        model = SoilCNN(in_channels=7)
        
        # Check model layers
        self.assertIsInstance(model.conv1, torch.nn.Conv2d)
        self.assertEqual(model.conv1.in_channels, 7)
        self.assertEqual(model.conv1.out_channels, 16)
        self.assertEqual(model.conv1.kernel_size, (3, 3))
        
        self.assertIsInstance(model.relu, torch.nn.ReLU)
        
        self.assertIsInstance(model.conv2, torch.nn.Conv2d)
        self.assertEqual(model.conv2.in_channels, 16)
        self.assertEqual(model.conv2.out_channels, 1)
        self.assertEqual(model.conv2.kernel_size, (3, 3))
        
        # Test forward pass with dummy data
        dummy_input = torch.randn(1, 7, 10, 10)  # batch_size, channels, height, width
        output = model(dummy_input)
        
        # Check output shape
        self.assertEqual(output.shape, (1, 1, 10, 10))
    
    def test_load_model(self):
        # Test loading SOC model
        soc_model = load_model('dummy_path', model_type='soc')
        self.assertIsInstance(soc_model, SoilCNN)
        self.assertEqual(soc_model.conv1.in_channels, 7)
        
        # Test loading moisture model
        moisture_model = load_model('dummy_path', model_type='moisture')
        self.assertIsInstance(moisture_model, SoilCNN)
        self.assertEqual(moisture_model.conv1.in_channels, 7)
    
    @patch('app.services.predict_service.rasterio.open')
    @patch('app.services.predict_service.load_model')
    def test_predict_soc(self, mock_load_model, mock_rasterio_open):
        # Setup mocks
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = np.random.rand(7, 10, 10).astype(np.float32)  # 7 bands, 10x10 pixels
        mock_src.profile = {'count': 7, 'dtype': 'float32'}
        mock_rasterio_open.return_value = mock_src
        
        # Mock the model
        mock_model = MagicMock()
        mock_model.return_value = torch.ones((1, 1, 10, 10))  # Dummy prediction
        mock_load_model.return_value = mock_model
        
        # Call the function
        result_path, stats = predict_soc('feature_stack.tif')
        
        # Assertions
        self.assertIsNotNone(result_path)
        self.assertIsInstance(stats, dict)
        self.assertIn('min', stats)
        self.assertIn('max', stats)
        self.assertIn('mean', stats)
        self.assertIn('std', stats)
        mock_rasterio_open.assert_called_once_with('feature_stack.tif')
        mock_load_model.assert_called_once()
    
    @patch('app.services.predict_service.rasterio.open')
    @patch('app.services.predict_service.load_model')
    def test_predict_moisture(self, mock_load_model, mock_rasterio_open):
        # Setup mocks
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = np.random.rand(7, 10, 10).astype(np.float32)  # 7 bands, 10x10 pixels
        mock_src.profile = {'count': 7, 'dtype': 'float32'}
        mock_rasterio_open.return_value = mock_src
        
        # Mock the model
        mock_model = MagicMock()
        mock_model.return_value = torch.ones((1, 1, 10, 10))  # Dummy prediction
        mock_load_model.return_value = mock_model
        
        # Call the function
        result_path, stats = predict_moisture('feature_stack.tif')
        
        # Assertions
        self.assertIsNotNone(result_path)
        self.assertIsInstance(stats, dict)
        self.assertIn('min', stats)
        self.assertIn('max', stats)
        self.assertIn('mean', stats)
        self.assertIn('std', stats)
        mock_rasterio_open.assert_called_once_with('feature_stack.tif')
        mock_load_model.assert_called_once()

if __name__ == '__main__':
    unittest.main()
