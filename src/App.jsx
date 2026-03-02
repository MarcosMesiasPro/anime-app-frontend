import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AnimeDetailPage from './pages/AnimeDetailPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Rutas públicas
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/anime/:id', element: <AnimeDetailPage /> },
      { path: '/user/:id', element: <ProfilePage /> },

      // Rutas protegidas
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
