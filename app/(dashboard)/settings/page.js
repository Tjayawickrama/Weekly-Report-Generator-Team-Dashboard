'use client';

import { useSession } from 'next-auth/react';
import { Settings, User, Shield, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div style={{ maxWidth: '700px' }}>
        {/* Profile Section */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', color: 'var(--primary-light)' }}>
            <User size={18} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Profile Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" defaultValue={session?.user?.name || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" defaultValue={session?.user?.email || ''} disabled />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" defaultValue={session?.user?.title || ''} />
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>

        {/* Security Section */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', color: 'var(--success)' }}>
            <Shield size={18} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Security</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm new password" />
            </div>
          </div>
          <button className="btn btn-secondary">Update Password</button>
        </div>

        {/* Notification Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', color: 'var(--warning)' }}>
            <Bell size={18} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Notifications</h3>
          </div>
          {[
            { label: 'Email notifications for report reminders', defaultChecked: true },
            { label: 'Push notifications for team updates', defaultChecked: true },
            { label: 'Weekly digest email', defaultChecked: false },
            { label: 'Blocker escalation alerts', defaultChecked: true },
          ].map((item, idx) => (
            <label key={idx} className="form-checkbox" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm) 0' }}>
              <input type="checkbox" defaultChecked={item.defaultChecked} />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
