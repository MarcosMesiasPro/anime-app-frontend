import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Trash2 } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavorites(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('No se pudieron cargar tus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id, e) => {
    e.preventDefault(); // Prevenir que el click del botón navegue a AnimeDetail
    if (!window.confirm('¿Eliminar este anime de tus favoritos?')) return;
    
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(favorites.filter(fav => fav._id !== id));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Hubo un error al eliminar el favorito.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tus Favoritos</h1>
        <p className="text-gray-400">La lista de animes que has guardado.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">
          {error}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-12">
          <Star size={48} className="mx-auto text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">No tienes favoritos aún</h2>
          <p className="text-gray-500 mb-6">Explora animes y guárdalos para verlos aquí.</p>
          <Link to="/" className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Explorar Animes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map((fav) => (
            <Link 
              to={`/anime/${fav.animeId}`} 
              key={fav._id}
              className="group relative flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-secondary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/20"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-800">
                <img 
                  src={fav.animeImage} 
                  alt={fav.animeTitle} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Botón de eliminar superpuesto */}
                <button
                  onClick={(e) => handleRemoveFavorite(fav._id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                  title="Eliminar de favoritos"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-secondary transition-colors">
                  {fav.animeTitle}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;