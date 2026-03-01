import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchAnimeDetail } from '../api/anilist';
import {
  createCommentRequest,
  deleteCommentRequest,
  getCommentsByAnimeRequest,
  toggleLikeCommentRequest,
  updateCommentRequest,
} from '../api/comments.api';
import { addFavoriteRequest, deleteFavoriteRequest, getFavoritesRequest } from '../api/favorites.api';
import CommentList from '../components/CommentList';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const AnimeDetailPage = () => {
  const { animeId } = useParams();
  const animeIdNumber = Number(animeId);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: anime, isLoading: animeLoading } = useQuery({
    queryKey: ['anime-detail', animeId],
    queryFn: () => fetchAnimeDetail(animeId),
    enabled: Boolean(animeId),
  });

  const { data: commentsResponse, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', animeId],
    queryFn: () => getCommentsByAnimeRequest(animeId),
    enabled: Boolean(animeId),
  });

  const { data: favoritesResponse, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritesRequest,
    enabled: isAuthenticated,
  });

  const comments = commentsResponse?.comments || [];
  const existingFavorite = (favoritesResponse?.favorites || []).find(
    (favorite) => favorite.animeId === animeIdNumber,
  );

  const isFavorite = Boolean(existingFavorite);

  const addFavoriteMutation = useMutation({
    mutationFn: addFavoriteRequest,
    onSuccess: () => {
      showToast({ message: 'Added to favorites', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'Could not add favorite', type: 'error' });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: deleteFavoriteRequest,
    onSuccess: () => {
      showToast({ message: 'Removed from favorites', type: 'info' });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'Could not remove favorite', type: 'error' });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: createCommentRequest,
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', animeId] });
      showToast({ message: 'Comentario publicado', type: 'success' });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'No se pudo publicar el comentario', type: 'error' });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateCommentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', animeId] });
      showToast({ message: 'Comentario actualizado', type: 'success' });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'No se pudo actualizar el comentario', type: 'error' });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: toggleLikeCommentRequest,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['comments', animeId] });
      showToast({ message: response?.liked ? 'Like agregado' : 'Like removido', type: 'info' });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'No se pudo actualizar el like', type: 'error' });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', animeId] });
      showToast({ message: 'Comentario eliminado', type: 'success' });
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'No se pudo eliminar el comentario', type: 'error' });
    },
  });

  const handleFavoriteToggle = () => {
    if (!anime) return;

    if (isFavorite && existingFavorite?._id) {
      removeFavoriteMutation.mutate(existingFavorite._id);
      return;
    }

    const title = anime.title?.english || anime.title?.romaji;
    addFavoriteMutation.mutate({
      animeId: anime.id,
      title,
      coverImage: anime.coverImage?.large || anime.coverImage?.extraLarge || '',
    });
  };

  if (animeLoading) return <Loader text="Loading anime detail..." />;
  if (!anime) return <p className="text-slate-300">Anime not found.</p>;

  const title = anime.title?.english || anime.title?.romaji;
  const favoritePending = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
        {anime.bannerImage && (
          <img src={anime.bannerImage} alt={title} className="h-52 w-full object-cover object-center" />
        )}

        <div className="grid gap-5 p-5 md:grid-cols-[240px_1fr]">
          <img
            src={anime.coverImage?.extraLarge || anime.coverImage?.large}
            alt={title}
            className="h-80 w-full rounded-lg object-cover"
          />

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-amber-300">{title}</h1>
            <p className="text-sm text-slate-300">{anime.description || 'No description available.'}</p>
            <p className="text-sm text-slate-400">
              Episodes: {anime.episodes || 'N/A'} | Score: {anime.averageScore || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">Genres: {anime.genres?.join(', ') || 'N/A'}</p>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoritePending || favoritesLoading}
                className={`rounded-md px-4 py-2 font-semibold disabled:opacity-60 ${
                  isFavorite
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                }`}
              >
                {favoritesLoading
                  ? 'Checking...'
                  : favoritePending
                    ? isFavorite
                      ? 'Removing...'
                      : 'Adding...'
                    : isFavorite
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'}
              </button>
            )}
          </div>
        </div>
      </article>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-xl font-semibold text-slate-100">Comments</h2>

        {isAuthenticated ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              createCommentMutation.mutate({ animeId, content: commentText.trim() });
            }}
            className="space-y-2"
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              placeholder="Write your comment..."
            />
            <button
              type="submit"
              className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {createCommentMutation.isPending ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-400">Login to post comments and likes.</p>
        )}

        {commentsLoading ? (
          <Loader text="Loading comments..." />
        ) : (
          <CommentList
            comments={comments}
            currentUserId={user?._id}
            canInteract={isAuthenticated}
            onLike={(commentId) => likeCommentMutation.mutate(commentId)}
            onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
            onEdit={(commentId, content) =>
              updateCommentMutation.mutateAsync({
                commentId,
                content,
              })
            }
          />
        )}
      </section>
    </section>
  );
};

export default AnimeDetailPage;
