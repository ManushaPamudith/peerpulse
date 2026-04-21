import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem('peerpulse_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('peerpulse_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('peerpulse_token', data.token);
    setUser(data.user);
    return data;
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('peerpulse_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('peerpulse_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get('/users/profile');
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
