'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend);

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('this_week');

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, teamRes] = await Promise.all([
        fetch(`/api/reports/stats?period=${dateFilter}`),
        fetch(`/api/reports/team?period=${dateFilter}`),
      ]);
      const data = await statsRes.json();
      setStats(data.stats);
      setRecentReports(data.recentReports || []);
      setContributors(data.topContributors || []);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        // Build workload by project
        const projectMap = {};
        (teamData.reports || []).forEach(r => {
          const name = r.Project?.name || 'Unknown';
          const color = r.Project?.color || '#7C3AED';
          if (!projectMap[name]) projectMap[name] = { tasks: 0, color };
          projectMap[name].tasks += r.tasksCompleted?.length || 0;
        });
        setProjectWorkload(Object.entries(projectMap).map(([name, v]) => ({ name, tasks: v.tasks, color: v.color })));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setStats({ totalReports: 0, pendingReports: 0, complianceRate: 0, openBlockers: 0 });
      setRecentReports([]);
      setContributors([]);
      setProjectWorkload([]);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for Task Completion Trend
  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: stats?.weeklyTasks || [12, 19, 14, 22, 16, 8, 5],
        backgroundColor: 'rgba(124, 58, 237, 0.7)',
        borderColor: '#7C3AED',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Tasks Planned',
        data: stats?.weeklyPlanned || [15, 20, 18, 25, 20, 10, 8],
        backgroundColor: 'rgba(59, 130, 246, 0.4)',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#94A3B8',
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1E1E38',
        titleColor: '#fff',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { size: 12, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748B', font: { size: 12, family: 'Inter' } },
        border: { display: false },
      },
    },
  };

  // Doughnut chart data for Submission Status
  const submittedCount = stats?.submissionBreakdown?.submitted || 92;
  const pendingCount = stats?.submissionBreakdown?.pending || 5;
  const lateCount = stats?.submissionBreakdown?.late || 3;

  const doughnutData = {
    labels: ['On Time', 'Pending', 'Late'],
    datasets: [{
      data: [submittedCount, pendingCount, lateCount],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderColor: 'transparent',
      borderWidth: 0,
      cutout: '75%',
      spacing: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94A3B8',
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1E1E38',
        titleColor: '#fff',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
  };

  const avatarColors = [
    'linear-gradient(135deg, #7C3AED, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #10B981, #06B6D4)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

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
            <h1>Manager Dashboard</h1>
            <p>Welcome back, {session?.user?.name || 'Manager'}. Here&apos;s your team&apos;s overview.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
            <button className="btn btn-secondary">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          icon={FileText}
          label="Total Reports"
          value={stats?.totalReports?.toLocaleString() || '0'}
          trend="up"
          trendValue="+12.5% from last week"
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Pending Reports"
          value={stats?.pendingReports?.toString() || '0'}
          trend="down"
          trendValue="-8.3% from last week"
          color="amber"
        />
        <MetricCard
          icon={CheckCircle}
          label="Compliance Rate"
          value={`${stats?.complianceRate || 0}%`}
          trend="up"
          trendValue="+2.1% from last week"
          color="green"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Open Blockers"
          value={stats?.openBlockers?.toString().padStart(2, '0') || '00'}
          trend="down"
          trendValue="-15% from last week"
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Task Completion Trend</h3>
            <span className="card-action">View Details →</span>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Submission Status</h3>
            <span className="card-action">View Details →</span>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--success)' }}>
                {Math.round((submittedCount / (submittedCount + pendingCount + lateCount)) * 100)}%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>On Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload by Project Chart */}
      {projectWorkload.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="card-header">
            <h3>Workload Distribution by Project</h3>
            <span className="card-action">Tasks completed per project</span>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PolarArea
              data={{
                labels: projectWorkload.map(p => p.name),
                datasets: [{
                  data: projectWorkload.map(p => p.tasks),
                  backgroundColor: projectWorkload.map(p => p.color + 'CC'),
                  borderColor: projectWorkload.map(p => p.color),
                  borderWidth: 2,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#94A3B8', font: { size: 12, family: 'Inter' }, usePointStyle: true, pointStyle: 'circle', padding: 14 },
                  },
                  tooltip: {
                    backgroundColor: '#1E1E38', titleColor: '#fff', bodyColor: '#94A3B8',
                    borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 8, padding: 12,
                    callbacks: { label: (ctx) => ` ${ctx.parsed}r tasks` },
                  },
                },
                scales: {
                  r: {
                    ticks: { color: '#64748B', font: { size: 10 }, backdropColor: 'transparent' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="two-col-grid">
        {/* Recent Reports */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Reports</h3>
            <span className="card-action">View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {(recentReports.length > 0 ? recentReports : [
              { projectName: 'Phoenix Infrastructure', user: 'Sarah Chen', status: 'submitted', hours: 42, time: '2 hours ago' },
              { projectName: 'Starlight SDK', user: 'James Miller', status: 'submitted', hours: 38, time: '3 hours ago' },
              { projectName: 'Neptune UI', user: 'Elena Rodriguez', status: 'pending', hours: 40, time: '5 hours ago' },
              { projectName: 'Quantum Ledger', user: 'Alex Rivera', status: 'late', hours: 35, time: '1 day ago' },
            ]).map((report, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-glass)'; }}
              >
                <div
                  className="avatar avatar-sm"
                  style={{ background: avatarColors[idx % avatarColors.length] }}
                >
                  {(report.user || report.userName || 'U').charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {report.projectName || report.project?.name || 'Project'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {report.user || report.userName || 'User'} · {report.time || 'Recently'}
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="card">
          <div className="card-header">
            <h3>Top Contributors</h3>
            <span className="card-action">View All →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {(contributors.length > 0 ? contributors : [
              { name: 'Sarah Chen', role: 'Senior Developer', reports: 12, tasks: 48, trend: '+15%' },
              { name: 'James Miller', role: 'Backend Engineer', reports: 11, tasks: 42, trend: '+12%' },
              { name: 'Elena Rodriguez', role: 'UI Designer', reports: 10, tasks: 38, trend: '+8%' },
            ]).map((person, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  className="avatar"
                  style={{ background: avatarColors[idx % avatarColors.length] }}
                >
                  {(person.name || 'U').split(' ').map(w => w[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {person.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {person.role || 'Team Member'} · {person.reports || 0} reports
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                  <TrendingUp size={12} />
                  {person.trend || '+0%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
