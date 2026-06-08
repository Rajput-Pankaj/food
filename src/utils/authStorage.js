import { ROLES } from '../constants/roles';
import { getJson, setJson, removeKey, storageKeys } from './storage';

const SEED_USERS = [
  {
    name: 'Admin',
    email: 'admin@foodexpress.com',
    password: 'Admin@12345',
    role: ROLES.ADMIN,
  },
  {
    name: 'Demo Customer',
    email: 'customer@foodexpress.com',
    password: 'Customer@123',
    role: ROLES.CUSTOMER,
  },
];

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function toSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || ROLES.CUSTOMER,
  };
}

export function getUsers() {
  return getJson(storageKeys.USERS_KEY, []);
}

export function saveUsers(users) {
  setJson(storageKeys.USERS_KEY, users);
}

export function getSessionUser() {
  const session = getJson(storageKeys.USER_SESSION_KEY, null);
  if (!session) return null;

  const users = getUsers();
  const record = users.find((user) => user.id === session.id);
  if (!record) {
    clearSession();
    return null;
  }

  return toSessionUser(record);
}

export function setSessionUser(user) {
  setJson(storageKeys.USER_SESSION_KEY, user);
}

export function clearSession() {
  removeKey(storageKeys.USER_SESSION_KEY);
}

export async function seedDefaultUsers() {
  const users = getUsers();
  let updated = users.map((user) =>
    user.role ? user : { ...user, role: ROLES.CUSTOMER }
  );
  let changed = updated.length !== users.length;

  for (const seed of SEED_USERS) {
    const exists = updated.some((user) => user.email === seed.email);
    if (!exists) {
      const passwordHash = await hashPassword(seed.password);
      updated.push({
        id: crypto.randomUUID(),
        name: seed.name,
        email: seed.email,
        passwordHash,
        role: seed.role,
        isSeed: true,
        createdAt: new Date().toISOString(),
      });
      changed = true;
    }
  }

  if (changed) {
    saveUsers(updated);
  }
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLES.CUSTOMER,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);
  return toSessionUser(newUser);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }

  return toSessionUser(user);
}

export function updateUserProfile(userId, { name }) {
  const users = getUsers();
  const updated = users.map((user) =>
    user.id === userId ? { ...user, name: name.trim() } : user
  );
  saveUsers(updated);

  const session = getJson(storageKeys.USER_SESSION_KEY, null);
  if (session?.id === userId) {
    const target = updated.find((user) => user.id === userId);
    if (target) {
      setSessionUser(toSessionUser(target));
    }
  }

  return updated.find((user) => user.id === userId);
}

export function updateUserRole(userId, role) {
  const users = getUsers();
  const updated = users.map((user) =>
    user.id === userId ? { ...user, role } : user
  );
  saveUsers(updated);

  const session = getJson(storageKeys.USER_SESSION_KEY, null);
  if (session?.id === userId) {
    const target = updated.find((user) => user.id === userId);
    if (target) {
      setSessionUser(toSessionUser(target));
    }
  }
}

export function getPublicUsers() {
  return getUsers().map(({ id, name, email, role, createdAt }) => ({
    id,
    name,
    email,
    role,
    createdAt,
  }));
}
