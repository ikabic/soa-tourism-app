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
  register: (data) =>
    req('POST', '/stakeholders/register', data),
  
  login: (username, password) =>
    req('POST', '/stakeholders/login', { username, password }),

  getProfileByUsername: (token, username) =>
    req('GET', `/stakeholders/profile/${username}`, undefined, token),

  getProfiles: (ids) =>
    req('GET', `/stakeholders/profiles?ids=${ids}`, undefined, undefined),

  updateProfile: async (patch, token) => {
    const form = new FormData();
    if (patch.name      !== undefined) form.append('name',      patch.name);
    if (patch.last_name !== undefined) form.append('last_name', patch.last_name);
    if (patch.motto     !== undefined) form.append('motto',     patch.motto);
    if (patch.biography !== undefined) form.append('biography', patch.biography);
    if (patch.avatar    instanceof File) form.append('avatar',  patch.avatar);
    if (patch.current_latitude !== undefined && patch.current_latitude !== null) {
      form.append('current_latitude', patch.current_latitude.toString());
    }
    if (patch.current_longitude !== undefined && patch.current_longitude !== null) {
      form.append('current_longitude', patch.current_longitude.toString());
    }

    const res = await fetch('/stakeholders/profile', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: form });
    if (!res.ok) return res.text().then(t => { throw new Error(t || `HTTP ${res.status}`); });
    return await res.json();
  }
};
