export function getToken() {
  return localStorage.getItem('access_token');
}

export function setToken(token) {
  localStorage.setItem('access_token', token);
}

export function removeToken() {
  localStorage.removeItem('access_token');
}

export function getUserRole() {
  const role = localStorage.getItem('user_role');
  return role;
}

export function setUserRole(role) {
  localStorage.setItem('user_role', role);
}

export function removeUserRole() {
  localStorage.removeItem('user_role');
}
