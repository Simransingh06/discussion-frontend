import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SORTS = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Most Popular' },
  { key: 'most_replies', label: 'Most Discussed' },
  { key: 'most_viewed', label: 'Most Viewed' },
];

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Home() {
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('latest');
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
    API.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, limit: 20 });
    if (selectedCat) params.set('categoryId', selectedCat);
    if (search) params.set('search', search);
    API.get(`/threads?${params}`)
      .then(r => setThreads(r.data.threads || []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [sort, selectedCat, search]);

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="hero">
          <h1>Where ideas find <em>their audience.</em></h1>
          <p>Join thoughtful discussions, share knowledge, and connect with curious minds.</p>
          {user && (
            <div style={{ marginTop: 20 }}>
              <Link to="/new-thread" className="btn btn-warm btn-lg">Start a discussion</Link>
            </div>
          )}
        </div>

        <div className="two-col">
          {/* Main */}
          <main>
            {search && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                Showing results for "<strong>{search}</strong>"
              </div>
            )}

            {/* Sort tabs */}
            <div className="sort-tabs">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  className={`sort-tab${sort === s.key ? ' active' : ''}`}
                  onClick={() => setSort(s.key)}
                >{s.label}</button>
              ))}
            </div>

            {/* Thread list */}
            {loading ? (
              <div className="page-loading">
                <div className="spinner" />
                Loading discussions...
              </div>
            ) : threads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✦</div>
                <h3>No discussions yet</h3>
                <p>{search ? 'Try a different search.' : 'Be the first to start one.'}</p>
                {user && <Link to="/new-thread" className="btn btn-primary" style={{ marginTop: 16 }}>Start discussion</Link>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {threads.map((t, i) => (
                  <Link
                    key={t.id}
                    to={`/thread/${t.slug}`}
                    className="thread-card fade-up"
                    style={{ animationDelay: `${i * 0.04}s`, animationFillMode: 'both', opacity: 0 }}
                  >
                    <div className="thread-card-category">
                      {t.category_name || 'General'}
                      {t.is_pinned && <span className="badge badge-pinned" style={{ marginLeft: 8 }}>Pinned</span>}
                    </div>
                    <div className="thread-card-title">{t.title}</div>
                    <div className="thread-card-meta">
                      <div className="thread-card-author">
                        <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.65rem' }}>
                          {(t.author_username || 'A')[0].toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{t.author_username}</span>
                      </div>
                      <div className="thread-card-meta-item">
                        <span>💬</span> {t.reply_count || 0}
                      </div>
                      <div className="thread-card-meta-item">
                        <span>👁</span> {t.view_count || 0}
                      </div>
                      <div className="thread-card-meta-item">
                        {timeAgo(t.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside>
            {stats && (
              <div className="sidebar-section" style={{ marginBottom: 16 }}>
                <div className="sidebar-title">Community</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { v: stats.totalUsers || 0, l: 'Members' },
                    { v: stats.totalThreads || 0, l: 'Threads' },
                    { v: stats.totalPosts || 0, l: 'Posts' },
                    { v: stats.activeToday || 0, l: 'Active today' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg)', borderRadius: 6 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>{v}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <div className="sidebar-title">Categories</div>
              <div>
                <span
                  className={`category-pill${!selectedCat ? ' active' : ''}`}
                  onClick={() => setSelectedCat(null)}
                >All</span>
                {categories.map(c => (
                  <span
                    key={c.id}
                    className={`category-pill${selectedCat === c.id ? ' active' : ''}`}
                    onClick={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
                  >{c.name}</span>
                ))}
              </div>
            </div>

            {!user && (
              <div className="sidebar-section" style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8 }}>Join Agora</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 16 }}>
                  Create an account to post, reply, and upvote.
                </p>
                <Link to="/register" className="btn btn-warm" style={{ width: '100%', justifyContent: 'center' }}>Get started — it's free</Link>
                <div style={{ marginTop: 10 }}>
                  <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Already a member? Sign in</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
