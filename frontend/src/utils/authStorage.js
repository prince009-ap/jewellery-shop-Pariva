const USER_TOKEN_KEY = "token";
const USER_DATA_KEY = "user";

export const migrateLegacyUserSession = () => {
  const legacyToken = localStorage.getItem(USER_TOKEN_KEY);
  const legacyUser = localStorage.getItem(USER_DATA_KEY);
  const sessionToken = sessionStorage.getItem(USER_TOKEN_KEY);
  const sessionUser = sessionStorage.getItem(USER_DATA_KEY);

  if (!sessionToken && legacyToken) {
    sessionStorage.setItem(USER_TOKEN_KEY, legacyToken);
  }

  if (!sessionUser && legacyUser) {
    sessionStorage.setItem(USER_DATA_KEY, legacyUser);
  }

  if (legacyToken) {
    localStorage.removeItem(USER_TOKEN_KEY);
  }

  if (legacyUser) {
    localStorage.removeItem(USER_DATA_KEY);
  }
};

export const getUserToken = () => sessionStorage.getItem(USER_TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUserSession = (user, token) => {
  if (token) {
    sessionStorage.setItem(USER_TOKEN_KEY, token);
  }

  if (user) {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth:changed"));
};

export const clearUserSession = () => {
  sessionStorage.removeItem(USER_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
  window.dispatchEvent(new Event("auth:changed"));
};
