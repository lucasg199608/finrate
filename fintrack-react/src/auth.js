const AUTH_KEY = "fintrack.app.auth";

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export const isAuthenticated = () => {
  const user = getStoredUser();
  return user?.isLoggedIn === true;
};

// Simple hash pour stockage local uniquement (non sécurisé pour production)
const simpleHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(16);
};

export const login = (email, password) => {
  const users = getUserRegistry();
  const found = users.find(u => u.email === email && u.passwordHash === simpleHash(password));
  if (found) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, email }));
    return { success: true };
  }
  return { success: false, error: "Email ou mot de passe incorrect." };
};

export const register = (email, password) => {
  const users = getUserRegistry();
  if (users.find(u => u.email === email)) {
    return { success: false, error: "Ce compte existe déjà." };
  }
  const updated = [...users, { email, passwordHash: simpleHash(password) }];
  window.localStorage.setItem("fintrack.app.users", JSON.stringify(updated));
  window.localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, email }));
  return { success: true };
};

export const logout = () => {
  window.localStorage.removeItem(AUTH_KEY);
};

const getUserRegistry = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("fintrack.app.users");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
