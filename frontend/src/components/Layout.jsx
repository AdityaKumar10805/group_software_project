import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineQrCode,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from 'react-icons/hi2';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineHome, section: 'main' },
  { path: '/scanner', label: 'QR Scanner', icon: HiOutlineQrCode, section: 'main' },
  { path: '/attendance', label: 'Attendance', icon: HiOutlineClipboardDocumentList, section: 'main' },
  { path: '/reports', label: 'Reports', icon: HiOutlineChartBarSquare, section: 'main' },
  { path: '/students', label: 'Students', icon: HiOutlineUserGroup, section: 'manage' },
  { path: '/timetable', label: 'Timetable', icon: HiOutlineCalendarDays, section: 'manage' },
  { path: '/users', label: 'Users', icon: HiOutlineUsers, section: 'admin', adminOnly: true },
];

const pageTitles = {
  '/': 'Dashboard',
  '/scanner': 'QR Scanner',
  '/attendance': 'Attendance Records',
  '/reports': 'Reports & Analytics',
  '/students': 'Student Management',
  '/timetable': 'Timetable',
  '/users': 'User Management',
};

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const mainItems = navItems.filter((i) => i.section === 'main');
  const manageItems = navItems.filter((i) => i.section === 'manage');
  const adminItems = navItems.filter((i) => i.section === 'admin');

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">📱</div>
            <div className="sidebar-logo-text">
              <h1>Smart QR</h1>
              <span>Attendance System</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon"><item.icon /></span>
              {item.label}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Management</div>
          {manageItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon"><item.icon /></span>
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 8 }}>Admin</div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sidebar-link-icon"><item.icon /></span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header */}
      <header className="top-header">
        <div className="top-header-left">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <HiOutlineXMark /> : <HiOutlineBars3 />}
          </button>
          <h2 className="page-title">{pageTitles[location.pathname] || 'Dashboard'}</h2>
        </div>
        <div className="top-header-right">
          <div className="header-badge">
            <span className="header-badge-dot" />
            Online
          </div>
          <button className="btn-logout" onClick={logout}>
            <HiOutlineArrowRightOnRectangle />
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
