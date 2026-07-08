'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import {
  FileText,
  Clock,
  FolderKanban,
  AlertTriangle,
  Plus,
  Calendar,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Star,
  Sparkles,
} from 'lucide-react';

export default function MemberDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const res = await fetch('/api/reports/stats?type=member');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivities(data.activities || []);
        setDeadlines(data.deadlines || []);
      }
    } catch (err) {
      console.error('Failed to fetch member data:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Default activity items
  const defaultActivities = [
    { icon: CheckCircle, text: 'Weekly report submitted for Project Alpha', time: '2 hours ago', color: 'var(--success)' },
    { icon: MessageSquare, text: 'New comment on Q3 Planning report', time: '4 hours ago', color: 'var(--info)' },
    { icon: Star, text: 'Report approved by manager', time: '6 hours ago', color: 'var(--warning)' },
    { icon: FolderKanban, text: 'Added to Neptune UI project', time: '1 day ago', color: 'var(--primary-light)' },
    { icon: FileText, text: 'Draft saved for Infrastructure report', time: '1 day ago', color: 'var(--text-tertiary)' },
  ];

  const defaultDeadlines = [
    { name: 'Project Alpha Sync', project: 'Phoenix', due: 'Due Tomorrow', progress: 75, urgency: 'high' },
    { name: 'Security Audit Report', project: 'Internal', due: 'Due in 3 days', progress: 40, urgency: 'medium' },
    { name: 'Quarterly Planning', project: 'Operations', due: 'Due in 5 days', progress: 20, urgency: 'low' },
  ];

  const urgencyColors = {
    high: 'var(--error)',
    medium: 'var(--warning)',
    low: 'var(--success)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Hello, {session?.user?.name || 'Member'} 👋</h1>
            <p>{dateStr}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-secondary">
              <Calendar size={16} />
              Schedule
            </button>
            <Link href="/reports/create" className="btn btn-primary">
              <Plus size={16} />
              Create Weekly Report
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          icon={FileText}
          label="Reports Submitted"
          value={stats?.reportsSubmitted?.toString() || '0'}
          trend="up"
          trendValue="+2 this month"
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Pending Reports"
          value={stats?.pendingReports?.toString().padStart(2, '0') || '00'}
          trend="down"
          trendValue="Action needed"
          color="amber"
        />
        <MetricCard
          icon={FolderKanban}
          label="Projects Assigned"
          value={stats?.projectsAssigned?.toString().padStart(2, '0') || '00'}
          color="blue"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Open Blockers"
          value={stats?.openBlockers?.toString().padStart(2, '0') || '00'}
          trend="down"
          trendValue="1 resolved"
          color="red"
        />
      </div>

      {/* Two Column Layout */}
      <div className="two-col-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="card-action">View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {(activities.length > 0 ? activities : defaultActivities).map((activity, idx) => {
              const Icon = activity.icon || CheckCircle;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activity.color || 'var(--text-tertiary)',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {activity.text}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {activity.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <span className="card-action">View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {(deadlines.length > 0 ? deadlines : defaultDeadlines).map((deadline, idx) => (
              <div
                key={idx}
                style={{
                  padding: 'var(--space-base)',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${urgencyColors[deadline.urgency] || 'var(--border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {deadline.name}
                  </span>
                  <span className="tag">{deadline.project}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: urgencyColors[deadline.urgency] || 'var(--text-tertiary)' }}>
                    {deadline.due}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {deadline.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${deadline.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-base)',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-md)',
          }}>
            <Sparkles size={18} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--primary-light)', marginBottom: '2px' }}>
                AI Insight
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your task completion rate increased by 15% compared to last week. Keep up the momentum!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
