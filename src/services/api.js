import axios from 'axios';

// Instancia de Axios para nuestro Backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // ¡Crucial para enviar y recibir las cookies httpOnly!
});

// Interceptor para manejar errores globalmente en el frontend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Ocurrió un error inesperado';
    return Promise.reject(new Error(message));
  }
);

// Función helper para la API de AniList (GraphQL)
export const anilistApi = async (query, variables = {}) => {
  try {
    const response = await axios.post(
      'https://graphql.anilist.co',
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    );
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.errors?.[0]?.message || 'Error fetching from AniList';
    throw new Error(message);
  }
};
