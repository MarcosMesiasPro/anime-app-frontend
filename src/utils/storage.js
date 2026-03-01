const AUTH_STORAGE_KEY = 'anime_app_auth';

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (authState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export { AUTH_STORAGE_KEY };
