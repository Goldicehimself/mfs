import api from './axiosConfig';

export async function login(credentials) {
  // placeholder
  return { success: true };
}

export async function logout() {
  // placeholder
  return { success: true };
}

export async function requestPasswordReset(email) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    return { success: true };
  }
}
