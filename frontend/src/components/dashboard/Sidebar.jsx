import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, User, LogOut, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LiveClock from './LiveClock';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="#fff" />
        </div>
        <span className="sidebar-logo-text">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">Main</span>

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard className="icon" size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/tasks"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <CheckSquare className="icon" size={18} />
          My Tasks
        </NavLink>

        <span className="sidebar-label" style={{ marginTop: '8px' }}>Account</span>

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <User className="icon" size={18} />
          Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <LiveClock name={user?.name} />
        
        <div className="user-info-sidebar">
          <div className="avatar">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name-sidebar">{user?.name || 'User'}</div>
            <div className="user-email-sidebar">{user?.email || ''}</div>
          </div>
        </div>
        <button className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut className="icon" size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
