import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <div className="mobile-logo-icon">
            <Zap size={16} color="#fff" />
          </div>
          <span>TaskFlow</span>
        </div>
        <button className="btn btn-ghost" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </header>

      {/* Overlay for mobile sidebar */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
