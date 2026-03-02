import api from './client.js'

export const getFavorites = () => api.get('/favorites')
export const addFavorite = (data) => api.post('/favorites', data)
export const removeFavorite = (animeId) => api.delete(`/favorites/${animeId}`)
export const checkFavorite = (animeId) => api.get(`/favorites/check/${animeId}`)
