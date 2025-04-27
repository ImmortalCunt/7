import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ResultsView from './components/ResultsView';
import JobsList from './components/JobsList';
import AnalysisForm from './components/AnalysisForm';
import HomePage from './components/HomePage';
import DataSourcesInfo from './components/DataSourcesInfo';
import HelpCenter from './components/HelpCenter';
import { JobProvider } from './contexts/JobContext';
import { RegionProvider } from './contexts/RegionContext';
import { DataSourceProvider } from './contexts/DataSourceContext';
import './styles/App.css';

// Placeholder components
const Settings = () => <div className="p-6"><h2>Settings</h2><p>Settings page content will go here.</p></div>;

function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <JobProvider>
        <RegionProvider>
          <DataSourceProvider>
            <div className={`app ${darkMode ? 'dark' : 'light'}`}>
              <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <div className="main-container">
                <Sidebar />
                <main className="content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/new" element={<AnalysisForm />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/results/:jobId" element={<ResultsView />} />
                    <Route path="/jobs" element={<JobsList />} />
                    <Route path="/data-sources" element={<DataSourcesInfo />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<HelpCenter />} />
                  </Routes>
                </main>
              </div>
            </div>
          </DataSourceProvider>
        </RegionProvider>
      </JobProvider>
    </Router>
  );
}

export default App;
