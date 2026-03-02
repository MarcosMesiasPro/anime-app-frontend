import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { anilistApi, api } from '../services/api';
import useAuthStore from '../store/authStore';
import { Star, Tv, Calendar, Heart, MessageSquare, Trash2, ThumbsUp } from 'lucide-react';

const ANIME_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        userPreferred
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
      episodes
      status
      format
      genres
      averageScore
      seasonYear
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
`;

const AnimeDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  
  // Estados para AniList
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para nuestro Backend (Favoritos)
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // Estados para nuestro Backend (Comentarios)
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Estados para edición de comentarios
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        // 1. Obtener detalles del anime desde AniList
        const data = await anilistApi(ANIME_DETAIL_QUERY, { id: parseInt(id) });
        setAnime(data.Media);

        // 2. Obtener comentarios desde nuestro backend
        const commentsRes = await api.get(`/comments/anime/${id}`);
        setComments(commentsRes.data.data);

        // 3. Si el usuario está logueado, verificar si es su favorito
        if (isAuthenticated) {
          const favRes = await api.get(`/favorites/check/${id}`);
          if (favRes.data.isFavorite) {
            setIsFavorite(true);
            setFavoriteId(favRes.data.data._id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para añadir a favoritos');
    
    try {
      setFavLoading(true);
      if (isFavorite) {
        // Eliminar favorito
        await api.delete(`/favorites/${favoriteId}`);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        // Añadir favorito
        const res = await api.post('/favorites', {
          animeId: anime.id,
          animeTitle: anime.title.userPreferred,
          animeImage: anime.coverImage.large
        });
        setIsFavorite(true);
        setFavoriteId(res.data.data._id);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const res = await api.post('/comments', {
        animeId: anime.id,
        text: newComment
      });
      // Añadir el nuevo comentario al inicio de la lista
      setComments([res.data.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Seguro que quieres borrar este comentario?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await api.put(`/comments/${commentId}`, { text: editText });
      setComments(comments.map(c => c._id === commentId ? res.data.data : c));
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isAuthenticated) return alert('Debes iniciar sesión para dar me gusta');
    try {
      const res = await api.put(`/comments/${commentId}/like`);
      // Actualizar la lista de comentarios con los nuevos likes
      setComments(comments.map(c => {
        if (c._id === commentId) {
          return { ...c, likes: res.data.likes };
        }
        return c;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!anime) return <div className="text-center py-20 text-red-500">No se encontró el anime.</div>;

  return (
    <div className="-mx-4 sm:mx-0">
      {/* Banner */}
      <div className="w-full h-64 md:h-80 relative bg-gray-800 rounded-b-none sm:rounded-xl overflow-hidden mb-8">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-dark to-primary/20"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
      </div>

      <div className="px-4 sm:px-0 max-w-5xl mx-auto -mt-32 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna Izquierda: Cover y Acciones */}
        <div className="col-span-1 flex flex-col items-center md:items-start">
          <img 
            src={anime.coverImage.extraLarge} 
            alt={anime.title.userPreferred} 
            className="w-56 md:w-full rounded-lg shadow-2xl border-4 border-gray-800"
          />
          
          <button 
            onClick={toggleFavorite}
            disabled={favLoading || !isAuthenticated}
            className={`mt-4 w-full md:w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors ${
              isFavorite 
                ? 'bg-secondary/20 text-secondary border border-secondary hover:bg-secondary/30' 
                : 'bg-primary hover:bg-indigo-600 text-white'
            } ${(!isAuthenticated || favLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart size={20} className={isFavorite ? 'fill-secondary' : ''} />
            {isFavorite ? 'En Favoritos' : 'Añadir a Favoritos'}
          </button>
          {!isAuthenticated && <p className="text-xs text-gray-500 mt-2 text-center w-full">Inicia sesión para guardar</p>}

          <div className="w-full mt-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 font-semibold">Formato</span>
                <span>{anime.format || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 font-semibold">Episodios</span>
                <span>{anime.episodes || 'En emisión'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 font-semibold">Estado</span>
                <span className="capitalize">{anime.status.toLowerCase()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 font-semibold">Temporada</span>
                <span>{anime.seasonYear || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Estudio</span>
                <span>{anime.studios?.nodes[0]?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Detalles y Comentarios */}
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{anime.title.userPreferred}</h1>
          {anime.title.english && <h2 className="text-lg text-gray-400 mb-4">{anime.title.english}</h2>}
          
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres.map(genre => (
              <span key={genre} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700">
                {genre}
              </span>
            ))}
            {anime.averageScore && (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm rounded-full border border-yellow-500/20 flex items-center gap-1 font-bold">
                <Star size={14} className="fill-yellow-500" />
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed mb-10" 
               dangerouslySetInnerHTML={{ __html: anime.description || 'No hay descripción disponible.' }} />

          {/* Sección de Comentarios */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare size={24} className="text-primary" />
              Comentarios ({comments.length})
            </h3>

            {/* Formulario de Comentario */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  rows="3"
                  placeholder="¿Qué te pareció este anime?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button 
                    type="submit" 
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {commentLoading ? 'Publicando...' : 'Comentar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 text-center mb-8">
                <p className="text-gray-400">Debes iniciar sesión para dejar un comentario.</p>
              </div>
            )}

            {/* Lista de Comentarios */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aún no hay comentarios. ¡Sé el primero!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="bg-gray-900 rounded-lg p-4 flex gap-4 border border-gray-800/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 overflow-hidden">
                      {comment.user.avatar !== 'default-avatar.png' ? (
                        <img src={comment.user.avatar} alt={comment.user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                          {comment.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-200">{comment.user.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {editingCommentId === comment._id ? (
                        <div className="mb-3">
                          <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary text-sm"
                            rows="2"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-400 hover:text-white">Cancelar</button>
                            <button onClick={() => handleUpdateComment(comment._id)} className="text-xs bg-primary text-white px-3 py-1 rounded">Guardar</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-300 text-sm mb-3">{comment.text}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs">
                        <button 
                          onClick={() => handleToggleLike(comment._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            isAuthenticated && comment.likes.includes(user?._id || user?.id) 
                              ? 'text-white' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <ThumbsUp size={14} className={isAuthenticated && comment.likes.includes(user?._id || user?.id) ? 'text-white fill-white' : ''} />
                          <span className={isAuthenticated && comment.likes.includes(user?._id || user?.id) ? 'text-white font-bold' : ''}>
                            {comment.likes.length}
                          </span>
                        </button>
                        
                        {/* Botones editar/borrar solo si el usuario logueado es el dueño y no está editando ya */}
                        {isAuthenticated && (user?._id === comment.user._id || user?.id === comment.user._id) && editingCommentId !== comment._id && (
                          <div className="flex items-center gap-3 ml-auto">
                            <button 
                              onClick={() => handleEditClick(comment)}
                              className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;