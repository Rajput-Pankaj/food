const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE = 'fe_access';
export const REFRESH_COOKIE = 'fe_refresh';
export const CSRF_COOKIE = 'fe_csrf';

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
};

export function setAccessCookie(res, token) {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function setCsrfCookie(res, token) {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}
