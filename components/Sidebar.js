'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  FolderKanban,
  Bot,
  Settings,
  Users,
  Plus,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['team_member', 'manager', 'admin'],
    },
    {
      label: 'Analytics',
      href: '/dashboard/manager',
      icon: BarChart3,
      roles: ['manager', 'admin'],
    },
    {
      label: 'Report History',
      href: '/reports',
      icon: FileText,
      roles: ['team_member', 'manager', 'admin'],
    },
    {
      label: 'Team Reports',
      href: '/reports/team',
      icon: FileText,
      roles: ['manager', 'admin'],
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      roles: ['team_member', 'manager', 'admin'],
    },
    {
      label: 'User Management',
      href: '/users',
      icon: Users,
      roles: ['manager', 'admin'],
    },
    {
      label: 'AI Assistant',
      href: '/ai-assistant',
      icon: Bot,
      roles: ['manager', 'admin'],
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['team_member', 'manager', 'admin'],
    },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || 'team_member'));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    'linear-gradient(135deg, #7C3AED, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #10B981, #06B6D4)',
  ];

  const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ background: 'transparent' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-name">ProgressHub</span>
              <span className="logo-badge">Enterprise</span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </button>

        {/* Generate Report Button */}
        {!isManager && !collapsed && (
          <Link href="/reports/create" className="sidebar-cta">
            <Plus size={16} />
            <span>Generate Report</span>
          </Link>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && <div className="nav-active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div
            className="avatar"
            style={{ background: getAvatarColor(user?.name) }}
          >
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-role">{user?.title || user?.role || 'Team Member'}</span>
            </div>
          )}
          {!collapsed && (
            <button
              className="sidebar-logout"
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: rgba(11, 11, 21, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width var(--transition-slow);
          overflow: hidden;
        }

        .sidebar-collapsed {
          width: var(--sidebar-collapsed);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-xl) var(--space-lg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: var(--text-lg);
          font-weight: 700;
          background: linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .logo-badge {
          font-size: 10px;
          color: var(--text-tertiary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .sidebar-toggle {
          position: absolute;
          top: 28px;
          right: 12px;
          width: 22px;
          height: 22px;
          border-radius: var(--radius-full);
          background: rgba(26, 26, 46, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: all var(--transition-base);
        }

        .sidebar:hover .sidebar-toggle {
          opacity: 1;
        }

        .sidebar-toggle:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.2);
        }

        :global(.sidebar-cta) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          margin: var(--space-lg) var(--space-lg) 0;
          padding: 11px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white !important;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-base);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }

        :global(.sidebar-cta:hover) {
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
          transform: translateY(-1.5px);
          filter: brightness(1.08);
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-xl) var(--space-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        :global(.sidebar-nav-item) {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          margin: 1px 8px;
          border-radius: var(--radius-md);
          color: var(--text-secondary) !important;
          font-size: var(--text-base);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        :global(.sidebar-nav-item) :global(svg) {
          color: var(--text-tertiary);
          transition: all 0.2s ease;
        }

        :global(.sidebar-nav-item:hover) {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary) !important;
          transform: translateX(4px);
        }

        :global(.sidebar-nav-item:hover) :global(svg) {
          color: var(--text-primary);
          transform: scale(1.05);
        }

        :global(.sidebar-nav-item.active) {
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0.02) 100%);
          color: #A78BFA !important;
          font-weight: 600;
        }

        :global(.sidebar-nav-item.active) :global(svg) {
          color: #A78BFA;
        }

        :global(.nav-active-indicator) {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 0 4px 4px 0;
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
        }

        .sidebar-collapsed :global(.sidebar-nav-item) {
          padding: 12px;
          margin: 2px 10px;
          justify-content: center;
        }

        .sidebar-collapsed :global(.sidebar-nav-item:hover) {
          transform: none;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          margin-top: auto;
          background: rgba(0, 0, 0, 0.15);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: var(--text-sm);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .sidebar-user-info {
          flex: 1;
          min-width: 0;
        }

        .sidebar-user-name {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-logout {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .sidebar-logout:hover {
          background: var(--error-bg);
          color: var(--error);
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-collapsed {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
}
