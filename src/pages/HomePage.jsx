import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTrending, searchAnime } from '../api/anilistApi.js'
import AnimeCard from '../components/ui/AnimeCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import useDebounce from '../hooks/useDebounce.js'

const AnimeGrid = ({ items, loading }) => {
  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )

  if (!items.length)
    return (
      <div className="py-16 text-center text-zinc-500">
        <p className="text-4xl mb-3">🔍</p>
        <p>No se encontraron resultados</p>
      </div>
    )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}

const HomePage = () => {
  const [query, setQuery] = useState('')
  const [animes, setAnimes] = useState([])
  const [page, setPage] = useState(1)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, lastPage: 1 })
  const [loading, setLoading] = useState(true)
  const debouncedQuery = useDebounce(query, 500)

  const fetchData = async (q, p) => {
    setLoading(true)
    try {
      const data = q.trim()
        ? await searchAnime(q.trim(), p)
        : await getTrending(p)
      const { media, pageInfo: info } = q.trim() ? data.Page : data.Page
      setAnimes(media || [])
      setPageInfo(info)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchData(debouncedQuery, 1)
  }, [debouncedQuery])

  const goToPage = (newPage) => {
    setPage(newPage)
    fetchData(debouncedQuery, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">
          Descubre el mundo del{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
            anime
          </span>
        </h1>
        <p className="text-zinc-500">Explora, guarda tus favoritos y comenta</p>
      </div>

      {/* Buscador */}
      <div className="relative max-w-lg mx-auto w-full">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Título de sección */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-300">
          {debouncedQuery ? `Resultados para "${debouncedQuery}"` : 'Tendencias'}
        </h2>
        {!loading && animes.length > 0 && (
          <span className="text-sm text-zinc-600">Página {page} / {pageInfo.lastPage}</span>
        )}
      </div>

      {/* Grid */}
      <AnimeGrid items={animes} loading={loading} />

      {/* Paginación */}
      {!loading && animes.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="px-4 py-2 text-sm text-zinc-400">
            {page} / {pageInfo.lastPage}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={!pageInfo.hasNextPage}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default HomePage
