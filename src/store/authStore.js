import { create } from 'zustand';
import { api } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Inicia en true para comprobar la sesión al cargar la app
  error: null,

  // Acción para verificar si el usuario ya tiene una sesión activa (cookie válida)
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/me');
      set({ 
        user: response.data.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Acción para iniciar sesión
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Acción para registrarse
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { username, email, password });
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Acción para cerrar sesión
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      // Forzamos el cierre en el cliente de todos modos
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Limpiar errores del estado
  clearError: () => set({ error: null })
}));

export default useAuthStore;
