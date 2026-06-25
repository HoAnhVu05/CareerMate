import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for storage changes in other tabs (prevents session crosstalk)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!storedUser || !storedToken) {
          // Logged out in another tab
          console.log('Session cleared in another tab. Redirecting...');
          setUser(null);
          window.location.href = '/login';
          return;
        }

        try {
          const newUser = JSON.parse(storedUser);
          setUser(prevUser => {
            if (!prevUser || prevUser.id !== newUser.id) {
              console.log('Session changed in another tab. Reloading...');
              setTimeout(() => window.location.reload(), 0);
            }
            return newUser;
          });
        } catch (err) {
          console.error('Error parsing changed storage user:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const oauthLogin = async (oauthData) => {
    try {
      const data = await api.oauthLogin(oauthData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    oauthLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

