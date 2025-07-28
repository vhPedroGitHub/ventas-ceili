import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar interceptor de axios para incluir token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/profile');
          setUser(response.data);
        } catch (error) {
          // Token inválido
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el login'
      };
    }
  };

  const register = async (email, password, nombre) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        nombre
      });

      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error en el registro'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/refresh-token');
      const { token: newToken } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
