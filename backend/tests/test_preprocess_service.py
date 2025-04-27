import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.preprocess_service import apply_cloud_mask, compute_indices, reproject_and_clip, create_feature_stack

class TestPreprocessService(unittest.TestCase):
    
    @patch('app.services.preprocess_service.rasterio.open')
    def test_apply_cloud_mask_sentinel(self, mock_rasterio_open):
        # Setup mock for rasterio.open context manager
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_src.profile = {'count': 4, 'dtype': 'uint16'}
        mock_rasterio_open.return_value = mock_src
        
        # Call the function
        result = apply_cloud_mask('test_image.tif', is_sentinel=True)
        
        # Assertions
        self.assertIsNotNone(result)
        mock_rasterio_open.assert_called_once_with('test_image.tif')
        mock_src.read.assert_called_once()
        
    @patch('app.services.preprocess_service.rasterio.open')
    def test_apply_cloud_mask_landsat(self, mock_rasterio_open):
        # Setup mock for rasterio.open context manager
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_src.profile = {'count': 7, 'dtype': 'uint16'}
        mock_rasterio_open.return_value = mock_src
        
        # Call the function
        result = apply_cloud_mask('test_image.tif', is_sentinel=False)
        
        # Assertions
        self.assertIsNotNone(result)
        mock_rasterio_open.assert_called_once_with('test_image.tif')
        mock_src.read.assert_called_once()
    
    @patch('app.services.preprocess_service.rasterio.open')
    def test_compute_indices(self, mock_rasterio_open):
        # Setup mock for rasterio.open context manager
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_src.profile = {'count': 4, 'dtype': 'uint16'}
        mock_rasterio_open.return_value = mock_src
        
        # Call the function
        result = compute_indices('test_image.tif', is_sentinel=True)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertIn('ndvi', result)
        self.assertIn('evi', result)
        self.assertIn('ndmi', result)
        mock_rasterio_open.assert_called_once_with('test_image.tif')
        
    @patch('app.services.preprocess_service.mask')
    @patch('app.services.preprocess_service.rasterio.open')
    def test_reproject_and_clip(self, mock_rasterio_open, mock_mask):
        # Setup mocks
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.profile = {'count': 4, 'dtype': 'uint16'}
        mock_rasterio_open.return_value = mock_src
        
        mock_mask.return_value = (MagicMock(), MagicMock())  # (out_image, out_transform)
        
        # Mock GeoJSON
        region_geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
            }
        }
        
        # Call the function
        result = reproject_and_clip('test_image.tif', region_geojson)
        
        # Assertions
        self.assertIsNotNone(result)
        mock_rasterio_open.assert_called_once_with('test_image.tif')
        mock_mask.assert_called_once()
        
    @patch('app.services.preprocess_service.rasterio.open')
    def test_create_feature_stack(self, mock_rasterio_open):
        # Setup mock for rasterio.open context manager
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_src.profile = {'count': 1, 'dtype': 'float32'}
        mock_rasterio_open.return_value = mock_src
        
        # Mock inputs
        image_paths = ['image1.tif']
        indices_paths = {
            'ndvi': 'ndvi.tif',
            'evi': 'evi.tif',
            'ndmi': 'ndmi.tif'
        }
        region_geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
            }
        }
        
        # Call the function
        result = create_feature_stack(image_paths, indices_paths, region_geojson)
        
        # Assertions
        self.assertIsNotNone(result)
        # Should open each file (1 image + 3 indices = 4 calls)
        self.assertEqual(mock_rasterio_open.call_count, 4)

if __name__ == '__main__':
    unittest.main()
