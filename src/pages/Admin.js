import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Shield, Activity, Ban, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function Admin() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [banForm, setBanForm] = useState({ userId: null, reason: '' });
  const [roleForm, setRoleForm] = useState({ userId: null, role: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return navigate('/');
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users?limit=50'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId) => {
    if (!banForm.reason) return setError('Please enter a ban reason.');
    try {
      await API.post(`/admin/users/${userId}/ban`, { reason: banForm.reason });
      setSuccess('User banned successfully.');
      setBanForm({ userId: null, reason: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban user.');
    }
  };

  const unbanUser = async (userId) => {
    await API.post(`/admin/users/${userId}/unban`);
    setSuccess('User unbanned.');
    loadData();
  };

  const changeRole = async (userId) => {
    if (!roleForm.role) return;
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: roleForm.role });
      setSuccess('Role updated.');
      setRoleForm({ userId: null, role: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">

        <div className="page-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage users, monitor activity, and moderate content</p>
        </div>

        {error   && <div className="alert alert-error"   onClick={() => setError('')}>{error} ✕</div>}
        {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success} ✕</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
          {['overview', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 20px', fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
              color: tab === t ? 'var(--accent)' : 'var(--text3)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.users?.total || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.users?.banned || 0}</div>
                <div className="stat-label">Banned Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.threads?.total || 0}</div>
                <div className="stat-label">Total Threads</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.threads?.total_replies || 0}</div>
                <div className="stat-label">Total Replies</div>
              </div>
            </div>

            {stats.activityLast24h?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>Activity (last 24h)</h3>
                {stats.activityLast24h.map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text2)' }}>{a._id}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{a.count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'users' && (
          <>
            <input
              placeholder="Search by username or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 20 }}
            />

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.is_banned ? 0.6 : 1 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>@{u.username}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {roleForm.userId === u.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <select value={roleForm.role} onChange={e => setRoleForm(f => ({ ...f, role: e.target.value }))} style={{ padding: '4px 8px', fontSize: '0.82rem' }}>
                              <option value="">Pick role</option>
                              <option value="user">user</option>
                              <option value="moderator">moderator</option>
                              <option value="admin">admin</option>
                            </select>
                            <button className="btn btn-primary btn-sm" onClick={() => changeRole(u.id)}>✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setRoleForm({ userId: null, role: '' })}>✕</button>
                          </div>
                        ) : (
                          <span
                            className={`badge badge-${u.role === 'admin' ? 'admin' : u.role === 'moderator' ? 'mod' : 'user'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => u.id !== user.id && setRoleForm({ userId: u.id, role: u.role })}
                          >{u.role}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: u.is_banned ? 'var(--danger)' : 'var(--success)', fontSize: '0.82rem' }}>
                          {u.is_banned ? '🚫 Banned' : '✅ Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text3)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.id !== user.id && (
                          u.is_banned ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => unbanUser(u.id)}>
                              <CheckCircle size={13} /> Unban
                            </button>
                          ) : (
                            banForm.userId === u.id ? (
                              <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                                <input
                                  placeholder="Ban reason..."
                                  value={banForm.reason}
                                  onChange={e => setBanForm(f => ({ ...f, reason: e.target.value }))}
                                  style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                                />
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="btn btn-danger btn-sm" onClick={() => banUser(u.id)}>Ban</button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => setBanForm({ userId: null, reason: '' })}>✕</button>
                                </div>
                              </div>
                            ) : (
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                                onClick={() => setBanForm({ userId: u.id, reason: '' })}>
                                <Ban size={13} /> Ban
                              </button>
                            )
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
