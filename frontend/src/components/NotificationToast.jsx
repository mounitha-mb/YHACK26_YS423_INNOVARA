import React, { useEffect } from 'react';
import { Info, X, Sparkles, ArrowRight } from 'lucide-react';

export default function NotificationToast({ show, title = "Platform Notice", message, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="toast-overlay" role="alert">
      <div className="toast-card">
        <div className="toast-icon-wrap">
          <Sparkles size={20} className="toast-icon" />
        </div>
        
        <div className="toast-body">
          <div className="toast-title-row">
            <h4 className="toast-title">{title}</h4>
            <span className="toast-badge">Notice</span>
          </div>
          <p className="toast-message">{message}</p>
        </div>

        <button 
          className="toast-close-btn" 
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
