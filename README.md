# Anime App Frontend

Modern anime discovery web app connected to:

- AniList GraphQL API (anime catalog/search)
- Custom backend API (auth, favorites, comments, profile)

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Axios
- React Hook Form + Zod

## Features

- Login / Register
- Explore tab with:
  - Search
  - Infinite scroll
  - Genre filter
  - Minimum score filter
  - URL-persisted state (`q`, `genre`, `score`)
- Anime detail page:
  - Add/remove favorites toggle
  - Comments CRUD
  - Like/unlike comments
- Favorites page
- Profile page + edit profile
- Global toast notifications (dedupe + queue limit)

## Project Structure

```txt
src/
  api/
  components/
  context/
  hooks/
  layouts/
  pages/
  routes/
  utils/
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env`:

```env
VITE_API_URL=https://your-backend-domain.up.railway.app/api
VITE_ANILIST_API=https://graphql.anilist.co
```

### 3) Run locally

```bash
npm run dev
```

Default dev URL:

```txt
http://localhost:5173
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## App Routes

- `/` - Explore
- `/anime/:animeId` - Anime detail
- `/login` - Login (public only)
- `/register` - Register (public only)
- `/favorites` - Favorites (private)
- `/profile` - Profile (private)
- `/profile/edit` - Edit profile (private)

## Deployment

- Recommended: Vercel
- Add environment variables in Vercel project settings:
  - `VITE_API_URL`
  - `VITE_ANILIST_API`
