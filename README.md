# AnimeTrack — Frontend

Aplicación web fullstack para descubrir, explorar y seguir anime. Construida con React 19, Vite 7 y Tailwind CSS. Consume la API de [AniList](https://anilist.co) (GraphQL, gratuita y sin API key) para el catálogo, y el backend propio para autenticación, favoritos y comentarios.

## Capturas de pantalla

> Tema oscuro con acentos violeta · Diseño responsive · Mobile-first

## Características

### Catálogo de anime
- **5 secciones de navegación** — Tendencias, Popular esta temporada, Próxima temporada, Más populares de todos los tiempos, Top 100
- **Búsqueda en tiempo real** con debounce de 500ms
- **Filtros avanzados** — género, año, temporada, formato y puntuación
- **Filtro por puntuación** — Malos (1-3), Buenos (4-6), Muy buenos (7-8), Excelentes (9-10)
- Paginación completa con navegación entre páginas

### Página de detalle
- Información completa: título, sinopsis, géneros, estudio, temporada, estadísticas
- **Reproductor de trailer** — YouTube/Dailymotion con carga lazy (thumbnail → iframe al hacer clic)
- **Botón de favorito** con estado en tiempo real
- **Sección de personajes** con imágenes

### Sistema de comentarios
- Comentarios públicos por anime con paginación
- Crear, editar y eliminar comentario propio
- **Sistema de likes** por toggle
- Indicador de tiempo relativo (hace 5m, hace 2h, etc.)

### Autenticación y perfil
- Registro e inicio de sesión con validación client-side
- Sesión persistida en `localStorage` con Zustand
- Ver perfil público de cualquier usuario (favoritos, comentarios)
- Editar propio perfil — username, bio, avatar URL, contraseña

### UX
- Notificaciones toast sin dependencias externas
- Rutas protegidas con redirección automática al login
- Navbar responsive con menú hamburguesa en móvil
- Interceptor axios automático para tokens JWT y manejo de 401

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2 | UI |
| Vite | 7.3 | Build tool y dev server |
| Tailwind CSS | 3.4 | Estilos |
| React Router DOM | 7.1 | Enrutamiento |
| Zustand | 5.0 | Estado global (auth + toast) |
| Axios | 1.1 | Cliente HTTP |
| Lucide React | 0.5 | Iconos |
| AniList GraphQL | — | Catálogo de anime (sin API key) |

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd anime-app-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu backend

# 4. Iniciar en modo desarrollo
npm run dev

# La app estará disponible en http://localhost:5173
```

> **Requisito:** El backend debe estar corriendo en `http://localhost:5000` para que funcionen las funcionalidades de autenticación, favoritos y comentarios. El catálogo de anime funciona sin backend.

## Variables de entorno

```env
# URL del backend (API propia)
VITE_API_URL=http://localhost:5000/api

# En producción:
# VITE_API_URL=https://tu-backend.railway.app/api
```

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción (genera carpeta dist/)
npm run preview  # Vista previa del build de producción
```

## Estructura del proyecto

```
anime-app-frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Enrutador principal (createBrowserRouter)
│   ├── index.css              # Estilos globales + clases Tailwind custom
│   │
│   ├── api/                   # Capa de comunicación con APIs
│   │   ├── client.js          # Axios con interceptors JWT + manejo 401
│   │   ├── anilistApi.js      # AniList GraphQL (catálogo, búsqueda, detalle, trailer)
│   │   ├── authApi.js         # Register, login
│   │   ├── favoritesApi.js    # CRUD favoritos
│   │   ├── commentsApi.js     # CRUD comentarios + likes
│   │   └── usersApi.js        # Ver perfil, editar perfil
│   │
│   ├── store/                 # Estado global con Zustand
│   │   ├── authStore.js       # Usuario, token, isAuthenticated (persistido)
│   │   └── toastStore.js      # Sistema de notificaciones toast
│   │
│   ├── hooks/
│   │   └── useDebounce.js     # Debounce para el buscador
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx # Redirige al login si no está autenticado
│   │   ├── layout/
│   │   │   ├── Navbar.jsx     # Header sticky con menú responsive
│   │   │   └── Layout.jsx     # Wrapper con Navbar + Outlet + Toast
│   │   ├── ui/
│   │   │   ├── AnimeCard.jsx  # Tarjeta de anime con cover, score, géneros
│   │   │   ├── Button.jsx     # Botón con variantes (primary/secondary/danger/ghost)
│   │   │   ├── Input.jsx      # Input con label y mensaje de error
│   │   │   ├── Spinner.jsx    # Indicador de carga
│   │   │   └── Toast.jsx      # Notificaciones toast (success/error/info)
│   │   └── comments/
│   │       ├── CommentList.jsx # Lista de comentarios con paginación
│   │       └── CommentForm.jsx # Formulario para crear comentarios
│   │
│   ├── pages/
│   │   ├── HomePage.jsx        # Catálogo con tabs, búsqueda y filtros
│   │   ├── AnimeDetailPage.jsx # Detalle con trailer, personajes y comentarios
│   │   ├── FavoritesPage.jsx   # Lista de favoritos del usuario
│   │   ├── ProfilePage.jsx     # Perfil público y edición propia
│   │   ├── LoginPage.jsx       # Formulario de inicio de sesión
│   │   └── RegisterPage.jsx    # Formulario de registro
│   │
│   └── utils/
│       └── cn.js               # Helper para combinar clases de Tailwind
└── .env.example
```

## Secciones de la Home

| Tab | Descripción | Sort AniList |
|---|---|---|
| 🔥 Tendencias | Anime más populares del momento | `TRENDING_DESC` |
| ⭐ Popular esta temporada | Más populares de la temporada actual | `POPULARITY_DESC` + season actual |
| 🗓️ Próxima temporada | Anime anunciados para la siguiente temporada | `POPULARITY_DESC` + next season |
| 🏆 Más populares | Los más populares de todos los tiempos | `POPULARITY_DESC` |
| 💎 Top 100 | Los mejor puntuados de la historia | `SCORE_DESC` |

> Las temporadas se calculan automáticamente según la fecha actual. No hay fechas hardcodeadas.

## Filtros disponibles

| Filtro | Opciones |
|---|---|
| Género | Action, Adventure, Comedy, Drama, Fantasy, Horror, Mecha, Music, Mystery, Psychological, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Thriller, Mahou Shoujo |
| Año | 1961 — año actual + 1 |
| Temporada | Invierno, Primavera, Verano, Otoño |
| Formato | TV, Película, OVA, ONA, Especial |
| Puntuación | Malos (1-3), Buenos (4-6), Muy buenos (7-8), Excelentes (9-10) |

Los filtros son **combinables** entre sí y con cualquier tab de navegación.

## Deploy en Vercel

```bash
# Opción 1: Vercel CLI
npm install -g vercel
vercel

# Opción 2: Dashboard de Vercel
# 1. Conectar el repositorio en https://vercel.com
# 2. Establecer la carpeta raíz como "anime-app-frontend"
# 3. Añadir la variable de entorno:
#    VITE_API_URL = https://tu-backend.railway.app/api
# 4. Deploy automático en cada push
```

**Variables de entorno en Vercel:**

```
VITE_API_URL=https://tu-backend.railway.app/api
```

## API de AniList

Este proyecto usa la [API pública de AniList](https://anilist.gitbook.io/anilist-apiv2-docs/), que es:
- **Gratuita** — sin costos ni suscripciones
- **Sin API key** — no requiere autenticación para queries de solo lectura
- **GraphQL** — queries precisas, solo se piden los campos necesarios
- **Rate limit** — 90 requests por minuto (más que suficiente para una app web)

## Rutas de la aplicación

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Catálogo principal | Público |
| `/anime/:id` | Detalle de anime | Público |
| `/user/:id` | Perfil público de usuario | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro | Público |
| `/favorites` | Mis favoritos | 🔒 Requiere login |
| `/profile` | Mi perfil (editable) | 🔒 Requiere login |
