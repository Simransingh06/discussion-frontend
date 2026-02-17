import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function NewThread() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', categoryId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/categories').then(r => {
      const cats = r.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setForm(f => ({ ...f, categoryId: cats[0].id }));
    }).catch(() => {});
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/threads', form);
      navigate(`/thread/${data.thread.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create thread.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container-narrow">
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text3)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginTop: 16, letterSpacing: '-0.02em' }}>
            Start a discussion
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 6 }}>Share an idea, ask a question, or spark a conversation.</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                <option value="">Select a category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                placeholder="What's on your mind? Write a clear, specific title."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required minLength={5} maxLength={200}
              />
              <div className="form-hint">{form.title.length}/200 characters</div>
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                placeholder="Elaborate on your topic. The more detail you provide, the better the discussion."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required minLength={10}
                style={{ minHeight: 200 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn-warm btn-lg" type="submit" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish discussion'}
              </button>
              <Link to="/" className="btn btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>

        <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text2)' }}>
          <strong style={{ color: 'var(--text)' }}>Tips for a great discussion:</strong> Be specific in your title, provide context in your content, and be respectful of different viewpoints.
        </div>
      </div>
    </div>
  );
}
