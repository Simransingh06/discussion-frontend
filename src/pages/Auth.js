import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Ag<span style={{ color: 'var(--accent-warm)' }}>o</span>ra
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginTop: 16, fontWeight: 600 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: 6 }}>Sign in to continue the conversation</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Your password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', borderRadius: 4 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text2)' }}>
            New to Agora?{' '}
            <Link to="/register" style={{ color: 'var(--accent-warm)', fontWeight: 500 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a stronger password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Ag<span style={{ color: 'var(--accent-warm)' }}>o</span>ra
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginTop: 16, fontWeight: 600 }}>Join Agora</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: 6 }}>Create your account — it's free</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input placeholder="johndoe" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required minLength={3} maxLength={30} />
              <div className="form-hint">At least 3 characters</div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 8 chars" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={8} />
              <div className="form-hint">Must include uppercase, lowercase, and a number (e.g. SecurePass1)</div>
            </div>
            <button className="btn btn-warm btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', borderRadius: 4 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text2)' }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: 'var(--accent-warm)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
