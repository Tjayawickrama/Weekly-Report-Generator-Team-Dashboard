'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import MetricCard from '@/components/MetricCard';
import { toast } from '@/components/Toast';
import {
  Plus,
  Search,
  FolderKanban,
  Users,
  CheckCircle,
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
} from 'lucide-react';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === 'manager' || session?.user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#7C3AED',
    status: 'active',
  });

  const projectColors = ['#7C3AED', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#F97316'];

  useEffect(() => {
    fetchProjects();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast('Please enter a project name', 'error');
      return;
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast(editingProject ? 'Project updated' : 'Project created', 'success');
        setShowModal(false);
        setEditingProject(null);
        setFormData({ name: '', description: '', color: '#7C3AED', status: 'active' });
        fetchProjects();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed', 'error');
      }
    } catch (err) {
      toast('Something went wrong', 'error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#7C3AED',
      status: project.status || 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Project deleted', 'success');
        fetchProjects();
        if (selectedProject?._id === id) setSelectedProject(null);
      }
    } catch (err) {
      toast('Failed to delete project', 'error');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedTasks = projects.reduce((sum, p) => sum + (p.tasksCompleted || 0), 0);
  const totalMembers = new Set(projects.flatMap(p => (p.members || []).map(m => m._id || m))).size;

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
            <h1>Projects</h1>
            <p>Manage projects and work categories</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            {isManager && (
              <button className="btn btn-primary" onClick={() => { setEditingProject(null); setFormData({ name: '', description: '', color: '#7C3AED', status: 'active' }); setShowModal(true); }}>
                <Plus size={16} />
                New Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard icon={FolderKanban} label="Active Projects" value={activeCount} color="purple" />
        <MetricCard icon={CheckCircle} label="Tasks Completed" value={completedTasks} color="green" />
        <MetricCard icon={Users} label="Total Members" value={totalMembers} color="blue" />
        <MetricCard icon={TrendingUp} label="Avg. Efficiency" value={`${projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.efficiency || 0), 0) / projects.length) : 0}%`} color="cyan" />
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" className="search-input" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="three-col-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon"><FolderKanban size={28} /></div>
            <h3>No Projects Found</h3>
            <p>Create your first project to get started.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="card"
              style={{ cursor: 'pointer', borderTop: `3px solid ${project.color || 'var(--primary)'}` }}
              onClick={() => setSelectedProject(project)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                    background: `${project.color}20`, color: project.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FolderKanban size={16} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>{project.name}</h3>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', lineHeight: 1.5, minHeight: '40px' }}>
                {project.description || 'No description'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <Users size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {project.members?.length || 0} members
                  </span>
                </div>
                {isManager && (
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleEdit(project)}>
                      <Edit size={12} />
                    </button>
                    <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleDelete(project._id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Drawer */}
      {selectedProject && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedProject(null)} />
          <div className="drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{selectedProject.name}</h2>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>
                <X size={16} />
              </button>
            </div>
            <StatusBadge status={selectedProject.status} />
            <p style={{ margin: 'var(--space-lg) 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {selectedProject.description || 'No description provided.'}
            </p>
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{selectedProject.members?.length || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks Done</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{selectedProject.tasksCompleted || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficiency</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--success)' }}>{selectedProject.efficiency || 0}%</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</div>
                <div style={{ fontSize: 'var(--text-sm)' }}>{new Date(selectedProject.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProject(null); }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingProject(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProject ? 'Update' : 'Create'} Project
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Project Name</label>
          <input type="text" className="form-input" placeholder="e.g., Client Portal Redesign" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Brief project description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: '80px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {projectColors.map(c => (
              <button
                key={c}
                type="button"
                style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                  background: c, border: formData.color === c ? '3px solid white' : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onClick={() => setFormData({ ...formData, color: c })}
              />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
