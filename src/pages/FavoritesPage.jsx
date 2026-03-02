import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, Star } from 'lucide-react'
import { getFavorites, removeFavorite } from '../api/favoritesApi.js'
import useToastStore from '../store/toastStore.js'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'

const FavoriteCard = ({ fav, onRemove }) => {
  const [removing, setRemoving] = useState(false)
  const score = fav.animeScore ? (fav.animeScore / 10).toFixed(1) : null

  const handleRemove = async () => {
    setRemoving(true)
    await onRemove(fav.animeId)
    setRemoving(false)
  }

  return (
    <div className="card flex gap-4 p-4 hover:border-zinc-700 transition-colors">
      <Link to={`/anime/${fav.animeId}`} className="shrink-0">
        {fav.animeCover ? (
          <img
            src={fav.animeCover}
            alt={fav.animeTitle}
            className="w-16 h-24 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-24 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Heart size={20} className="text-zinc-600" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/anime/${fav.animeId}`} className="font-semibold text-zinc-100 hover:text-violet-400 transition-colors line-clamp-2">
            {fav.animeTitle}
          </Link>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-zinc-500">
            {fav.animeFormat && <span>{fav.animeFormat}</span>}
            {fav.animeEpisodes && <span>{fav.animeEpisodes} ep.</span>}
            {score && (
              <span className="flex items-center gap-0.5 text-yellow-500">
                <Star size={10} fill="currentColor" /> {score}
              </span>
            )}
          </div>
          {fav.animeGenres?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {fav.animeGenres.slice(0, 3).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-500">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="danger"
          size="sm"
          loading={removing}
          onClick={handleRemove}
          className="w-fit mt-3"
        >
          <Trash2 size={13} /> Eliminar
        </Button>
      </div>
    </div>
  )
}

const FavoritesPage = () => {
  const { toast } = useToastStore()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavorites(data.data.favorites))
      .catch(() => toast('Error al cargar favoritos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (animeId) => {
    try {
      await removeFavorite(animeId)
      setFavorites((prev) => prev.filter((f) => f.animeId !== animeId))
      toast('Eliminado de favoritos', 'info')
    } catch {
      toast('Error al eliminar', 'error')
    }
  }

  if (loading)
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Heart size={24} className="text-violet-400" />
        <h1 className="text-2xl font-bold text-zinc-100">Mis Favoritos</h1>
        {favorites.length > 0 && (
          <span className="ml-auto text-sm text-zinc-500">{favorites.length} anime{favorites.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart size={40} className="text-zinc-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-400 mb-2">Sin favoritos aún</h2>
          <p className="text-sm text-zinc-600 mb-6">Explora el catálogo y añade tus anime favoritos</p>
          <Link to="/">
            <Button variant="primary">Explorar anime</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <FavoriteCard key={fav._id} fav={fav} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
