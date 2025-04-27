import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.report_service import generate_map_image, generate_histogram, generate_report

class TestReportService(unittest.TestCase):
    
    @patch('app.services.report_service.rasterio.open')
    @patch('app.services.report_service.FigureCanvas')
    @patch('app.services.report_service.Figure')
    def test_generate_map_image(self, mock_figure, mock_canvas, mock_rasterio_open):
        # Setup mocks
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_rasterio_open.return_value = mock_src
        
        mock_fig_instance = MagicMock()
        mock_figure.return_value = mock_fig_instance
        
        # Call the function
        result = generate_map_image('raster.tif', 'output.png', 'Test Map')
        
        # Assertions
        self.assertEqual(result, 'output.png')
        mock_rasterio_open.assert_called_once_with('raster.tif')
        mock_figure.assert_called_once()
        mock_fig_instance.savefig.assert_called_once()

    @patch('app.services.report_service.rasterio.open')
    @patch('app.services.report_service.FigureCanvas')
    @patch('app.services.report_service.Figure')
    def test_generate_histogram(self, mock_figure, mock_canvas, mock_rasterio_open):
        # Setup mocks
        mock_src = MagicMock()
        mock_src.__enter__.return_value = mock_src
        mock_src.read.return_value = MagicMock()  # Mock data array
        mock_rasterio_open.return_value = mock_src
        
        mock_fig_instance = MagicMock()
        mock_figure.return_value = mock_fig_instance
        
        # Call the function
        result = generate_histogram('raster.tif', 'output_hist.png', 'Test Histogram')
        
        # Assertions
        self.assertEqual(result, 'output_hist.png')
        mock_rasterio_open.assert_called_once_with('raster.tif')
        mock_figure.assert_called_once()
        mock_fig_instance.savefig.assert_called_once()

    @patch('app.services.report_service.generate_map_image')
    @patch('app.services.report_service.generate_histogram')
    @patch('app.services.report_service.jinja2.Environment')
    @patch('app.services.report_service.pdfkit.from_file')
    @patch('app.services.report_service.upload_file')
    @patch('app.services.report_service.os.makedirs')
    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    def test_generate_report(self, mock_open, mock_makedirs, mock_upload_file, mock_pdfkit, mock_jinja_env, mock_gen_hist, mock_gen_map):
        # Setup mocks
        mock_gen_map.side_effect = ['soc_map.png', 'moisture_map.png']
        mock_gen_hist.side_effect = ['soc_hist.png', 'moisture_hist.png']
        
        mock_template = MagicMock()
        mock_template.render.return_value = '<html></html>'
        mock_env_instance = MagicMock()
        mock_env_instance.get_template.return_value = mock_template
        mock_jinja_env.return_value = mock_env_instance
        
        mock_upload_file.return_value = True
        
        # Mock inputs
        job_id = 1
        soc_path = 'soc.tif'
        moisture_path = 'moisture.tif'
        soc_stats = {'min': 10, 'max': 50, 'mean': 30, 'std': 5}
        moisture_stats = {'min': 5, 'max': 25, 'mean': 15, 'std': 3}
        region_geojson = {'properties': {'name': 'Test Region'}}
        start_date = '2023-01-01T00:00:00'
        end_date = '2023-01-31T00:00:00'
        
        # Call the function
        result = generate_report(job_id, soc_path, moisture_path, soc_stats, moisture_stats, region_geojson, start_date, end_date)
        
        # Assertions
        self.assertIsNotNone(result)
        self.assertTrue(result.startswith('reports/job_1/report.pdf'))
        self.assertEqual(mock_gen_map.call_count, 2)
        self.assertEqual(mock_gen_hist.call_count, 2)
        mock_jinja_env.assert_called_once()
        mock_template.render.assert_called_once()
        mock_pdfkit.assert_called_once()
        mock_upload_file.assert_called_once()

if __name__ == '__main__':
    unittest.main()
