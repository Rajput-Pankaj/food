import { apiRequest } from './client';

export const authApi = {
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiRequest('/auth/me'),
};

export const ordersApi = {
  list: () => apiRequest('/orders'),
  get: (id) => apiRequest(`/orders/${id}`),
  create: (order) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(order) }),
  accept: (id, note) =>
    apiRequest(`/orders/${id}/accept`, { method: 'POST', body: JSON.stringify({ note }) }),
  reject: (id, note) =>
    apiRequest(`/orders/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
  advance: (id, note) =>
    apiRequest(`/orders/${id}/advance`, { method: 'POST', body: JSON.stringify({ note }) }),
  setStatus: (id, status, note) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
};

export const menuApi = {
  list: () => apiRequest('/menu'),
  adminList: () => apiRequest('/menu/admin/all'),
  get: (id) => apiRequest(`/menu/${id}`),
  create: (item) => apiRequest('/menu', { method: 'POST', body: JSON.stringify(item) }),
  update: (id, item) =>
    apiRequest(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(item) }),
  remove: (id) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),
  resetSeed: () => apiRequest('/menu/reset-seed', { method: 'POST' }),
};

export const settingsApi = {
  get: () => apiRequest('/settings'),
  save: (settings) =>
    apiRequest('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
};

export const customerApi = {
  getProfile: () => apiRequest('/customer/profile'),
  saveProfile: (profile) =>
    apiRequest('/customer/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  getAddresses: () => apiRequest('/customer/addresses'),
  createAddress: (address) =>
    apiRequest('/customer/addresses', { method: 'POST', body: JSON.stringify(address) }),
  updateAddress: (id, address) =>
    apiRequest(`/customer/addresses/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  deleteAddress: (id) => apiRequest(`/customer/addresses/${id}`, { method: 'DELETE' }),
  getReviews: () => apiRequest('/customer/reviews'),
  saveReview: (review) =>
    apiRequest('/customer/reviews', { method: 'POST', body: JSON.stringify(review) }),
  deleteReview: (id) => apiRequest(`/customer/reviews/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  list: () => apiRequest('/users'),
  update: (id, body) =>
    apiRequest(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const blogsApi = {
  list: () => apiRequest('/blogs'),
  adminList: () => apiRequest('/blogs/admin/all'),
  getBySlug: (slug) => apiRequest(`/blogs/slug/${slug}`),
  create: (post) => apiRequest('/blogs', { method: 'POST', body: JSON.stringify(post) }),
  update: (id, post) =>
    apiRequest(`/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(post) }),
  remove: (id) => apiRequest(`/blogs/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
  seed: () => apiRequest('/admin/seed', { method: 'POST' }),
  stats: () => apiRequest('/admin/stats'),
};
