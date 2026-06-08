import { ROLES } from '../constants/roles';

export function getPostLoginPath(user, fromPath) {
  const blocked = ['/login', '/signup', '/'];
  const safeFrom =
    fromPath && !blocked.includes(fromPath) && !fromPath.startsWith('/admin')
      ? fromPath
      : null;

  if (user.role === ROLES.ADMIN) {
    return safeFrom || '/admin';
  }

  if (safeFrom) {
    return safeFrom;
  }

  return '/dashboard';
}
