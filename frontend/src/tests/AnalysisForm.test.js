import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobProvider } from '../contexts/JobContext';
import AnalysisForm from '../components/AnalysisForm';
import '@testing-library/jest-dom';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the contexts
jest.mock('../contexts/JobContext', () => ({
  useJobs: () => ({
    createJob: jest.fn().mockResolvedValue({ id: 1 }),
    loading: false,
    error: null
  }),
  JobProvider: ({ children }) => <div>{children}</div>
}));

// Mock the child components
jest.mock('../components/RegionSelection', () => {
  return function MockRegionSelection({ onRegionSelected }) {
    return (
      <div data-testid="region-selection">
        <button 
          data-testid="select-region-btn" 
          onClick={() => onRegionSelected({
            features: [{ 
              geometry: { 
                type: 'Polygon', 
                coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] 
              } 
            }]
          })}
        >
          Select Region
        </button>
      </div>
    );
  };
});

jest.mock('../components/DateSelection', () => {
  return function MockDateSelection({ onDateRangeSelected }) {
    return (
      <div data-testid="date-selection">
        <button 
          data-testid="select-dates-btn" 
          onClick={() => onDateRangeSelected({
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31')
          })}
        >
          Select Dates
        </button>
      </div>
    );
  };
});

describe('AnalysisForm Component', () => {
  test('renders the first step by default', () => {
    render(
      <BrowserRouter>
        <AnalysisForm />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('region-selection')).toBeInTheDocument();
    expect(screen.queryByTestId('date-selection')).not.toBeInTheDocument();
  });
  
  test('moves to second step after region selection and next button click', async () => {
    render(
      <BrowserRouter>
        <AnalysisForm />
      </BrowserRouter>
    );
    
    // Select a region
    fireEvent.click(screen.getByTestId('select-region-btn'));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Should now show date selection
    await waitFor(() => {
      expect(screen.getByTestId('date-selection')).toBeInTheDocument();
    });
  });
  
  test('moves to third step after date selection and next button click', async () => {
    render(
      <BrowserRouter>
        <AnalysisForm />
      </BrowserRouter>
    );
    
    // Select a region
    fireEvent.click(screen.getByTestId('select-region-btn'));
    
    // Click next button to go to step 2
    fireEvent.click(screen.getByText('Next'));
    
    // Select dates
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('select-dates-btn'));
    });
    
    // Click next button to go to step 3
    fireEvent.click(screen.getByText('Next'));
    
    // Should now show review step
    await waitFor(() => {
      expect(screen.getByText('Step 3: Review & Submit')).toBeInTheDocument();
    });
  });
  
  test('shows error when trying to proceed without selecting a region', () => {
    render(
      <BrowserRouter>
        <AnalysisForm />
      </BrowserRouter>
    );
    
    // Try to click next without selecting a region
    fireEvent.click(screen.getByText('Next'));
    
    // Should show error
    expect(screen.getByText('Please select a region before proceeding')).toBeInTheDocument();
  });
  
  test('can go back from step 2 to step 1', async () => {
    render(
      <BrowserRouter>
        <AnalysisForm />
      </BrowserRouter>
    );
    
    // Select a region
    fireEvent.click(screen.getByTestId('select-region-btn'));
    
    // Click next button to go to step 2
    fireEvent.click(screen.getByText('Next'));
    
    // Click back button
    await waitFor(() => {
      fireEvent.click(screen.getByText('Back'));
    });
    
    // Should now show region selection again
    await waitFor(() => {
      expect(screen.getByTestId('region-selection')).toBeInTheDocument();
    });
  });
});
