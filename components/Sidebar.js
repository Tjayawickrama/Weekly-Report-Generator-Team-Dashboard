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
  Zap,
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
          <div className="logo-icon">
            <Zap size={20} />
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
          <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
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
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
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
          border-bottom: 1px solid var(--border);
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary), var(--accent-cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .logo-badge {
          font-size: var(--text-xs);
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sidebar-toggle {
          position: absolute;
          top: 26px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
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
        }

        .sidebar-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          margin: var(--space-lg) var(--space-lg) 0;
          padding: 10px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-base);
          box-shadow: 0 2px 8px var(--primary-glow);
        }

        .sidebar-cta:hover {
          box-shadow: 0 4px 16px var(--primary-glow);
          transform: translateY(-1px);
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-lg) var(--space-sm);
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 400;
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
        }

        .sidebar-nav-item.active {
          background: var(--primary-subtle);
          color: var(--primary-light);
          font-weight: 500;
        }

        .nav-active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          border-radius: 0 3px 3px 0;
          background: var(--primary);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          border-top: 1px solid var(--border);
          margin-top: auto;
        }

        .sidebar-user-info {
          flex: 1;
          min-width: 0;
        }

        .sidebar-user-name {
          display: block;
          font-size: var(--text-sm);
          font-weight: 500;
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
          width: 32px;
          height: 32px;
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
