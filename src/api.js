const API = '/api';

export function getToken() {
  return localStorage.getItem('moviebox_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('moviebox_token', token);
  else localStorage.removeItem('moviebox_token');
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.errors = data.errors || {};
    throw err;
  }
  return data;
}
