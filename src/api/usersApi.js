import api from './client.js'

export const getUserProfile = (id) => api.get(`/users/${id}`)
export const updateProfile = (data) => api.patch('/users/profile', data)
