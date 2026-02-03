import { useState } from 'react';
import { createPaste } from '../api';

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUrl(null);
    setLoading(true);

    try {
      const body = { content };
      if (ttlSeconds.trim()) body.ttl_seconds = parseInt(ttlSeconds, 10);
      if (maxViews.trim()) body.max_views = parseInt(maxViews, 10);

      const data = await createPaste(body);
      setUrl(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-4">Pastebin-Lite</h1>
      <p className="text-muted mb-4">Create a shareable paste</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea
            id="content"
            className="form-control"
            rows="8"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="ttl" className="form-label">TTL (seconds, optional)</label>
            <input
              id="ttl"
              type="number"
              className="form-control"
              min="1"
              placeholder="e.g. 60"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="maxViews" className="form-label">Max views (optional)</label>
            <input
              id="maxViews"
              type="number"
              className="form-control"
              min="1"
              placeholder="e.g. 5"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-3">{error}</div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {url && (
        <div className="mt-4">
          <label className="form-label">Shareable URL</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={url}
              readOnly
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => navigator.clipboard.writeText(url)}
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </>
  );
}
