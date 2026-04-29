import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import './Navbar.css';

// SVG Icon Components
const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NOTIFICATION_ICONS = {
  message: '💬',
  booking_new: '🎉',
  booking_confirmed: '✅',
  booking_cancelled: '❌',
  host_request_approved: '🏠',
  host_request_rejected: '🚫',
  review_new: '⭐',
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Navbar() {
  const { user, logout, isAdmin, isHost } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to={isAdmin ? '/admin' : isHost ? '/host-dashboard' : '/'} className="navbar-logo">
          <span className="logo-icon">✈</span>
          <span className="logo-text">Tripzybnb</span>
          {isAdmin && <span className="logo-role-badge admin">Admin</span>}
          {isHost && <span className="logo-role-badge host">Host</span>}
        </Link>

        <div className="navbar-actions">
          {/* Dark mode toggle — always visible */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              {/* ========= ADMIN NAV ========= */}
              {isAdmin && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-active' : ''}`}>
                    🛡️ Dashboard
                  </Link>
                  <Link to="/search" className={`nav-link ${isActive('/search') ? 'nav-active' : ''}`}>
                    📋 All Listings
                  </Link>
                  {/* Demo dropdown */}
                  <div className="nav-demo-wrapper">
                    <button className="nav-link nav-demo-btn" onClick={() => setShowDemoDropdown(!showDemoDropdown)}>
                      👁️ Preview ▾
                    </button>
                    {showDemoDropdown && (
                      <div className="nav-demo-dropdown" onMouseLeave={() => setShowDemoDropdown(false)}>
                        <Link to="/" className="dropdown-item" onClick={() => setShowDemoDropdown(false)}>
                          🛒 Customer Page
                        </Link>
                        <Link to="/host-dashboard" className="dropdown-item" onClick={() => setShowDemoDropdown(false)}>
                          🏠 Host Page
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ========= HOST NAV ========= */}
              {isHost && (
                <>
                  <Link to="/host-dashboard" className={`nav-link ${isActive('/host-dashboard') ? 'nav-active' : ''}`}>
                    🏠 Dashboard
                  </Link>
                  <Link to="/messages" className="nav-link nav-icon-link" id="nav-host-messages" title="Messages">
                    <MessageIcon />
                  </Link>
                </>
              )}

              {/* ========= USER NAV ========= */}
              {!isAdmin && !isHost && (
                <>
                  <Link to="/wishlist" className="nav-link nav-icon-link" id="nav-wishlist" title="Wishlist">
                    <HeartIcon />
                  </Link>
                  <Link to="/messages" className="nav-link nav-icon-link" id="nav-messages" title="Messages">
                    <MessageIcon />
                  </Link>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-active' : ''}`} id="nav-dashboard">
                    My Trips
                  </Link>
                </>
              )}

              {/* ========= NOTIFICATION BELL — all logged-in roles ========= */}
              <div className="nav-notif-wrapper" ref={notifRef}>
                <button
                  className="nav-link nav-icon-link nav-notif-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                  id="nav-notifications"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <button className="notif-mark-all" onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-dropdown-body">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 20).map((notif) => (
                          <button
                            key={notif._id}
                            className={`notif-item ${notif.read ? '' : 'notif-unread'}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <span className="notif-icon">{NOTIFICATION_ICONS[notif.type] || '🔔'}</span>
                            <div className="notif-content">
                              <span className="notif-title">{notif.title}</span>
                              <span className="notif-body">{notif.body}</span>
                              <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                            </div>
                            {!notif.read && <span className="notif-dot" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar + Dropdown — all roles */}
              <div className="nav-user-menu">
                <button className="nav-user-btn" id="nav-user-btn">
                  <div className={`user-avatar ${isHost ? 'user-avatar-host' : isAdmin ? 'user-avatar-admin' : ''}`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    {user.role !== 'user' && (
                      <span className={`dropdown-role ${user.role === 'host' ? 'dropdown-role-host' : ''}`}>{user.role}</span>
                    )}
                  </div>
                  {isAdmin && <Link to="/admin" className="dropdown-item">Admin Panel</Link>}
                  {isHost && (
                    <>
                      <Link to="/host-dashboard" className="dropdown-item">Host Dashboard</Link>
                      <Link to="/messages" className="dropdown-item">Messages</Link>
                    </>
                  )}
                  {!isAdmin && !isHost && (
                    <>
                      <Link to="/dashboard" className="dropdown-item">My Bookings</Link>
                      <Link to="/wishlist" className="dropdown-item">Wishlist</Link>
                      <Link to="/messages" className="dropdown-item">Messages</Link>
                      <Link to="/host/register" className="dropdown-item">🏠 Become a Host</Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="dropdown-item dropdown-logout" id="nav-logout">
                    Log out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/host/login" className="nav-link" id="nav-host-login">Host Login</Link>
              <Link to="/login" className="nav-link" id="nav-login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
