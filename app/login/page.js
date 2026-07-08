'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel - Features */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-brand">
            <div className="brand-logo">
              <Zap size={20} />
            </div>
            <div>
              <span className="brand-name">Pulse AI</span>
              <span className="brand-badge" style={{ marginLeft: '8px' }}>Enterprise Edition</span>
            </div>
          </div>

          <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 'var(--space-md)', lineHeight: 1.2 }}>
            Transform Your <br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Team Reporting
            </span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-3xl)', maxWidth: '440px', lineHeight: 1.7 }}>
            Streamline weekly reports, track team performance, and unlock AI-powered insights — all in one platform.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary-light)' }}>
                <Shield size={20} />
              </div>
              <div>
                <h3>99.9% Uptime Reliability</h3>
                <p>Enterprise-grade infrastructure built for mission-critical operations</p>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3>2.4s Avg. Render Time</h3>
                <p>Lightning-fast dashboards with real-time data synchronization</p>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <Users size={20} />
              </div>
              <div>
                <h3>10K+ Active Teams</h3>
                <p>Trusted by leading organizations worldwide for team coordination</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Pulse AI workspace</p>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Shield size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ paddingLeft: '40px' }}
                  id="login-email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-light)' }}>Forgot Password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="form-checkbox" style={{ marginBottom: 'var(--space-xl)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me logged in for 30 days
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: 'var(--space-xl)' }}
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ marginBottom: 'var(--space-xl)' }}>or continue with</div>

          <div className="sso-buttons">
            <button className="sso-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="sso-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path fillRule="evenodd" d="M9 0C4.03 0 0 4.03 0 9c0 3.977 2.58 7.35 6.16 8.54.45.083.614-.196.614-.434 0-.214-.008-.78-.012-1.531-2.507.545-3.035-1.208-3.035-1.208-.41-1.04-1-1.317-1-1.317-.816-.558.062-.546.062-.546.902.063 1.377.925 1.377.925.802 1.374 2.104.977 2.617.747.081-.581.314-.977.571-1.201-2.002-.228-4.107-1.001-4.107-4.456 0-.984.352-1.79.928-2.42-.093-.228-.402-1.145.088-2.386 0 0 .757-.242 2.48.924A8.646 8.646 0 019 4.372c.767.004 1.54.104 2.26.304 1.722-1.166 2.478-.924 2.478-.924.491 1.241.182 2.158.089 2.386.578.63.927 1.436.927 2.42 0 3.463-2.108 4.225-4.116 4.449.323.279.611.828.611 1.669 0 1.204-.011 2.176-.011 2.472 0 .24.162.521.619.433C15.423 16.347 18 12.975 18 9c0-4.97-4.03-9-9-9z" clipRule="evenodd"/>
              </svg>
              GitHub
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            New to Pulse AI?{' '}
            <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: 500 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
