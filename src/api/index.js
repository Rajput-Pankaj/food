import { apiRequest, uploadFile, downloadApiFile } from './client';

export const authApi = {
  csrf: () => apiRequest('/auth/csrf'),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST', body: '{}' }),
  logout: () => apiRequest('/auth/logout', { method: 'POST', body: '{}' }),
  me: () => apiRequest('/auth/me'),
  changePassword: (body) =>
    apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const setupApi = {
  status: () => apiRequest('/setup/status'),
  complete: (body) => apiRequest('/setup/complete', { method: 'POST', body: JSON.stringify(body) }),
};

export const ordersApi = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.limit) q.set('limit', String(params.limit));
    const suffix = q.toString() ? `?${q}` : '';
    return apiRequest(`/orders${suffix}`);
  },
  get: (id) => apiRequest(`/orders/${id}`),
  create: (order) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(order) }),
  invoice: (id) => apiRequest(`/orders/${id}/invoice`),
  confirmPayment: (id) =>
    apiRequest(`/orders/${id}/confirm-payment`, { method: 'POST', body: '{}' }),
  assignDriver: (id, body) =>
    apiRequest(`/orders/${id}/assign-driver`, { method: 'POST', body: JSON.stringify(body) }),
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
  track: (body) => apiRequest('/orders/track', { method: 'POST', body: JSON.stringify(body) }),
};

export const menuApi = {
  list: () => apiRequest('/menu'),
  adminList: () => apiRequest('/menu/admin/all'),
  get: (id) => apiRequest(`/menu/${id}`),
  create: (item) => apiRequest('/menu', { method: 'POST', body: JSON.stringify(item) }),
  update: (id, item) =>
    apiRequest(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(item) }),
  remove: (id) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),
  resetSeed: () => apiRequest('/menu/reset-seed', { method: 'POST', body: '{}' }),
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
  stats: () => apiRequest('/admin/stats'),
  audit: (limit = 100) => apiRequest(`/admin/audit?limit=${limit}`),
  contacts: () => apiRequest('/admin/contacts'),
  markContactRead: (id) =>
    apiRequest(`/admin/contacts/${id}/read`, { method: 'PATCH', body: '{}' }),
  exportOrders: () => downloadApiFile('/admin/export/orders', 'orders-export.csv'),
};

export const paymentsApi = {
  verifyRazorpay: (body) =>
    apiRequest('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(body) }),
};

export const contactApi = {
  submit: (body) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

export const promosApi = {
  list: () => apiRequest('/promos'),
  validate: (code, subtotal) =>
    apiRequest('/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  create: (body) => apiRequest('/promos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    apiRequest(`/promos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => apiRequest(`/promos/${id}`, { method: 'DELETE' }),
};

export const favoritesApi = {
  list: () => apiRequest('/favorites'),
  add: (menuItemId) => apiRequest(`/favorites/${menuItemId}`, { method: 'POST', body: '{}' }),
  remove: (menuItemId) => apiRequest(`/favorites/${menuItemId}`, { method: 'DELETE' }),
};

export const mediaApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.folder) query.set('folder', params.folder);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    const suffix = query.toString() ? `?${query}` : '';
    return apiRequest(`/media${suffix}`);
  },
  upload: (file, meta = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (meta.altText) formData.append('altText', meta.altText);
    if (meta.folder) formData.append('folder', meta.folder);
    return uploadFile('/media/upload', formData);
  },
  update: (id, body) =>
    apiRequest(`/media/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => apiRequest(`/media/${id}`, { method: 'DELETE' }),
};
