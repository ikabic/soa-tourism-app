const BASE = '';

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

export const api = {
  login: (username, password) =>
    req('POST', '/stakeholders/login', { username, password }),

  register: (data) =>
    req('POST', '/stakeholders/register', data),

  createTour: (data, token) =>
    req('POST', '/tours/tours', data, token),

  getMyTours: (token) =>
    req('GET', '/tours/tours/my', undefined, token),

  getTour: (id, token) =>
    req('GET', `/tours/tours/${id}`, undefined, token),

  getPublicTour: (id, token) =>
    req('GET', `/tours/tours/${id}/public`, undefined, token),

  getPublishedTours: (token) =>
    req('GET', '/tours/tours/published', undefined, token),

  publishTour: (id, token) =>
    req('PUT', `/tours/tours/${id}/publish`, null, token),

  updateTour: (id, data, token) =>
    req('PUT', `/tours/tours/${id}`, data, token),

  getProfile: (token) =>
    req('GET', '/stakeholders/profile', undefined, token),

  updateProfile: (data, token) =>
    req('PUT', '/stakeholders/profile', data, token),

  archiveTour: (id, token) =>
    req('PUT', `/tours/tours/${id}/archive`, null, token),

  activateTour: (id, token) =>
    req('PUT', `/tours/tours/${id}/activate`, null, token),

  addKeyPoint: (tourId, data, token) =>
    req('POST', `/tours/tours/${tourId}/keypoints`, data, token),

  getKeyPoints: (tourId, token) =>
    req('GET', `/tours/tours/${tourId}/keypoints`, undefined, token),

  addDuration: (tourId, data, token) =>
    req('POST', `/tours/tours/${tourId}/durations`, data, token),

  getAllUsers: (token) =>
    req('GET', '/stakeholders/admin/users', undefined, token),

  blockUser: (id, token) =>
    req('PUT', `/stakeholders/admin/users/${id}/block`, null, token),

  getCart: (token) =>
    req('GET', '/purchase/cart', undefined, token),

  addToCart: (data, token) =>
    req('POST', '/purchase/cart', data, token),

  removeCartItem: (itemId, token) =>
    req('DELETE', `/purchase/cart/${itemId}`, undefined, token),

  checkoutCart: (token) =>
    req('POST', '/purchase/checkout', null, token),

  getPurchases: (token) =>
    req('GET', '/purchase/purchases', undefined, token),
};
