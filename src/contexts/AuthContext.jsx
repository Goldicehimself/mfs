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

  const normalizeUser = (value) => {
    if (!value) return value;
    const firstName = value.firstName || value.first_name;
    const lastName = value.lastName || value.last_name;
    const name = value.name || [firstName, lastName].filter(Boolean).join(' ');
    const role = value.role;
    return {
      ...value,
      role,
      id: value.id || value._id,
      name,
    };
  };

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
        orgCode: 'LOCAL',
        createdAt: new Date('2024-01-01').toISOString(),
      };
      const updatedUsers = [...existingUsers, defaultAdmin];
      localStorage.setItem('local_users', JSON.stringify(updatedUsers));
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(normalizeUser(JSON.parse(userData)));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoading(false);
      return;
    }

    if (token && import.meta.env.VITE_USE_LOCAL_AUTH !== 'true') {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance
        .get('/auth/profile')
        .then((response) => {
          const apiUser = normalizeUser(response.data?.data);
          if (apiUser) {
            localStorage.setItem('user', JSON.stringify(apiUser));
            setUser(apiUser);
          }
        })
        .finally(() => setLoading(false));
      return;
    }

    setLoading(false);
  }, []);

  // Local users helper (for localStorage fallback)
  const getLocalUsers = () => JSON.parse(localStorage.getItem('local_users') || '[]');
  const saveLocalUsers = (users) => localStorage.setItem('local_users', JSON.stringify(users));

  const login = async (email, password, orgCode) => {
    try {
      if (import.meta.env.VITE_USE_LOCAL_AUTH === 'true') {
        const users = getLocalUsers();
        const found = users.find(
          u => u.email?.toLowerCase() === email?.toLowerCase() && u.orgCode === orgCode
        );
        if (found && found.password === password) {
          const normalized = normalizeUser(found);
          const token = `local-${Date.now()}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(normalized));
          localStorage.setItem('orgCode', orgCode);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(normalized);
          toast.success('Login successful (local)');

          // Redirect based on role
          switch (normalized.role) {
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

      const response = await axiosInstance.post('/auth/login', { email, password, orgCode });
      const payload = response.data?.data || {};
      const token = payload.token;
      const apiUser = normalizeUser(payload.user);
      
      if (!token || !apiUser) {
        throw new Error('Login failed');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(apiUser));
      localStorage.setItem('orgCode', orgCode);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(apiUser);
      toast.success('Login successful');
      
      // Redirect based on role
      switch (apiUser.role) {
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
        const found = users.find(
          u => u.email?.toLowerCase() === email?.toLowerCase() && u.orgCode === orgCode
        );
        if (found && found.password === password) {
          const normalized = normalizeUser(found);
          const token = `local-${Date.now()}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(normalized));
          localStorage.setItem('orgCode', orgCode);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(normalized);
          toast.success('Login successful (local)');

          // Redirect based on role
          switch (normalized.role) {
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
      const firstName = userData.firstName || (userData.name || '').trim().split(' ')[0] || 'User';
      const lastName =
        userData.lastName ||
        (userData.name || '').trim().split(' ').slice(1).join(' ') ||
        'User';
      const mappedRole = userData.role;
      let response;

      if (userData.mode === 'org') {
        response = await axiosInstance.post('/auth/register-org', {
          organizationName: userData.organizationName,
          industry: userData.industry,
          firstName: firstName || 'User',
          lastName,
          email: userData.email,
          password: userData.password,
        });
      } else {
        const payload = {
          firstName: firstName || 'User',
          lastName,
          email: userData.email,
          password: userData.password,
          role: mappedRole,
        };
        if (userData.orgCode) payload.orgCode = userData.orgCode;
        if (userData.inviteCode) payload.inviteCode = userData.inviteCode;
        response = await axiosInstance.post('/auth/register', payload);
      }
      const payload = response.data?.data || {};
      const apiUser = normalizeUser(payload.user);
      const orgCode = payload.organization?.orgCode || userData.orgCode;
      // Ensure we have a local record for development fallback so users can sign in
      try {
        const users = getLocalUsers();
        if (!users.find(u => u.email === userData.email)) {
          users.push({
            id: apiUser?.id || `local-${Date.now()}`,
            name: apiUser?.name || [firstName, lastName].filter(Boolean).join(' '),
            email: apiUser?.email || userData.email,
            role: apiUser?.role || userData.role || 'technician',
            password: userData.password,
            orgCode,
          });
          saveLocalUsers(users);
        }
      } catch (e) {
        // ignore local save failures
      }

      // Do NOT auto-login after registration; inform the user and redirect to login
      if (userData.mode !== 'org') {
        toast.success('Registration successful - please sign in');
      }
      navigate('/login');
      return { success: true, orgCode, mode: userData.mode };
    } catch (error) {
      // Fallback to localStorage-based registration
      try {
        const users = getLocalUsers();
        if (users.find(u => u.email === userData.email)) {
          const msg = 'Email already registered (local)';
          toast.error(msg);
          return { success: false, error: msg };
        }

        const localOrgCode = userData.orgCode || `LOCAL${Date.now().toString().slice(-4)}`;
        const newUser = {
          id: `local-${Date.now()}`,
          name: [firstName, lastName].filter(Boolean).join(' '),
          email: userData.email,
          role: userData.role || 'technician',
          avatar: userData.avatar || null,
          // NOTE: storing plaintext password for local dev only
          password: userData.password,
          orgCode: localOrgCode,
        };

        users.push(newUser);
        saveLocalUsers(users);

        // Do NOT set token or auto-login for local registrations; redirect to login instead
        if (userData.mode !== 'org') {
          toast.success('Registration successful (local) - please sign in');
        }
        navigate('/login');
        return { success: true, orgCode: localOrgCode, mode: userData.mode };
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
    const updatedUser = normalizeUser({ ...user, ...updates });
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Keep local users in sync so managers/admins can view updates
    try {
      const users = getLocalUsers();
      const updatedUsers = users.map((u) => {
        if (u.id && updatedUser.id && u.id === updatedUser.id) return { ...u, ...updatedUser };
        if (u.email && updatedUser.email && u.email.toLowerCase() === updatedUser.email.toLowerCase()) {
          return { ...u, ...updatedUser };
        }
        return u;
      });
      saveLocalUsers(updatedUsers);
    } catch (e) {
      // ignore local sync failures
    }
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




