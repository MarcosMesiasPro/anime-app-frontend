import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Heart } from 'lucide-react';
import useAuthStore from '../store/authStore';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-darker border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Buscador */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:text-indigo-400 transition-colors flex-shrink-0">
              <Film size={28} />
              <span className="text-xl font-bold tracking-wider hidden sm:block">AniTrack</span>
            </Link>
            
            {/* Barra de Búsqueda */}
            <div className="flex-1 max-w-xl px-4 lg:px-8">
              <SearchBar />
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link to="/favorites" className="text-gray-300 hover:text-white flex items-center space-x-1 transition-colors">
                  <Heart size={18} />
                  <span className="hidden sm:inline">Favoritos</span>
                </Link>
                
                <Link to="/profile" className="text-gray-300 hover:text-white flex items-center space-x-1 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 overflow-hidden">
                    {user?.avatar && user.avatar !== 'default-avatar.png' ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-primary" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{user?.username}</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 flex items-center space-x-1 transition-colors ml-4"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors font-medium">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;