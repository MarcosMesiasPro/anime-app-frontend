import { http } from './http';

export const getFavoritesRequest = async () => {
  const { data } = await http.get('/favorites');
  return data;
};

export const addFavoriteRequest = async (payload) => {
  const { data } = await http.post('/favorites', payload);
  return data;
};

export const deleteFavoriteRequest = async (favoriteId) => {
  const { data } = await http.delete(`/favorites/${favoriteId}`);
  return data;
};
