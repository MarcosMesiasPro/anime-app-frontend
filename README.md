# AniTrack Frontend 🎬

Este es el frontend de **AniTrack**, una aplicación Fullstack para descubrir, guardar y comentar sobre tus animes favoritos. Está construido con **React, Vite y Tailwind CSS**, y consume tanto la API RESTful de nuestro backend (para autenticación y base de datos) como la API GraphQL de **AniList** para todo el catálogo de anime.

## Características Principales ✨

- **Motor de Descubrimiento (AniList API):**
  - Navegación rápida por categorías: Tendencias, Esta Temporada, Próxima Temporada, Más Populares y Top 100.
  - Filtros avanzados: Género, Año, Temporada, Formato y Rango de Puntuación.
  - Barra de búsqueda predictiva con autocompletado (Debounced).
  - Paginación continua ("Cargar más").

- **Interacción y Comunidad (Backend Propio):**
  - Sistema de Autenticación mediante JWT en cookies `httpOnly`.
  - Página de perfil de usuario editable (Avatar y Biografía).
  - Sistema para añadir animes a **Favoritos**.
  - **Comentarios en tiempo real:** Escribir, editar, eliminar (si eres el autor) y dar/quitar "Likes" a los comentarios de otros.

- **Diseño Moderno:**
  - Interfaz oscura (Dark Mode), responsiva y estilizada con Tailwind CSS.
  - Iconografía limpia usando `lucide-react`.

## Tecnologías Utilizadas 🛠️

- **Framework:** React 18 (con Vite para un entorno de desarrollo ultrarrápido)
- **Estilos:** Tailwind CSS 3
- **Navegación:** React Router v6
- **Estado Global:** Zustand (ligero y directo para el Auth Store)
- **Peticiones HTTP:** Axios (configurado para enviar credenciales/cookies cross-origin)

## Requisitos Previos 📋

- [Node.js](https://nodejs.org/)
- El **Backend de AniTrack** debe estar configurado y corriendo (revisar el repositorio del backend).

## Instalación y Configuración Local ⚙️

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TuUsuario/anime-app-frontend.git
   cd anime-app-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y apunta la URL hacia tu backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *(Asegúrate de cambiar esta URL por la de producción cuando despliegues el backend en Railway/Render).*

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en `http://localhost:5173`.*

## Estructura de Carpetas 📁
- `src/components/` - Componentes UI reutilizables (`Navbar`, `SearchBar`).
- `src/pages/` - Vistas principales (`Home`, `AnimeDetail`, `Profile`, `Login`, etc).
- `src/services/` - Configuración de Axios y funciones `anilistApi`.
- `src/store/` - Estado global con Zustand (`authStore`).

## Despliegue en Vercel 🚀

Este proyecto está optimizado para ser desplegado en Vercel sin configuraciones extra.

1. Sube tu repositorio a GitHub.
2. Entra a [Vercel](https://vercel.com/) y conecta tu repositorio.
3. Asegúrate de que el "Framework Preset" sea detectado como **Vite**.
4. En **Environment Variables**, agrega `VITE_API_URL` apuntando a la URL pública de tu backend.
5. ¡Haz clic en Deploy!