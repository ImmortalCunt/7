import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JobsList from '../components/JobsList';
import { useJobs } from '../contexts/JobContext';
import '@testing-library/jest-dom';

// Mock the useJobs hook
jest.mock('../contexts/JobContext', () => ({
  useJobs: jest.fn()
}));

// Mock the Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  )
}));

describe('JobsList Component', () => {
  const mockJobs = [
    {
      id: 1,
      status: 'completed',
      region_name: 'Test Region 1',
      region_id: 'reg1',
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-01-31T00:00:00Z',
      created_at: '2023-01-01T12:00:00Z'
    },
    {
      id: 2,
      status: 'processing',
      region_name: 'Test Region 2',
      region_id: 'reg2',
      start_date: '2023-02-01T00:00:00Z',
      end_date: '2023-02-28T00:00:00Z',
      created_at: '2023-02-01T12:00:00Z'
    },
    {
      id: 3,
      status: 'failed',
      region_name: 'Test Region 3',
      region_id: 'reg3',
      start_date: '2023-03-01T00:00:00Z',
      end_date: '2023-03-31T00:00:00Z',
      created_at: '2023-03-01T12:00:00Z'
    }
  ];
  
  const mockRefreshJobs = jest.fn();
  
  beforeEach(() => {
    useJobs.mockReturnValue({
      jobs: mockJobs,
      loading: false,
      error: null,
      refreshJobs: mockRefreshJobs
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the jobs list with all jobs', () => {
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('My Analysis Jobs')).toBeInTheDocument();
    expect(screen.getByText('Test Region 1')).toBeInTheDocument();
    expect(screen.getByText('Test Region 2')).toBeInTheDocument();
    expect(screen.getByText('Test Region 3')).toBeInTheDocument();
    
    // Check status indicators
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
  
  test('shows loading state when loading is true', () => {
    useJobs.mockReturnValue({
      jobs: [],
      loading: true,
      error: null,
      refreshJobs: mockRefreshJobs
    });
    
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading jobs...')).toBeInTheDocument();
  });
  
  test('shows error state when there is an error', () => {
    useJobs.mockReturnValue({
      jobs: [],
      loading: false,
      error: 'Failed to load jobs',
      refreshJobs: mockRefreshJobs
    });
    
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Failed to load jobs')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
  
  test('filters jobs when filter is changed', async () => {
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    // Initially all jobs are shown
    expect(screen.getByText('Test Region 1')).toBeInTheDocument();
    expect(screen.getByText('Test Region 2')).toBeInTheDocument();
    expect(screen.getByText('Test Region 3')).toBeInTheDocument();
    
    // Change filter to completed
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'completed' } });
    
    // Only completed job should be shown
    await waitFor(() => {
      expect(screen.getByText('Test Region 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Region 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Region 3')).not.toBeInTheDocument();
    });
  });
  
  test('calls refreshJobs when refresh button is clicked', () => {
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    // Click refresh button
    fireEvent.click(screen.getByTitle('Refresh jobs'));
    
    expect(mockRefreshJobs).toHaveBeenCalledTimes(1);
  });
  
  test('shows empty state when no jobs are available', () => {
    useJobs.mockReturnValue({
      jobs: [],
      loading: false,
      error: null,
      refreshJobs: mockRefreshJobs
    });
    
    render(
      <BrowserRouter>
        <JobsList />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No jobs found. Start a new analysis to see results here.')).toBeInTheDocument();
    expect(screen.getByText('Start New Analysis')).toBeInTheDocument();
  });
});
