import { http } from './http';

export const getCommentsByAnimeRequest = async (animeId) => {
  const { data } = await http.get(`/comments/anime/${animeId}`);
  return data;
};

export const createCommentRequest = async ({ animeId, content }) => {
  const { data } = await http.post(`/comments/anime/${animeId}`, { content });
  return data;
};

export const updateCommentRequest = async ({ commentId, content }) => {
  const { data } = await http.patch(`/comments/${commentId}`, { content });
  return data;
};

export const deleteCommentRequest = async (commentId) => {
  const { data } = await http.delete(`/comments/${commentId}`);
  return data;
};

export const toggleLikeCommentRequest = async (commentId) => {
  const { data } = await http.post(`/comments/${commentId}/like`);
  return data;
};
