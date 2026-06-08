export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const USE_API = Boolean(API_URL);
export const TOKEN_KEY = 'foodexpress_token';
