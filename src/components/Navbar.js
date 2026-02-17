import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
      onSearch && onSearch(query.trim());
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Ag<span>o</span>ra
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="navbar-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search discussions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/new-thread" className="btn btn-warm btn-sm">
                + Write
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
              )}
              <div className="navbar-user">
                <div className="avatar">{user.username[0].toUpperCase()}</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>{user.username}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
