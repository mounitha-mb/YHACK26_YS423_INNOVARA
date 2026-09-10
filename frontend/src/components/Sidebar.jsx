import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  PenTool, 
  History, 
  Settings, 
  Layers,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Content', icon: PenTool, badge: '11 Formats' },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-icon-wrapper">
              <Sparkles className="brand-icon" size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">ContentForge</span>
              <span className="brand-badge">AI</span>
            </div>
          </div>
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
              >
                <div className="nav-link-content">
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="nav-pill-badge">{item.badge}</span>
                ) : (
                  isActive && <ChevronRight size={16} className="nav-chevron" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Platform Info Card & Logout */}
        <div className="sidebar-footer">
          <div className="footer-card">
            <div className="footer-icon-box">
              <Layers size={18} />
            </div>
            <div className="footer-card-body">
              <p className="footer-title">ContentForge AI 5.0</p>
              <p className="footer-desc">Multi-Format Transformation</p>
            </div>
          </div>
          {onLogout && (
            <button 
              type="button" 
              className="sidebar-logout-btn" 
              onClick={onLogout}
              title="Sign out of workspace"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
