import unittest
from unittest.mock import patch, MagicMock
import sys
import os
from datetime import datetime

# Add the parent directory to the path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.job_service import create_job, get_job_by_id, get_jobs, update_job_status, create_region_from_geojson

class TestJobService(unittest.TestCase):
    
    @patch('app.services.job_service.create_region_from_geojson')
    def test_create_job(self, mock_create_region):
        # Setup mocks
        mock_db = MagicMock()
        mock_region = MagicMock()
        mock_region.id = 1
        mock_create_region.return_value = mock_region
        
        # Mock job data
        job_data = MagicMock()
        job_data.region_geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
            }
        }
        job_data.start_date = "2023-01-01T00:00:00"
        job_data.end_date = "2023-01-31T00:00:00"
        
        # Call the function
        result = create_job(mock_db, job_data)
        
        # Assertions
        self.assertIsNotNone(result)
        mock_create_region.assert_called_once_with(mock_db, job_data.region_geojson)
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    def test_get_job_by_id(self):
        # Setup mocks
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_job = MagicMock()
        mock_filter.first.return_value = mock_job
        
        # Call the function
        result = get_job_by_id(mock_db, 1)
        
        # Assertions
        self.assertEqual(result, mock_job)
        mock_db.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
    
    def test_get_jobs(self):
        # Setup mocks
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_order_by = MagicMock()
        mock_query.order_by.return_value = mock_order_by
        mock_offset = MagicMock()
        mock_order_by.offset.return_value = mock_offset
        mock_limit = MagicMock()
        mock_offset.limit.return_value = mock_limit
        mock_jobs = [MagicMock(), MagicMock()]
        mock_limit.all.return_value = mock_jobs
        
        # Call the function
        result = get_jobs(mock_db)
        
        # Assertions
        self.assertEqual(result, mock_jobs)
        mock_db.query.assert_called_once()
        mock_query.order_by.assert_called_once()
        mock_order_by.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)
        mock_limit.all.assert_called_once()
    
    def test_get_jobs_with_status_filter(self):
        # Setup mocks
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_db.query.return_value = mock_query
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_order_by = MagicMock()
        mock_filter.order_by.return_value = mock_order_by
        mock_offset = MagicMock()
        mock_order_by.offset.return_value = mock_offset
        mock_limit = MagicMock()
        mock_offset.limit.return_value = mock_limit
        mock_jobs = [MagicMock()]
        mock_limit.all.return_value = mock_jobs
        
        # Call the function
        result = get_jobs(mock_db, status='completed')
        
        # Assertions
        self.assertEqual(result, mock_jobs)
        mock_db.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_filter.order_by.assert_called_once()
        mock_order_by.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)
        mock_limit.all.assert_called_once()
    
    @patch('app.services.job_service.get_job_by_id')
    @patch('app.services.job_service.datetime')
    def test_update_job_status(self, mock_datetime, mock_get_job):
        # Setup mocks
        mock_db = MagicMock()
        mock_job = MagicMock()
        mock_get_job.return_value = mock_job
        mock_now = datetime(2023, 1, 1, 12, 0, 0)
        mock_datetime.utcnow.return_value = mock_now
        
        # Call the function
        result = update_job_status(mock_db, 1, 'completed', task_id='task123', error_message=None)
        
        # Assertions
        self.assertEqual(result, mock_job)
        mock_get_job.assert_called_once_with(mock_db, 1)
        self.assertEqual(mock_job.status, 'completed')
        self.assertEqual(mock_job.updated_at, mock_now)
        self.assertEqual(mock_job.task_id, 'task123')
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_job)
    
    @patch('app.services.job_service.from_shape')
    def test_create_region_from_geojson(self, mock_from_shape):
        # Setup mocks
        mock_db = MagicMock()
        mock_from_shape.return_value = 'GEOMETRY_WKB'
        
        # Mock GeoJSON
        geojson = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
            },
            "properties": {
                "name": "Test Region",
                "description": "A test region"
            }
        }
        
        # Call the function
        result = create_region_from_geojson(mock_db, geojson)
        
        # Assertions
        self.assertIsNotNone(result)
        mock_from_shape.assert_called_once()
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

if __name__ == '__main__':
    unittest.main()
