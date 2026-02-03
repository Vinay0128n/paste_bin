function getApiUrl(path) {
  const base = process.env.REACT_APP_API_URL;
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

export async function createPaste(data) {
  const res = await fetch(getApiUrl('/api/pastes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create paste');
  }
  return json;
}

export async function getPaste(id) {
  const res = await fetch(getApiUrl(`/api/pastes/${id}`));
  let json;
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  if (!res.ok) {
    throw new Error(json.error || 'Paste not found or expired');
  }
  return json;
}
