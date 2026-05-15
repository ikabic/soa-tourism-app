const BASE = '';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }
  
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  follow: (id, token) =>
    req('POST', `/followers/${id}/follow`, undefined, token),

  unfollow: (id, token) =>
    req('DELETE', `/followers/${id}/unfollow`, undefined, token),

  getRecommendations: (userId, token) =>
    req('GET', `/followers/${userId}/recommendations`, undefined, token),
  
  canReadBlog: (authorId, token) =>
    req('GET', `/followers/${authorId}/can-read`, undefined, token),
};
