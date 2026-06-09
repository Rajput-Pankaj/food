import { API_URL } from '../config/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let csrfToken = null;
let accessToken = null;

function getCsrfFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)fe_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
  csrfToken = null;
}

export async function ensureCsrf() {
  if (csrfToken || getCsrfFromCookie()) {
    csrfToken = csrfToken || getCsrfFromCookie();
    return csrfToken;
  }
  const response = await fetch(`${API_URL}/auth/csrf`, { credentials: 'include' });
  if (!response.ok) return null;
  const data = await response.json();
  csrfToken = data.csrfToken || getCsrfFromCookie();
  return csrfToken;
}

export function setCsrfToken(token) {
  csrfToken = token || getCsrfFromCookie();
}

async function tryRefresh() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return false;
  const data = await response.json();
  if (data.csrfToken) setCsrfToken(data.csrfToken);
  if (data.token) setAccessToken(data.token);
  return true;
}

export async function apiRequest(path, options = {}, retried = false) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const token = csrfToken || (await ensureCsrf());
    if (token) headers['X-CSRF-Token'] = token;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (response.status === 401 && !retried && !path.includes('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiRequest(path, options, true);
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }

  if (data?.csrfToken) setCsrfToken(data.csrfToken);
  if (data?.token) setAccessToken(data.token);
  return data;
}

export async function uploadFile(path, formData) {
  const token = csrfToken || (await ensureCsrf());
  const headers = {};
  if (token) headers['X-CSRF-Token'] = token;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Upload failed (${response.status})`, response.status);
  }

  return data;
}

export async function downloadApiFile(path, filename) {
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new ApiError('Download failed.', response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
