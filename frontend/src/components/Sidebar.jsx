import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Map, FileText, BarChart2, Settings, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {collapsed ? '>' : '<'}
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/" className="sidebar-link">
              <Home size={20} />
              {!collapsed && <span>Home</span>}
            </Link>
          </li>
          <li>
            <Link to="/map" className="sidebar-link">
              <Map size={20} />
              {!collapsed && <span>Map</span>}
            </Link>
          </li>
          <li>
            <Link to="/new" className="sidebar-link">
              <FileText size={20} />
              {!collapsed && <span>New Analysis</span>}
            </Link>
          </li>
          <li>
            <Link to="/jobs" className="sidebar-link">
              <BarChart2 size={20} />
              {!collapsed && <span>My Jobs</span>}
            </Link>
          </li>
          <li className="mt-auto">
            <Link to="/settings" className="sidebar-link">
              <Settings size={20} />
              {!collapsed && <span>Settings</span>}
            </Link>
          </li>
          <li>
            <Link to="/help" className="sidebar-link">
              <HelpCircle size={20} />
              {!collapsed && <span>Help</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
