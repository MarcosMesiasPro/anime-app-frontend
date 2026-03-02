import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore.js'

// Redirige al login si el usuario no está autenticado
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
