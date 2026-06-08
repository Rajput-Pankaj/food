export function getFirstName(name = '') {
  return name.trim().split(/\s+/).filter(Boolean)[0] || 'there';
}

export function getUserGreeting(name = '') {
  return `Hey ${getFirstName(name)}`;
}

export function getNameInitial(name = '') {
  return getFirstName(name).charAt(0).toUpperCase() || '?';
}
