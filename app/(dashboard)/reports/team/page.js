'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import {
  Search,
  Download,
  Filter,
  Eye,
  Calendar,
  Users,
} from 'lucide-react';

export default function TeamReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('this_week');
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchTeamReports();
    fetchProjects();
  }, [timeFilter]);

  const fetchTeamReports = async () => {
    try {
      const res = await fetch(`/api/reports/team?period=${timeFilter}`);
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

  const filteredReports = reports.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (projectFilter && r.project?._id !== projectFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (r.userId?.name || '').toLowerCase().includes(s) ||
        (r.project?.name || '').toLowerCase().includes(s)
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
      r.project?.name || '',
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
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by member or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={timeFilter} onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}>
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
          <option value="this_month">This Month</option>
          <option value="all">All Time</option>
        </select>
        <select className="filter-select" value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
          <option value="draft">Draft</option>
          <option value="late">Late</option>
        </select>
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
                  <tr key={report._id}>
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
                    <td><span className="tag">{report.project?.name || 'Unknown'}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{report.tasksCompleted?.length || 0}</td>
                    <td style={{ color: report.blockers?.length > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {report.blockers?.length || 0}
                    </td>
                    <td>{report.hoursWorked || '-'}</td>
                    <td><StatusBadge status={report.status} /></td>
                    <td>
                      <a href={`/reports/${report._id}`} className="btn-icon" style={{ width: '30px', height: '30px' }}>
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
