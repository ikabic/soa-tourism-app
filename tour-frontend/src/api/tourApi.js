const BASE = '';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  createTour: (data, token) =>
    req('POST', '/tours/tours', data, token),

  getMyTours: (token) =>
    req('GET', '/tours/tours/my', undefined, token),

  getTour: (id, token) =>
    req('GET', `/tours/tours/${id}`, undefined, token),

  getPublishedTours: (token) =>
    req('GET', '/tours/tours/published', undefined, token),

  publishTour: (id, token) =>
    req('PUT', `/tours/tours/${id}/publish`, null, token),

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
};
