const BASE = '/blog';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok && res.status !== 304) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204 || res.status === 304) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

async function reqForm(method, path, formData, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData,
    cache: 'no-store',
  });

  if (!res.ok && res.status !== 304) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

export const api = {
  getBlogs: (token) => req('GET', '/blogs', undefined, token),
  getBlog: (id, token) => req('GET', `/blogs/${id}`, undefined, token),
  createBlog: (data, token) => req('POST', '/blogs', data, token),
  getComments: (blogId, token) => req('GET', `/blogs/${blogId}/comments`, undefined, token),
  addComment: (blogId, data, token) => req('POST', `/blogs/${blogId}/comments`, data, token),
  likeBlog: (blogId, token) => req('POST', `/blogs/${blogId}/like`, null, token),
  unlikeBlog: (blogId, token) => req('DELETE', `/blogs/${blogId}/like`, undefined, token),
  getLikeStatus: (blogId, token) => req('GET', `/blogs/${blogId}/like`, undefined, token),
  uploadBlogImage: (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    return reqForm('POST', '/blogs/images', formData, token);
  },
};
