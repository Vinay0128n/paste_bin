import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPaste } from '../api';

export default function ViewPaste() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getPaste(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Paste</h2>
      <pre className="bg-light p-3 rounded border" style={{ whiteSpace: 'pre-wrap' }}>
        {data.content}
      </pre>
      {(data.remaining_views !== null || data.expires_at) && (
        <div className="text-muted small mt-2">
          {data.remaining_views !== null && (
            <span>Remaining views: {data.remaining_views}</span>
          )}
          {data.remaining_views !== null && data.expires_at && ' · '}
          {data.expires_at && (
            <span>Expires: {new Date(data.expires_at).toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  );
}
