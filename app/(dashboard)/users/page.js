'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MetricCard from '@/components/MetricCard';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { toast } from '@/components/Toast';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'team_member' });
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast('Role updated successfully', 'success');
        fetchUsers();
      } else {
        toast('Failed to update role', 'error');
      }
    } catch (err) {
      toast('Something went wrong', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast('User deleted', 'success');
        fetchUsers();
      }
    } catch (err) {
      toast('Failed to delete user', 'error');
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast('Please fill all required fields', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast('User created successfully', 'success');
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'team_member' });
        fetchUsers();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to create user', 'error');
      }
    } catch (err) {
      toast('Something went wrong', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  const avatarColors = [
    'linear-gradient(135deg, #7C3AED, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #10B981, #06B6D4)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
  ];

  const roleBadge = (role) => {
    const map = {
      admin: { bg: 'var(--error-bg)', color: 'var(--error)', border: 'var(--error-border)', label: 'Admin' },
      manager: { bg: 'var(--info-bg)', color: 'var(--info)', border: 'var(--info-border)', label: 'Manager' },
      team_member: { bg: 'var(--bg-glass)', color: 'var(--text-secondary)', border: 'var(--border)', label: 'Member' },
    };
    const r = map[role] || map.team_member;
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
        fontWeight: 500, background: r.bg, color: r.color, border: `1px solid ${r.border}`,
      }}>
        {r.label}
      </span>
    );
  };

  const totalMembers = users.length;
  const managerCount = users.filter(u => u.role === 'manager' || u.role === 'admin').length;

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
            <h1>User Management</h1>
            <p>Manage team members and roles</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard icon={Users} label="Total Members" value={totalMembers} color="purple" />
        <MetricCard icon={Shield} label="Managers" value={managerCount} color="blue" />
        <MetricCard icon={UserCheck} label="Active Users" value={users.filter(u => u.isActive).length} color="green" />
        <MetricCard icon={Clock} label="Joined This Month" value={users.filter(u => {
          const d = new Date(u.createdAt);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length} color="cyan" />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" className="search-input" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Roles</option>
          <option value="team_member">Team Members</option>
          <option value="manager">Managers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, idx) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div className="avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                      {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{user.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    className="filter-select"
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: 'var(--text-xs)' }}
                  >
                    <option value="team_member">Team Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <StatusBadge status={user.isActive ? 'active' : 'archived'} />
                </td>
                <td style={{ fontSize: 'var(--text-sm)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    <button
                      className="btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === session?.user?.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, filteredUsers.length)} of {filteredUsers.length}</span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ))}
              <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateUser}>Create User</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="john@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="team_member">Team Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
