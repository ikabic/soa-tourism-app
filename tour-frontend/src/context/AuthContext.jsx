import { createContext, useContext, useState, useCallback } from 'react';
import { decodeJwt } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wayfare_token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('wayfare_token');
    return t ? decodeJwt(t) : null;
  });

  const login = useCallback((newToken) => {
    localStorage.setItem('wayfare_token', newToken);
    setToken(newToken);
    setUser(decodeJwt(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wayfare_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
