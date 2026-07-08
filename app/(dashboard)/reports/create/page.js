'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/Toast';
import {
  ArrowLeft,
  Calendar,
  FolderKanban,
  CheckSquare,
  ListTodo,
  AlertTriangle,
  Clock,
  StickyNote,
  Save,
  Send,
  Trash2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function CreateReportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  const getDefaultWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return {
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: friday.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultWeekDates();

  const [formData, setFormData] = useState({
    weekStart: defaults.weekStart,
    weekEnd: defaults.weekEnd,
    project: '',
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    hoursWorked: '',
    notes: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-save timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.tasksCompleted || formData.tasksPlanned) {
        localStorage.setItem('report_draft', JSON.stringify(formData));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem('report_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const parseListItems = (text) => {
    return text.split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
  };

  const handleSubmit = async (status = 'submitted') => {
    if (!formData.project) {
      toast('Please select a project', 'error');
      return;
    }
    if (!formData.tasksCompleted.trim()) {
      toast('Please add at least one completed task', 'error');
      return;
    }

    setLoading(true);
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
        status,
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem('report_draft');
        toast(status === 'draft' ? 'Report saved as draft' : 'Report submitted successfully!', 'success');
        router.push('/reports');
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save report', 'error');
      }
    } catch (err) {
      toast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      weekStart: defaults.weekStart,
      weekEnd: defaults.weekEnd,
      project: '',
      tasksCompleted: '',
      tasksPlanned: '',
      blockers: '',
      hoursWorked: '',
      notes: '',
    });
    localStorage.removeItem('report_draft');
    toast('Form cleared', 'warning');
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-base)' }}>
            <Link href="/reports" className="btn-icon">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: '4px' }}>
                <h1 style={{ margin: 0 }}>Create Weekly Report</h1>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--success)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  CREATION MODE
                </span>
              </div>
              <p style={{ margin: 0 }}>Fill in your weekly progress report below</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            {autoSaved && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save size={12} /> Auto-saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '800px' }}>
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
            <Calendar size={18} style={{ color: 'var(--primary-light)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Report Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Week Start</label>
              <input
                type="date"
                className="form-input"
                value={formData.weekStart}
                onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                id="report-week-start"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Week End</label>
              <input
                type="date"
                className="form-input"
                value={formData.weekEnd}
                onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                id="report-week-end"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FolderKanban size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Project / Category
            </label>
            <select
              className="form-select"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              id="report-project"
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <CheckSquare size={18} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Tasks Completed</h3>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Enter each task on a new line:&#10;- Implemented user authentication&#10;- Fixed navigation bug&#10;- Reviewed PR #234"
            value={formData.tasksCompleted}
            onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
            style={{ minHeight: '140px' }}
            id="report-tasks-completed"
          />
          <p className="form-helper">List one task per line. Use bullet points (-, •) optionally.</p>
        </div>

        {/* Tasks Planned */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <ListTodo size={18} style={{ color: 'var(--info)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Tasks Planned for Next Week</h3>
          </div>
          <textarea
            className="form-textarea"
            placeholder="Enter planned tasks for next week:&#10;- Complete API integration&#10;- Write unit tests&#10;- Design review"
            value={formData.tasksPlanned}
            onChange={(e) => setFormData({ ...formData, tasksPlanned: e.target.value })}
            style={{ minHeight: '120px' }}
            id="report-tasks-planned"
          />
        </div>

        {/* Blockers */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>Blockers / Challenges</h3>
          </div>
          <textarea
            className="form-textarea"
            placeholder="List any blockers or challenges:&#10;- Waiting on API access from DevOps&#10;- Unclear requirements for feature X"
            value={formData.blockers}
            onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            style={{ minHeight: '100px' }}
            id="report-blockers"
          />
        </div>

        {/* Hours & Notes */}
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-xl)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Hours Worked
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="40"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                min="0"
                max="168"
                step="0.5"
                id="report-hours"
              />
              <p className="form-helper">Optional — total hours for the week</p>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <StickyNote size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Optional Notes / Links
              </label>
              <textarea
                className="form-textarea"
                placeholder="Add any relevant notes, links, or references..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ minHeight: '80px' }}
                id="report-notes"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-lg) 0',
          borderTop: '1px solid var(--border)',
        }}>
          <button className="btn btn-ghost" onClick={clearForm} type="button">
            <Trash2 size={16} />
            Clear Form
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              type="button"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleSubmit('submitted')}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
