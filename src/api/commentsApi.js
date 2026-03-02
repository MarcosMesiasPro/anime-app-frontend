import api from './client.js'

export const getComments = (animeId, page = 1) =>
  api.get(`/comments/${animeId}`, { params: { page, limit: 10 } })

export const createComment = (data) => api.post('/comments', data)
export const updateComment = (id, content) => api.put(`/comments/${id}`, { content })
export const deleteComment = (id) => api.delete(`/comments/${id}`)
export const toggleLike = (id) => api.post(`/comments/${id}/like`)
