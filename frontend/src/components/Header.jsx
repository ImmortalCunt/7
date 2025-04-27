import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="header">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="logo flex items-center">
            <img 
              src="/logo.svg" 
              alt="AgricarbonX Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="font-bold text-xl">AgricarbonX</span>
          </Link>
        </div>
        
        <div className="flex items-center">
          <nav className="hidden md:flex mr-6">
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li>
                <Link to="/new" className="nav-link">New Analysis</Link>
              </li>
              <li>
                <Link to="/jobs" className="nav-link">My Jobs</Link>
              </li>
              <li>
                <Link to="/map" className="nav-link">Map</Link>
              </li>
            </ul>
          </nav>
          
          <button 
            onClick={toggleDarkMode} 
            className="theme-toggle p-2 rounded-full"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="md:hidden ml-4 p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
