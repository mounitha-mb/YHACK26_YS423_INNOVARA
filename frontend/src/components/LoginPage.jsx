import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return false;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await loginUser({ email: email.trim(), password });
        setSuccess('Welcome back! Loading your workspace...');
        setTimeout(() => onLoginSuccess(data.email), 400);
      } else {
        const data = await registerUser({ email: email.trim(), password });
        setSuccess('Account created successfully! Signing you in...');
        setTimeout(() => onLoginSuccess(data.email), 600);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@contentforge.ai');
    setPassword('password123');
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await loginUser({ email: 'demo@contentforge.ai', password: 'password123' });
      setSuccess('Demo account authorized. Loading workspace...');
      setTimeout(() => onLoginSuccess(data.email), 400);
    } catch (err) {
      // If demo user wasn't registered yet in backend, register then login
      try {
        await registerUser({ email: 'demo@contentforge.ai', password: 'password123' });
        const data = await loginUser({ email: 'demo@contentforge.ai', password: 'password123' });
        setSuccess('Demo account authorized. Loading workspace...');
        setTimeout(() => onLoginSuccess(data.email), 400);
      } catch (innerErr) {
        setError(innerErr.message || 'Demo login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setSuccess('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-backdrop-glow"></div>
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Sparkles size={24} />
          </div>
          <div className="login-brand-text">
            <h1 className="login-brand-title">
              ContentForge <span className="login-brand-ai">AI</span>
            </h1>
            <p className="login-brand-sub">Multi-Format Content Intelligence Platform</p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="login-mode-tabs" role="tablist">
          <button
            type="button"
            className={`login-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Get Started with ContentForge'}</h2>
          <p>
            {mode === 'login'
              ? 'Access your AI content transformation workspace'
              : 'Create a free workspace account in seconds'}
          </p>
        </div>

        {/* Quick Demo Access Button */}
        <div className="login-quick-demo">
          <button
            type="button"
            className="btn-quick-demo"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <UserCheck size={16} className="demo-btn-icon" />
            <span className="demo-btn-text">One-Click Demo Sign In</span>
            <span className="demo-badge">Instant</span>
          </button>
          <div className="login-divider">
            <span>or sign in with email</span>
          </div>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="auth-email">Email Address</label>
            <div className="login-input-wrap">
              <Mail size={16} className="login-input-icon" />
              <input
                id="auth-email"
                type="email"
                className="login-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="auth-password">Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="login-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input login-input-password"
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={loading}
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register mode only) */}
          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="login-input-wrap">
                <ShieldCheck size={16} className="login-input-icon" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="login-alert login-alert-error" role="alert">
              <AlertCircle size={16} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="login-alert login-alert-success" role="status">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="login-submit-btn" disabled={loading} id="btn-login-submit">
            {loading ? (
              <>
                <Loader2 size={18} className="login-spinner" />
                <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                <ArrowRight size={18} className="submit-arrow" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="login-toggle-text">
          {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
          {' '}
          <button type="button" className="login-toggle-btn" onClick={switchMode}>
            {mode === 'login' ? 'Create one now' : 'Sign in instead'}
          </button>
        </p>

        {/* Security / Privacy Badge */}
        <div className="login-security-badge">
          <ShieldCheck size={13} />
          <span>Local secure hashing • API credentials protected</span>
        </div>
      </div>
    </div>
  );
}
