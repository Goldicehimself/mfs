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

  const getFirstName = (value) => {
    if (!value) return 'there';
    if (value.firstName) return value.firstName;
    if (value.first_name) return value.first_name;
    if (value.name) return value.name.split(' ')[0];
    return 'there';
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDialCode = (value) => {
    const match = String(value || '').trim().match(/^(\+\d{1,4})/);
    return match ? match[1] : null;
  };

  const recordLoginHistory = (value, status = 'Success') => {
    try {
      const entry = {
        id: `lh-${Date.now()}`,
        time: new Date().toISOString(),
        location: 'Web',
        status,
        userId: value?.id || null,
        email: value?.email || null,
      };
      const existing = JSON.parse(localStorage.getItem('login_history') || '[]');
      const next = [entry, ...existing].slice(0, 50);
      localStorage.setItem('login_history', JSON.stringify(next));
    } catch (e) {
      // ignore local storage failures
    }
  };

  const showLoginGreeting = (value) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';
    const firstName = getFirstName(value);
    toast.success(`Welcome, ${firstName}. ${getTimeGreeting()} (${timeZone})`);
  };

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
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && userData) {
      setUser(normalizeUser(JSON.parse(userData)));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setLoading(false);
      return;
    }

    if (storedToken && import.meta.env.VITE_USE_LOCAL_AUTH !== 'true') {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
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

  const login = async (email, password, orgCode, rememberMe = false) => {
    try {
      if (import.meta.env.VITE_USE_LOCAL_AUTH === 'true') {
        const users = getLocalUsers();
        const found = users.find(
          u => u.email?.toLowerCase() === email?.toLowerCase() && u.orgCode === orgCode
        );
        if (found && found.password === password) {
          const normalized = normalizeUser(found);
          const token = `local-${Date.now()}`;
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('token', token);
          storage.setItem('user', JSON.stringify(normalized));
          storage.setItem('orgCode', orgCode);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(normalized);
          showLoginGreeting(normalized);
          recordLoginHistory(normalized);

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

      const response = await axiosInstance.post('/auth/login', { email, password, orgCode, rememberMe });
      const payload = response.data?.data || {};
      const token = payload.token;
      const apiUser = normalizeUser(payload.user);
      
      if (!token || !apiUser) {
        throw new Error('Login failed');
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(apiUser));
      storage.setItem('orgCode', orgCode);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(apiUser);
      showLoginGreeting(apiUser);
      recordLoginHistory(apiUser);
      
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
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('token', token);
          storage.setItem('user', JSON.stringify(normalized));
          storage.setItem('orgCode', orgCode);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(normalized);
          showLoginGreeting(normalized);
          recordLoginHistory(normalized);

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
          phone: userData.phone,
          phoneCountryCode: userData.phoneCountryCode || getDialCode(userData.phone),
        });
      } else {
        const payload = {
          firstName: firstName || 'User',
          lastName,
          email: userData.email,
          password: userData.password,
          role: mappedRole,
          phone: userData.phone,
          phoneCountryCode: userData.phoneCountryCode || getDialCode(userData.phone),
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
            phone: userData.phone || null,
            phoneCountryCode: userData.phoneCountryCode || getDialCode(userData.phone),
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
          phone: userData.phone || null,
          phoneCountryCode: userData.phoneCountryCode || getDialCode(userData.phone),
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
    localStorage.removeItem('orgCode');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('orgCode');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/');
    toast.info('Logged out successfully');
  };

  const updateUser = (updates) => {
    const updatedUser = normalizeUser({ ...user, ...updates });
    setUser(updatedUser);
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));

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




