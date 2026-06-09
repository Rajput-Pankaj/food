export const ACCESS_COOKIE = 'fe_access';
export const REFRESH_COOKIE = 'fe_refresh';
export const CSRF_COOKIE = 'fe_csrf';

/** Whether auth/CSRF cookies should use the Secure flag. */
export function cookieSecure(req) {
  if (process.env.COOKIE_SECURE === 'false') return false;
  if (process.env.COOKIE_SECURE === 'true') return true;

  if (req) {
    const forwarded = req.headers['x-forwarded-proto'];
    if (forwarded) {
      return forwarded.split(',')[0].trim().toLowerCase() === 'https';
    }
    if (req.secure) return true;
  }

  const appUrl = process.env.APP_URL || '';
  if (appUrl.startsWith('https://')) return true;

  return false;
}

function baseOptions(req) {
  const secure = cookieSecure(req);
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'strict' : 'lax',
    path: '/',
  };
}

export function setAccessCookie(res, token, req) {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseOptions(req),
    maxAge: 15 * 60 * 1000,
  });
}

export function setRefreshCookie(res, token, req) {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions(req),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function setCsrfCookie(res, token, req) {
  const secure = cookieSecure(req);
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure,
    sameSite: secure ? 'strict' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}
