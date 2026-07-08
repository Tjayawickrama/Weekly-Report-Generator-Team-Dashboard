'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { toast } from '@/components/Toast';
import {
  ArrowLeft,
  Edit,
  Save,
  Send,
  Calendar,
  FolderKanban,
  CheckSquare,
  ListTodo,
  AlertTriangle,
  Clock,
  StickyNote,
} from 'lucide-react';

export default function ReportDetailPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';

  const [report, setReport] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(isEdit);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchReport();
    fetchProjects();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setFormData({
          weekStart: data.report.weekStart?.split('T')[0] || '',
          weekEnd: data.report.weekEnd?.split('T')[0] || '',
          project: data.report.project?._id || data.report.project || '',
          tasksCompleted: data.report.tasksCompleted?.map(t => t.text).join('\n') || '',
          tasksPlanned: data.report.tasksPlanned?.map(t => t.text).join('\n') || '',
          blockers: data.report.blockers?.map(b => b.text).join('\n') || '',
          hoursWorked: data.report.hoursWorked || '',
          notes: data.report.notes || '',
          status: data.report.status,
        });
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
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

  const parseListItems = (text) => {
    return text.split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
  };

  const handleSave = async (newStatus) => {
    setSaving(true);
    try {
      const payload = {
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        project: formData.project,
        tasksCompleted: parseListItems(formData.tasksCompleted).map(t => ({ text: t })),
        tasksPlanned: parseListItems(formData.tasksPlanned).map(t => ({ text: t })),
        blockers: parseListItems(formData.blockers).map(t => ({ text: t, severity: 'medium' })),
        hoursWorked: parseFloat(formData.hoursWorked) || 0,
        notes: formData.notes,
        status: newStatus || formData.status,
      };

      const res = await fetch(`/api/reports/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Report updated successfully', 'success');
        setEditing(false);
        fetchReport();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to update', 'error');
      }
    } catch (err) {
      toast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <h3>Report Not Found</h3>
        <p>The report you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/reports" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-base)' }}>
            <Link href="/reports" className="btn-icon">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <h1 style={{ margin: 0 }}>
                  {editing ? 'Edit Report' : 'Report Details'}
                </h1>
                <StatusBadge status={report.status} />
              </div>
              <p style={{ margin: 0 }}>
                {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            {!editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                <Edit size={16} />
                Edit
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-secondary" onClick={() => handleSave()} disabled={saving}>
                  <Save size={16} />
                  Save
                </button>
                {report.status === 'draft' && (
                  <button className="btn btn-success" onClick={() => handleSave('submitted')} disabled={saving}>
                    <Send size={16} />
                    Submit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {editing ? (
          /* Edit Mode */
          <>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="form-group">
                  <label className="form-label">Week Start</label>
                  <input type="date" className="form-input" value={formData.weekStart} onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Week End</label>
                  <input type="date" className="form-input" value={formData.weekEnd} onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-select" value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}>
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label">Tasks Completed</label>
              <textarea className="form-textarea" value={formData.tasksCompleted} onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })} style={{ minHeight: '120px' }} />
            </div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label">Tasks Planned</label>
              <textarea className="form-textarea" value={formData.tasksPlanned} onChange={(e) => setFormData({ ...formData, tasksPlanned: e.target.value })} style={{ minHeight: '100px' }} />
            </div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label">Blockers</label>
              <textarea className="form-textarea" value={formData.blockers} onChange={(e) => setFormData({ ...formData, blockers: e.target.value })} style={{ minHeight: '80px' }} />
            </div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hours</label>
                  <input type="number" className="form-input" value={formData.hoursWorked} onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ minHeight: '60px' }} />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* View Mode */
          <>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</div>
                  <span className="tag">{report.project?.name || 'Unknown'}</span>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours Worked</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{report.hoursWorked || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{report.submittedAt ? formatDate(report.submittedAt) : 'Not yet'}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-base)', color: 'var(--success)' }}>
                <CheckSquare size={18} />
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Tasks Completed ({report.tasksCompleted?.length || 0})</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {report.tasksCompleted?.map((task, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--success)', marginTop: '2px' }}>✓</span>
                    {task.text}
                  </li>
                ))}
                {(!report.tasksCompleted || report.tasksCompleted.length === 0) && (
                  <li style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No tasks recorded</li>
                )}
              </ul>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-base)', color: 'var(--info)' }}>
                <ListTodo size={18} />
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Tasks Planned ({report.tasksPlanned?.length || 0})</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {report.tasksPlanned?.map((task, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--info)' }}>○</span>
                    {task.text}
                  </li>
                ))}
              </ul>
            </div>

            {report.blockers && report.blockers.length > 0 && (
              <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-base)', color: 'var(--warning)' }}>
                  <AlertTriangle size={18} />
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Blockers ({report.blockers.length})</h3>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {report.blockers.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--warning)' }}>⚠</span>
                      {b.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.notes && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-base)', color: 'var(--text-tertiary)' }}>
                  <StickyNote size={18} />
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Notes</h3>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{report.notes}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
