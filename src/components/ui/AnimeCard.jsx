import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

const STATUS_LABELS = {
  FINISHED: 'Finalizado',
  RELEASING: 'En emisión',
  NOT_YET_RELEASED: 'Próximamente',
  CANCELLED: 'Cancelado',
}

const FORMAT_LABELS = {
  TV: 'TV',
  MOVIE: 'Película',
  OVA: 'OVA',
  ONA: 'ONA',
  SPECIAL: 'Especial',
}

const AnimeCard = ({ anime }) => {
  const title = anime.title?.english || anime.title?.romaji || 'Sin título'
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-anime-border bg-anime-card hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={anime.coverImage?.large}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay con score */}
        <div className="absolute inset-0 bg-gradient-to-t from-anime-card via-transparent to-transparent" />
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
            <Star size={10} fill="currentColor" />
            {score}
          </div>
        )}
        {anime.format && (
          <div className="absolute top-2 left-2 rounded-md bg-violet-600/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {FORMAT_LABELS[anime.format] || anime.format}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-100 leading-tight">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{STATUS_LABELS[anime.status] || anime.status}</span>
          {anime.episodes && <span>{anime.episodes} ep.</span>}
        </div>
        {anime.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {anime.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default AnimeCard
