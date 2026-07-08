'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'team_member',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0A14 0%, #1a0533 50%, #0f1628 100%)',
      padding: 'var(--space-xl)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Glow Effects */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '15%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-3xl)',
        position: 'relative',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div className="auth-brand">
            <div className="brand-logo" style={{ background: 'transparent', padding: 0, width: '40px', height: '40px' }}>
              <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <span className="brand-name">ProgressHub</span>
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2xl)' }}>
          Start managing your weekly reports with ProgressHub
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-lg)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ paddingLeft: '40px' }}
                id="register-name"
              />
            </div>
          </div>

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
                id="register-email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                id="register-password"
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                style={{ paddingLeft: '40px' }}
                id="register-confirm-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              id="register-role"
            >
              <option value="team_member">Team Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <label className="form-checkbox" style={{ marginBottom: 'var(--space-xl)' }}>
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            />
            I agree to the <a href="#" style={{ color: 'var(--primary-light)' }}>Terms of Service</a> & <a href="#" style={{ color: 'var(--primary-light)' }}>Privacy Policy</a>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: 'var(--space-xl)' }}
            disabled={loading}
            id="register-submit"
          >
            {loading ? (
              <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <>
                Sign Up
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="divider-text" style={{ marginBottom: 'var(--space-lg)' }}>or sign up with</div>

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
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
