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
    // Initialize default admin if no admin exists
    const existingUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    const adminExists = existingUsers.some(u => u.role === 'admin');
    
    if (!adminExists) {
      const defaultAdmin = {
        id: 'admin-system',
        name: 'System Administrator',
        email: 'admin@facilitypro.com',
        password: 'Admin@123456', // Development only
        role: 'admin',
        createdAt: new Date('2024-01-01').toISOString(),
      };
      const updatedUsers = [...existingUsers, defaultAdmin];
      localStorage.setItem('local_users', JSON.stringify(updatedUsers));
    }

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
      if (import.meta.env.VITE_USE_LOCAL_AUTH === 'true') {
        const users = getLocalUsers();
        const found = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
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
            case 'admin':
              navigate('/dashboard');
              break;
            case 'technician':
              navigate('/technician-portal');
              break;
            case 'vendor':
              navigate('/vendor-portal');
              break;
            case 'finance':
              navigate('/finance-portal');
              break;
            case 'staff':
              navigate('/staff-portal');
              break;
            default:
              navigate('/dashboard');
          }

          return { success: true };
        }
        toast.error('Login failed');
        throw new Error('Login failed');
      }

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
        case 'admin':
          navigate('/dashboard');
          break;
        case 'technician':
          navigate('/technician-portal');
          break;
        case 'vendor':
          navigate('/vendor-portal');
          break;
        case 'finance':
          navigate('/finance-portal');
          break;
        case 'staff':
          navigate('/staff-portal');
          break;
        default:
          navigate('/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      // Fallback to localStorage users when API is unavailable or registration API isn't set up
      try {
        const users = getLocalUsers();
        const found = users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
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
            case 'admin':
              navigate('/dashboard');
              break;
            case 'technician':
              navigate('/technician-portal');
              break;
            case 'vendor':
              navigate('/vendor-portal');
              break;
            case 'finance':
              navigate('/finance-portal');
              break;
            case 'staff':
              navigate('/staff-portal');
              break;
            default:
              navigate('/dashboard');
          }

          return { success: true };
        }
      } catch (e) {
        // ignore
      }

      // Show a short, generic message only (do not display server-provided messages).
      toast.error('Login failed');
      throw new Error('Login failed');
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      // Try API first
      const response = await axiosInstance.post('/auth/register', userData);
      // Ensure we have a local record for development fallback so users can sign in
      try {
        const users = getLocalUsers();
        if (!users.find(u => u.email === userData.email)) {
          users.push({
            id: `local-${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'technician',
            password: userData.password,
          });
          saveLocalUsers(users);
        }
      } catch (e) {
        // ignore local save failures
      }

      // Do NOT auto-login after registration; inform the user and redirect to login
      toast.success('Registration successful — please sign in');
      navigate('/login');
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

        // Do NOT set token or auto-login for local registrations; redirect to login instead
        toast.success('Registration successful (local) — please sign in');
        navigate('/login');
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
    navigate('/');
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
