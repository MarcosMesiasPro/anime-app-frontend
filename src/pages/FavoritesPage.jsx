import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { deleteFavoriteRequest, getFavoritesRequest } from '../api/favorites.api';
import Loader from '../components/Loader';
import useToast from '../hooks/useToast';

const FavoritesPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritesRequest,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFavoriteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast({ message: 'Favorito eliminado', type: 'success' });
    },
    onError: (mutationError) => {
      showToast({
        message: mutationError?.response?.data?.message || 'No se pudo eliminar el favorito',
        type: 'error',
      });
    },
  });

  if (isLoading) return <Loader text="Loading favorites..." />;
  if (isError) return <p className="text-rose-300">Error: {error?.message || 'Unknown'}</p>;

  const favorites = data?.favorites || [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-amber-300">My Favorites</h1>

      {!favorites.length ? (
        <p className="text-sm text-slate-400">No favorites yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <article key={favorite._id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              {favorite.coverImage && (
                <img
                  src={favorite.coverImage}
                  alt={favorite.title}
                  className="mb-3 h-60 w-full rounded-md object-cover"
                />
              )}
              <h2 className="text-lg font-semibold text-slate-100">{favorite.title}</h2>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to={`/anime/${favorite.animeId}`}
                  className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(favorite._id)}
                  className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoritesPage;
