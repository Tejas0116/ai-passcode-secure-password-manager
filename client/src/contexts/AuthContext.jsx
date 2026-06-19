import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  // Set axios default authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Base URL for API requests
  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/api/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Failed to verify token:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Handle auto-logout on inactivity
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      if (!user) return;
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      
      logoutTimerRef.current = setTimeout(() => {
        alert('Session Expired due to inactivity. Logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    if (user) {
      resetTimer();
      const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        events.forEach(event => window.removeEventListener(event, resetTimer));
      };
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, username: data.username });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, username: data.username });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/me', profileData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      setUser({ _id: data._id, name: data.name, username: data.username });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/api/auth/me');
      logout();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
