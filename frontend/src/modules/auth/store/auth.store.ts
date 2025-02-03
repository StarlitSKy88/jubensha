import { defineStore } from 'pinia';
import axios from 'axios';
import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  username: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  const setAuthToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('auth_token', newToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  };

  const initialize = async () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setAuthToken(storedToken);
      try {
        await fetchCurrentUser();
      } catch (error) {
        setAuthToken(null);
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token: newToken, user: userData } = response.data;
      setAuthToken(newToken);
      user.value = userData;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: RegisterData) => {
    loading.value = true;
    try {
      const response = await axios.post('/api/auth/register', data);
      const { token: newToken, user: userData } = response.data;
      setAuthToken(newToken);
      user.value = userData;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } finally {
      setAuthToken(null);
      user.value = null;
    }
  };

  const fetchCurrentUser = async () => {
    if (!token.value) return;
    
    loading.value = true;
    try {
      const response = await axios.get('/api/auth/me');
      user.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    loading.value = true;
    try {
      const response = await axios.put('/api/auth/profile', data);
      user.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    initialize,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile
  };
}); 