const baseUrl = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  signin: (payload) => request('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  signout: () => request('/auth/signout', { method: 'POST' }),
  generateReport: (query) => request('/reports/generate', { method: 'POST', body: JSON.stringify({ query }) }),
  getReports: () => request('/reports')
};
