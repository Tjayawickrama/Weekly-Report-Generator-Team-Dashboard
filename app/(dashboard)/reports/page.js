'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Filter,
} from 'lucide-react';

export default function ReportHistoryPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === 'manager' || session?.user?.role === 'admin';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchReports();
    fetchProjects();
  }, [isManager]);

  const fetchReports = async () => {
    try {
      // Managers/Admins see ALL team reports; team members see only their own
      const url = isManager ? '/api/reports/team?period=all' : '/api/reports';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {}
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (projectFilter && r.projectId !== projectFilter && r.Project?.id !== projectFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const projectName = r.Project?.name || r.project?.name || '';
      const memberName = r.userId?.name || '';
      return projectName.toLowerCase().includes(s) ||
        memberName.toLowerCase().includes(s) ||
        r.tasksCompleted?.some(t => t.text.toLowerCase().includes(s));
    }
    return true;
  });

  const totalPages = Math.ceil(filteredReports.length / perPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatWeek = (start, end) => {
    return `${formatDate(start)} — ${formatDate(end)}`;
  };

  const exportCSV = () => {
    const headers = ['Week', 'Project', 'Status', 'Hours', 'Tasks Completed', 'Blockers'];
    const rows = filteredReports.map(r => [
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
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
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
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Report History</h1>
            <p>{isManager ? 'All team weekly reports' : 'View and manage your weekly reports'}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              Export CSV
            </button>
            {!isManager && (
              <Link href="/reports/create" className="btn btn-primary">
                <Plus size={16} />
                New Report
              </Link>
            )}
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
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="report-search"
          />
        </div>
        <select
          className="filter-select"
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="draft">Draft</option>
          <option value="late">Late</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="data-table-wrapper">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={28} />
            </div>
            <h3>No Reports Found</h3>
            <p>{isManager ? 'No team reports match your current filters.' : "You haven't created any reports yet. Start by creating your first weekly report."}</p>
            {!isManager && (
              <Link href="/reports/create" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                <Plus size={16} />
                Create Report
              </Link>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week</th>
                  {isManager && <th>Member</th>}
                  <th>Project</th>
                  <th>Tasks</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                      {formatWeek(report.weekStart, report.weekEnd)}
                    </td>
                    {isManager && (
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', fontSize: '10px' }}>
                            {(report.userId?.name || 'U').charAt(0)}
                          </div>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{report.userId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="tag">
                        {report.Project?.name || report.project?.name || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      {report.tasksCompleted?.length || 0} completed
                    </td>
                    <td>{report.hoursWorked || '-'}</td>
                    <td>
                      <StatusBadge status={report.status} />
                    </td>
                    <td>{report.submittedAt ? formatDate(report.submittedAt) : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                        <Link href={`/reports/${report.id}`} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                          <Eye size={14} />
                        </Link>
                        <Link href={`/reports/${report.id}?edit=true`} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                          <Edit size={14} />
                        </Link>
                        <button
                          className="btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredReports.length)} of {filteredReports.length} reports
                </span>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, currentPage - 3),
                    currentPage + 2
                  ).map(p => (
                    <button
                      key={p}
                      className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
