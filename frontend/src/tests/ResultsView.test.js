import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobProvider } from '../contexts/JobContext';
import ResultsView from '../components/ResultsView';
import '@testing-library/jest-dom';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ jobId: '1' }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the contexts
const mockGetJob = jest.fn();
const mockGetJobResults = jest.fn();
const mockDownloadJobReport = jest.fn();

jest.mock('../contexts/JobContext', () => ({
  useJobs: () => ({
    getJob: mockGetJob,
    getJobResults: mockGetJobResults,
    downloadJobReport: mockDownloadJobReport,
    loading: false,
    error: null
  }),
  JobProvider: ({ children }) => <div>{children}</div>
}));

// Mock Plotly
jest.mock('react-plotly.js', () => {
  return function MockPlot({ data, layout }) {
    return (
      <div data-testid="mock-plot">
        <div>Mock Plot Component</div>
        <pre>{JSON.stringify({ data, layout })}</pre>
      </div>
    );
  };
});

describe('ResultsView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('shows loading state initially', () => {
    // Override the mock to return loading state
    jest.mock('../contexts/JobContext', () => ({
      useJobs: () => ({
        getJob: jest.fn(),
        getJobResults: jest.fn(),
        downloadJobReport: jest.fn(),
        loading: true,
        error: null
      }),
      JobProvider: ({ children }) => <div>{children}</div>
    }));
    
    render(
      <BrowserRouter>
        <ResultsView />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });
  
  test('shows error state when job fetch fails', async () => {
    // Setup mock to return error
    mockGetJob.mockRejectedValueOnce(new Error('Failed to fetch job'));
    
    render(
      <BrowserRouter>
        <ResultsView />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockGetJob).toHaveBeenCalledWith('1');
    });
  });
  
  test('shows processing state when job is in progress', async () => {
    // Setup mock to return a processing job
    mockGetJob.mockResolvedValueOnce({
      id: 1,
      status: 'processing',
      created_at: '2023-01-01T00:00:00Z'
    });
    
    render(
      <BrowserRouter>
        <ResultsView />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockGetJob).toHaveBeenCalledWith('1');
      expect(screen.getByText('Your analysis is in progress')).toBeInTheDocument();
      expect(screen.getByText('Current status: processing')).toBeInTheDocument();
    });
  });
  
  test('shows failed state when job has failed', async () => {
    // Setup mock to return a failed job
    mockGetJob.mockResolvedValueOnce({
      id: 1,
      status: 'failed',
      error_message: 'Processing error occurred',
      created_at: '2023-01-01T00:00:00Z'
    });
    
    render(
      <BrowserRouter>
        <ResultsView />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockGetJob).toHaveBeenCalledWith('1');
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
      expect(screen.getByText('Processing error occurred')).toBeInTheDocument();
    });
  });
  
  test('shows results when job is completed', async () => {
    // Setup mocks to return a completed job and results
    mockGetJob.mockResolvedValueOnce({
      id: 1,
      status: 'completed',
      created_at: '2023-01-01T00:00:00Z'
    });
    
    mockGetJobResults.mockResolvedValueOnce({
      id: 1,
      job_id: 1,
      soc_map_path: '/path/to/soc_map.png',
      moisture_map_path: '/path/to/moisture_map.png',
      report_path: '/path/to/report.pdf',
      soc_min: 10,
      soc_max: 50,
      soc_mean: 30,
      moisture_min: 5,
      moisture_max: 25,
      moisture_mean: 15
    });
    
    render(
      <BrowserRouter>
        <ResultsView />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockGetJob).toHaveBeenCalledWith('1');
      expect(mockGetJobResults).toHaveBeenCalledWith('1');
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Soil Organic Carbon')).toBeInTheDocument();
      expect(screen.getByText('Soil Moisture')).toBeInTheDocument();
      expect(screen.getByText('Download Report')).toBeInTheDocument();
    });
  });
});
