import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Local users helper (for localStorage fallback)
  const getLocalUsers = () => JSON.parse(localStorage.getItem('local_users') || '[]');
  const saveLocalUsers = (users) => localStorage.setItem('local_users', JSON.stringify(users));

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success('Login successful');
      
      // Redirect based on role
      switch (user.role) {
        case 'facility_manager':
          navigate('/dashboard');
          break;
        case 'technician':
          navigate('/work-orders');
          break;
        case 'vendor':
          navigate('/vendor-portal');
          break;
        default:
          navigate('/service-requests');
      }
      
      return { success: true };
    } catch (error) {
      // Fallback to localStorage users when API is unavailable or registration API isn't set up
      try {
        const users = getLocalUsers();
        const found = users.find(u => u.email === email);
        if (found && found.password === password) {
          const token = `local-${Date.now()}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(found));
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(found);
          toast.success('Login successful (local)');

          // Redirect based on role
          switch (found.role) {
            case 'facility_manager':
              navigate('/dashboard');
              break;
            case 'technician':
              navigate('/work-orders');
              break;
            case 'vendor':
              navigate('/vendor-portal');
              break;
            default:
              navigate('/service-requests');
          }

          return { success: true };
        }
      } catch (e) {
        // ignore
      }

      // Show a short, generic message only (do not display server-provided messages).
      toast.error('Login failed');
      return { success: false, error: error.message };
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      // Try API first
      const response = await axiosInstance.post('/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      toast.success('Registration successful');

      // Redirect based on role
      switch (user.role) {
        case 'facility_manager':
          navigate('/dashboard');
          break;
        case 'technician':
          navigate('/work-orders');
          break;
        case 'vendor':
          navigate('/vendor-portal');
          break;
        default:
          navigate('/service-requests');
      }

      return { success: true };
    } catch (error) {
      // Fallback to localStorage-based registration
      try {
        const users = getLocalUsers();
        if (users.find(u => u.email === userData.email)) {
          const msg = 'Email already registered (local)';
          toast.error(msg);
          return { success: false, error: msg };
        }

        const newUser = {
          id: `local-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'technician',
          avatar: userData.avatar || null,
          // NOTE: storing plaintext password for local dev only
          password: userData.password,
        };

        users.push(newUser);
        saveLocalUsers(users);

        const token = `local-${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(newUser);
        toast.success('Registration successful (local)');

        // Redirect based on role
        switch (newUser.role) {
          case 'facility_manager':
            navigate('/dashboard');
            break;
          case 'technician':
            navigate('/work-orders');
            break;
          case 'vendor':
            navigate('/vendor-portal');
            break;
          default:
            navigate('/service-requests');
        }

        return { success: true };
      } catch (e) {
        // Show a short, generic message only (do not display server-provided messages).
        toast.error('Registration failed');
        return { success: false, error: error.message };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};