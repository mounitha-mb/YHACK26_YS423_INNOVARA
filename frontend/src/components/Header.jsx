import React from 'react';
import { Menu, Sparkles, LogOut, User } from 'lucide-react';

export default function Header({ onToggleMobileMenu, user, onLogout }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="header-text">
          <div className="header-title-row">
            <h1 className="header-title">Content Transformation</h1>
            <span className="status-badge">
              <span className="status-dot"></span>
              Ready
            </span>
          </div>
          <p className="header-description">
            Transform one source into multiple communication formats.
          </p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-tag">
          <Sparkles size={15} className="tag-icon" />
          <span>Multi-Format Engine</span>
        </div>
        {user && (
          <div className="header-user-row">
            <div className="header-user-pill">
              <User size={13} />
              <span className="header-user-email">{user}</span>
            </div>
            <button className="header-logout-btn" onClick={onLogout} title="Sign out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
