import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Star, Tv, Film, ChevronLeft } from 'lucide-react'
import { getAnimeDetail } from '../api/anilistApi.js'
import { addFavorite, removeFavorite, checkFavorite } from '../api/favoritesApi.js'
import useAuthStore from '../store/authStore.js'
import useToastStore from '../store/toastStore.js'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import CommentList from '../components/comments/CommentList.jsx'

const STATUS_LABELS = {
  FINISHED: 'Finalizado',
  RELEASING: 'En emisión',
  NOT_YET_RELEASED: 'Próximamente',
  CANCELLED: 'Cancelado',
}

const SEASON_LABELS = {
  SPRING: 'Primavera',
  SUMMER: 'Verano',
  FALL: 'Otoño',
  WINTER: 'Invierno',
}

const AnimeDetailPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToastStore()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getAnimeDetail(id)
        setAnime(data.Media)
      } catch {
        toast('Error al cargar el anime', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    checkFavorite(id)
      .then(({ data }) => setIsFav(data.data.isFavorite))
      .catch(() => {})
  }, [id, isAuthenticated])

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast('Inicia sesión para guardar favoritos', 'info')
      return
    }
    setFavLoading(true)
    try {
      if (isFav) {
        await removeFavorite(id)
        setIsFav(false)
        toast('Eliminado de favoritos', 'info')
      } else {
        await addFavorite({
          animeId: anime.id,
          animeTitle: anime.title.english || anime.title.romaji,
          animeCover: anime.coverImage?.large || '',
          animeGenres: anime.genres || [],
          animeFormat: anime.format || '',
          animeStatus: anime.status || '',
          animeEpisodes: anime.episodes || null,
          animeScore: anime.averageScore || null,
        })
        setIsFav(true)
        toast('Añadido a favoritos', 'success')
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Error', 'error')
    } finally {
      setFavLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!anime) return <div className="text-center text-zinc-500 py-24">Anime no encontrado</div>

  const title = anime.title.english || anime.title.romaji
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null

  return (
    <div className="flex flex-col gap-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
        <ChevronLeft size={16} /> Volver
      </Link>

      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-48 rounded-2xl overflow-hidden">
          <img src={anime.bannerImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-anime-bg via-anime-bg/50 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="flex gap-6 flex-col sm:flex-row">
        {/* Cover */}
        <div className="shrink-0">
          <img
            src={anime.coverImage?.extraLarge || anime.coverImage?.large}
            alt={title}
            className="w-40 sm:w-48 rounded-xl shadow-2xl shadow-violet-900/30 mx-auto sm:mx-0"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">{title}</h1>
            {anime.title.native && (
              <p className="text-sm text-zinc-500 mt-1">{anime.title.native}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-sm">
            {score && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="font-semibold">{score}</span>
              </div>
            )}
            <div className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              {STATUS_LABELS[anime.status] || anime.status}
            </div>
            {anime.format && (
              <div className="px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-600/30 text-violet-300">
                {anime.format}
              </div>
            )}
            {anime.episodes && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                <Tv size={14} /> {anime.episodes} ep.
              </div>
            )}
            {anime.season && (
              <div className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                {SEASON_LABELS[anime.season]} {anime.seasonYear}
              </div>
            )}
          </div>

          {/* Géneros */}
          {anime.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span key={g} className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Estudio */}
          {anime.studios?.nodes?.[0] && (
            <p className="text-sm text-zinc-500">
              Estudio: <span className="text-zinc-300">{anime.studios.nodes[0].name}</span>
            </p>
          )}

          {/* Botón favorito */}
          <Button
            variant={isFav ? 'danger' : 'secondary'}
            onClick={handleFavorite}
            loading={favLoading}
            className="w-fit"
          >
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
            {isFav ? 'En favoritos' : 'Añadir a favoritos'}
          </Button>
        </div>
      </div>

      {/* Descripción */}
      {anime.description && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">Sinopsis</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {anime.description.replace(/<[^>]*>/g, '')}
          </p>
        </div>
      )}

      {/* Personajes */}
      {anime.characters?.nodes?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Personajes</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {anime.characters.nodes.map((char, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                <img
                  src={char.image?.medium}
                  alt={char.name?.full}
                  className="w-full aspect-square rounded-full object-cover border-2 border-anime-border"
                />
                <span className="text-xs text-zinc-400 leading-tight line-clamp-2">
                  {char.name?.full}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comentarios */}
      <div className="border-t border-anime-border pt-8">
        <CommentList animeId={Number(id)} />
      </div>
    </div>
  )
}

export default AnimeDetailPage
