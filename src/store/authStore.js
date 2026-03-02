import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Persiste en localStorage para mantener sesión al recargar
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore
