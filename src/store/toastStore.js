import { create } from 'zustand'

// Sistema de notificaciones toast sin dependencias externas
const useToastStore = create((set) => ({
  toasts: [],

  toast: (message, type = 'success') => {
    const id = Date.now()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export default useToastStore
