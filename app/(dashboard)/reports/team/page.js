'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import {
  Search,
  Download,
  Eye,
  Users,
  Calendar,
} from 'lucide-react';

export default function TeamReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('this_month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchTeamReports();
    fetchProjects();
    fetchMembers();
  }, [timeFilter, dateFrom, dateTo, useCustomRange]);

  const fetchTeamReports = async () => {
    setLoading(true);
    try {
      let url = `/api/reports/team?period=${timeFilter}`;
      if (useCustomRange && dateFrom && dateTo) {
        url = `/api/reports/team?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch team reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {}
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setMembers((data.users || []).filter(u => u.role === 'team_member'));
      }
    } catch (err) {}
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (projectFilter && r.projectId !== projectFilter && r.Project?.id !== projectFilter) return false;
    if (memberFilter && r.userId !== memberFilter && r.userId?.id !== memberFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (r.userId?.name || '').toLowerCase().includes(s) ||
        (r.Project?.name || '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredReports.length / perPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatWeek = (start, end) => `${formatDate(start)} — ${formatDate(end)}`;

  const avatarColors = [
    'linear-gradient(135deg, #7C3AED, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #10B981, #06B6D4)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

  const exportCSV = () => {
    const headers = ['Team Member', 'Week', 'Project', 'Status', 'Hours', 'Tasks Completed', 'Blockers'];
    const rows = filteredReports.map(r => [
      r.userId?.name || 'Unknown',
      formatWeek(r.weekStart, r.weekEnd),
      r.Project?.name || '',
      r.status,
      r.hoursWorked || 0,
      r.tasksCompleted?.map(t => t.text).join('; ') || '',
      r.blockers?.map(b => b.text).join('; ') || '',
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Team Reports</h1>
            <p>View weekly reports across all team members</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by member or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="team-report-search"
          />
        </div>

        {/* Period or Custom Date Range toggle */}
        {!useCustomRange ? (
          <select className="filter-select" value={timeFilter} onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="all">All Time</option>
          </select>
        ) : (
          <>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 'var(--text-sm)' }}
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              id="team-date-from"
            />
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: 'var(--text-sm)' }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 'var(--text-sm)' }}
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              id="team-date-to"
            />
          </>
        )}

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => { setUseCustomRange(r => !r); setCurrentPage(1); }}
        >
          <Calendar size={13} />
          {useCustomRange ? 'Use Preset' : 'Custom Range'}
        </button>

        {/* Member Filter */}
        <select className="filter-select" value={memberFilter} onChange={(e) => { setMemberFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Members</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Project Filter */}
        <select className="filter-select" value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Status Filter */}
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="late">Late</option>
        </select>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{filteredReports.length}</strong></span>
        <span>Submitted: <strong style={{ color: 'var(--success)' }}>{filteredReports.filter(r => r.status === 'submitted').length}</strong></span>
        <span>Pending: <strong style={{ color: 'var(--warning)' }}>{filteredReports.filter(r => r.status === 'draft' || r.status === 'pending').length}</strong></span>
        <span>Late: <strong style={{ color: 'var(--error)' }}>{filteredReports.filter(r => r.status === 'late').length}</strong></span>
      </div>

      {/* Team Reports Table */}
      <div className="data-table-wrapper">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={28} /></div>
            <h3>No Team Reports Found</h3>
            <p>No reports match your current filters.</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Week</th>
                  <th>Project</th>
                  <th>Tasks</th>
                  <th>Blockers</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report, idx) => (
                  <tr key={report.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div className="avatar avatar-sm" style={{ background: avatarColors[idx % avatarColors.length] }}>
                          {(report.userId?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{report.userId?.name || 'Unknown'}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{report.userId?.title || report.userId?.role || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{formatWeek(report.weekStart, report.weekEnd)}</td>
                    <td><span className="tag">{report.Project?.name || 'Unknown'}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{report.tasksCompleted?.length || 0}</td>
                    <td style={{ color: report.blockers?.length > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {report.blockers?.length || 0}
                    </td>
                    <td>{report.hoursWorked || '-'}</td>
                    <td><StatusBadge status={report.status} /></td>
                    <td>
                      <a href={`/reports/${report.id}`} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                        <Eye size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredReports.length)} of {filteredReports.length}
                </span>
                <div className="pagination-controls">
                  <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(p => (
                    <button key={p} className={`pagination-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                  ))}
                  <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
