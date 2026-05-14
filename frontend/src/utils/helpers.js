export function difficultyClass(value) {
  if (value === 'Easy') return 'diff-easy';
  if (value === 'Hard') return 'diff-hard';
  return 'diff-med';
}

export function difficultyTicks(value) {
  if (value === 'Easy') return 1;
  if (value === 'Hard') return 3;
  return 2;
}

export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice((b64.length % 4) || 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
