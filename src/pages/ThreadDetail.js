import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ThreadDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/threads/${slug}`)
      .then(r => {
        setThread(r.data.thread);
        setPost(r.data.post);
      })
      .catch(() => setError('Thread not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleUpvotePost = async () => {
    if (!user) return navigate('/login');
    try {
      await API.post(`/threads/${thread.id}/upvote`);
      setPost(p => ({ ...p, originalPost: { ...p.originalPost, upvotes: (p.originalPost.upvotes || 0) + 1 } }));
    } catch {}
  };

  const handleUpvoteComment = async (commentId) => {
    if (!user) return navigate('/login');
    try {
      await API.post(`/threads/${thread.id}/comments/${commentId}/upvote`);
      setPost(p => ({
        ...p,
        comments: p.comments.map(c => c._id === commentId ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c)
      }));
    } catch {}
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await API.post(`/threads/${thread.id}/comments`, {
        content: reply,
        parentCommentId: replyTo || null,
      });
      setReply('');
      setReplyTo(null);
      const r = await API.get(`/threads/${slug}`);
      setPost(r.data.post);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-loading" style={{ marginTop: 80 }}>
      <div className="spinner" />
      Loading discussion...
    </div>
  );

  if (error) return (
    <div className="page"><div className="container-narrow">
      <div className="empty-state">
        <div className="empty-state-icon">✦</div>
        <h3>{error}</h3>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>← Back to home</Link>
      </div>
    </div></div>
  );

  const comments = post?.comments || [];
  const topLevel = comments.filter(c => !c.parentCommentId && !c.isDeleted);
  const getReplies = (id) => comments.filter(c => c.parentCommentId === id && !c.isDeleted);

  return (
    <div className="page">
      <div className="container-narrow">
        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: '0.85rem', color: 'var(--text3)' }}>
          <Link to="/" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Agora</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: 'var(--text2)' }}>{thread.category_name}</span>
        </div>

        {/* Thread header */}
        <div className="thread-header">
          <div className="thread-header-category">{thread.category_name}</div>
          <h1>{thread.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar avatar-lg">{(thread.author_username || 'A')[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{thread.author_username}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{timeAgo(thread.created_at)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text3)' }}>
              <span>👁 {thread.view_count || 0} views</span>
              <span>💬 {thread.reply_count || 0} replies</span>
            </div>
          </div>
        </div>

        {/* Post body */}
        <div className="thread-body">
          {post?.originalPost?.content}
        </div>

        {/* Upvote post */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <button className="upvote-btn" onClick={handleUpvotePost}>
            ▲ {post?.originalPost?.upvotes || 0} upvotes
          </button>
          {user && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 8 }}
              onClick={() => setReplyTo(null)}
            >
              Reply
            </button>
          )}
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 8 }}>
            {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {topLevel.length === 0 && (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <p>No replies yet. Be the first to respond.</p>
            </div>
          )}

          {topLevel.map(c => (
            <div key={c._id}>
              <div className="comment">
                <div className="comment-header">
                  <div className="avatar">{(c.authorUsername || 'A')[0].toUpperCase()}</div>
                  <span className="comment-author">{c.authorUsername}</span>
                  <span className="comment-time">{timeAgo(c.createdAt)}</span>
                </div>
                <div className="comment-body">{c.content}</div>
                <div className="comment-actions">
                  <button className="upvote-btn" onClick={() => handleUpvoteComment(c._id)}>
                    ▲ {c.upvotes || 0}
                  </button>
                  {user && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setReplyTo(c._id)}>
                      Reply
                    </button>
                  )}
                </div>
              </div>

              {/* Nested replies */}
              {getReplies(c._id).map(r => (
                <div key={r._id} className="reply-comment">
                  <div className="comment-header">
                    <div className="avatar">{(r.authorUsername || 'A')[0].toUpperCase()}</div>
                    <span className="comment-author">{r.authorUsername}</span>
                    <span className="comment-time">{timeAgo(r.createdAt)}</span>
                  </div>
                  <div className="comment-body" style={{ paddingLeft: 0, marginTop: 6 }}>{r.content}</div>
                  <div className="comment-actions" style={{ paddingLeft: 0 }}>
                    <button className="upvote-btn" onClick={() => handleUpvoteComment(r._id)}>▲ {r.upvotes || 0}</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Reply box */}
        {user ? (
          <div className="reply-box">
            {replyTo && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: 10 }}>
                Replying to a comment —{' '}
                <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }} onClick={() => setReplyTo(null)}>Cancel</button>
              </div>
            )}
            <form onSubmit={handleSubmitReply}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <textarea
                  placeholder="Share your thoughts..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  style={{ minHeight: 100 }}
                />
              </div>
              <button className="btn btn-warm" type="submit" disabled={submitting || !reply.trim()}>
                {submitting ? 'Posting...' : 'Post reply'}
              </button>
            </form>
          </div>
        ) : (
          <div className="reply-box" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)', marginBottom: 12 }}>Join the conversation</p>
            <Link to="/login" className="btn btn-primary">Sign in to reply</Link>
            <span style={{ margin: '0 10px', color: 'var(--text3)', fontSize: '0.85rem' }}>or</span>
            <Link to="/register" className="btn btn-outline">Create account</Link>
          </div>
        )}
      </div>
    </div>
  );
}
