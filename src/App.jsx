import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Componentes (Los crearemos a continuación)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AnimeDetail from './pages/AnimeDetail';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import SearchResults from './pages/SearchResults';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-dark flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/search" element={<SearchResults />} />
            
            {/* Rutas de Autenticación (Solo si NO estás logueado) */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Rutas Privadas (Solo si ESTÁS logueado) */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
