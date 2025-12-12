import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { clearStockData } = useStock();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    clearStockData(); // Clear watchlists and stock data
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/watchlists', label: 'Watchlists', icon: '📋' },

    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/compare', label: 'Compare', icon: '📈' }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <Link to="/dashboard" className="brand-link">
            <div className="brand-icon">📈</div>
            <span className="brand-text">Stock Tracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="header-actions">
          {/* User Profile Dropdown */}
          <div className="profile-dropdown">
            <button 
              className="profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
            >
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} />
                ) : (
                  <span className="avatar-text">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.fullName}</span>
                <span className="profile-email">{user?.email}</span>
              </div>
              <svg 
                className={`chevron ${isProfileOpen ? 'open' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>

            {isProfileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-avatar-large">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullName} />
                    ) : (
                      <span className="avatar-text">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="profile-details">
                    <div className="profile-name-large">{user?.fullName}</div>
                    <div className="profile-email-small">{user?.email}</div>
                  </div>
                </div>

                <div className="profile-menu-body">
                  <Link 
                    to="/profile" 
                    className="menu-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <span className="menu-icon">👤</span>
                    Profile Settings
                  </Link>
                  
                  <Link 
                    to="/preferences" 
                    className="menu-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <span className="menu-icon">⚙️</span>
                    Preferences
                  </Link>
                  
                  <button className="menu-item" onClick={() => {}}>
                    <span className="menu-icon">🌙</span>
                    Dark Mode
                  </button>
                  
                  <hr className="menu-divider" />
                  
                  <button className="menu-item logout" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger">
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="mobile-nav-item">
                <Link 
                  to={item.path} 
                  className={`mobile-nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Overlay for mobile menu */}
      {(isMenuOpen || isProfileOpen) && (
        <div 
          className="header-overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setIsProfileOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;