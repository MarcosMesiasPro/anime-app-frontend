import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, Flame, Star, Calendar, Trophy, Gem } from 'lucide-react'
import { getAnimeList, getSeasonInfo, getNextSeasonInfo } from '../api/anilistApi.js'
import AnimeCard from '../components/ui/AnimeCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import useDebounce from '../hooks/useDebounce.js'

// ─── Constantes ─────────────────────────────────────────────────────────────

const SEASON_LABELS = { SPRING: 'Primavera', SUMMER: 'Verano', FALL: 'Otoño', WINTER: 'Invierno' }

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
]

const FORMATS = [
  { value: 'TV', label: 'TV' },
  { value: 'MOVIE', label: 'Película' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'SPECIAL', label: 'Especial' },
]

const SEASONS_LIST = [
  { value: 'WINTER', label: 'Invierno ❄️' },
  { value: 'SPRING', label: 'Primavera 🌸' },
  { value: 'SUMMER', label: 'Verano ☀️' },
  { value: 'FALL', label: 'Otoño 🍂' },
]

// Rangos AniList en escala 0–100 (donde 100 = 10.0)
const SCORE_RANGES = [
  { label: 'Todos', value: null },
  { label: '😐 Malos  1–3', value: { min: 1, max: 35 } },
  { label: '👍 Buenos  4–6', value: { min: 35, max: 65 } },
  { label: '⭐ Muy buenos  7–8', value: { min: 65, max: 85 } },
  { label: '🏆 Excelentes  9–10', value: { min: 85, max: null } },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1960 + 2 }, (_, i) => currentYear + 1 - i)

// ─── Tabs ────────────────────────────────────────────────────────────────────

const buildTabList = () => {
  const { season: cs, year: cy } = getSeasonInfo()
  const { season: ns, year: ny } = getNextSeasonInfo()
  return [
    {
      id: 'trending',
      label: 'Tendencias',
      icon: <Flame size={15} />,
      vars: { sort: ['TRENDING_DESC'] },
    },
    {
      id: 'popular_season',
      label: `Popular · ${SEASON_LABELS[cs]} ${cy}`,
      icon: <Star size={15} />,
      vars: { sort: ['POPULARITY_DESC'], season: cs, seasonYear: cy },
    },
    {
      id: 'upcoming',
      label: `Próxima · ${SEASON_LABELS[ns]} ${ny}`,
      icon: <Calendar size={15} />,
      vars: { sort: ['POPULARITY_DESC'], season: ns, seasonYear: ny, status: 'NOT_YET_RELEASED' },
    },
    {
      id: 'all_time',
      label: 'Más populares',
      icon: <Trophy size={15} />,
      vars: { sort: ['POPULARITY_DESC'] },
    },
    {
      id: 'top100',
      label: 'Top 100',
      icon: <Gem size={15} />,
      vars: { sort: ['SCORE_DESC'], averageScore_greater: 1 },
    },
  ]
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

const NavTabs = ({ tabs, activeTab, onSelect }) => (
  <div className="relative">
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
    {/* línea inferior */}
    <div className="h-px bg-anime-border mt-1" />
  </div>
)

const FilterPanel = ({ filters, onChange, onClear }) => {
  const hasActive = Object.values(filters).some((v) => v !== '' && v !== null)

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-300">Filtros</span>
        {hasActive && (
          <button onClick={onClear} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Género */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 font-medium">Género</label>
          <select
            value={filters.genre}
            onChange={(e) => onChange('genre', e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">Todos</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Año */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 font-medium">Año</label>
          <select
            value={filters.year}
            onChange={(e) => onChange('year', e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">Todos</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Temporada */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 font-medium">Temporada</label>
          <select
            value={filters.season}
            onChange={(e) => onChange('season', e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">Todas</option>
            {SEASONS_LIST.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Formato */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 font-medium">Formato</label>
          <select
            value={filters.format}
            onChange={(e) => onChange('format', e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">Todos</option>
            {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        {/* Score */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 font-medium">Puntuación</label>
          <select
            value={filters.scoreKey}
            onChange={(e) => onChange('scoreKey', e.target.value)}
            className="input-field text-sm py-2"
          >
            {SCORE_RANGES.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasActive && (
        <div className="flex flex-wrap gap-2">
          {filters.genre && <FilterChip label={`Género: ${filters.genre}`} onRemove={() => onChange('genre', '')} />}
          {filters.year && <FilterChip label={`Año: ${filters.year}`} onRemove={() => onChange('year', '')} />}
          {filters.season && <FilterChip label={`Temporada: ${SEASON_LABELS[filters.season]}`} onRemove={() => onChange('season', '')} />}
          {filters.format && <FilterChip label={`Formato: ${filters.format}`} onRemove={() => onChange('format', '')} />}
          {filters.scoreKey > 0 && <FilterChip label={SCORE_RANGES[filters.scoreKey].label} onRemove={() => onChange('scoreKey', 0)} />}
        </div>
      )}
    </div>
  )
}

const FilterChip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600/20 border border-violet-600/30 text-xs text-violet-300">
    {label}
    <button onClick={onRemove} className="hover:text-white"><X size={11} /></button>
  </span>
)

const AnimeGrid = ({ items, loading }) => {
  if (loading)
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  if (!items.length)
    return (
      <div className="py-16 text-center text-zinc-500">
        <p className="text-4xl mb-3">🔍</p>
        <p>No se encontraron resultados</p>
      </div>
    )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────

const TABS = buildTabList()

const EMPTY_FILTERS = { genre: '', year: '', season: '', format: '', scoreKey: 0 }

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('trending')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [animes, setAnimes] = useState([])
  const [page, setPage] = useState(1)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, lastPage: 1 })
  const [loading, setLoading] = useState(true)

  const debouncedQuery = useDebounce(query, 500)

  const fetchData = useCallback(async (tab, q, f, p) => {
    setLoading(true)
    try {
      const tabConfig = TABS.find((t) => t.id === tab)
      const scoreRange = SCORE_RANGES[f.scoreKey]?.value

      const vars = {
        ...tabConfig.vars,
        page: p,
        perPage: 20,
        ...(q.trim() && { search: q.trim() }),
        ...(f.genre && { genre: f.genre }),
        ...(f.year && { seasonYear: Number(f.year) }),
        ...(f.season && { season: f.season }),
        ...(f.format && { format: f.format }),
        ...(scoreRange?.min != null && { averageScore_greater: scoreRange.min }),
        ...(scoreRange?.max != null && { averageScore_lesser: scoreRange.max }),
      }

      const data = await getAnimeList(vars)
      setAnimes(data.Page.media || [])
      setPageInfo(data.Page.pageInfo)
    } catch (err) {
      console.error(err)
      setAnimes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch cuando cambia tab, query debounced, o filtros
  useEffect(() => {
    setPage(1)
    fetchData(activeTab, debouncedQuery, filters, 1)
  }, [activeTab, debouncedQuery, filters, fetchData])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setQuery('')
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  const goToPage = (newPage) => {
    setPage(newPage)
    fetchData(activeTab, debouncedQuery, filters, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => k === 'scoreKey' ? v > 0 : v !== ''
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">
          Descubre el mundo del{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
            anime
          </span>
        </h1>
        <p className="text-zinc-500">Explora, guarda tus favoritos y comenta</p>
      </div>

      {/* Tabs de navegación */}
      <NavTabs tabs={TABS} activeTab={activeTab} onSelect={handleTabChange} />

      {/* Barra de búsqueda + botón filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'border-violet-500 bg-violet-600/15 text-violet-300'
              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && (
            <span className="bg-violet-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {Object.entries(filters).filter(([k, v]) => k === 'scoreKey' ? v > 0 : v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros (colapsable) */}
      {showFilters && (
        <FilterPanel filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
      )}

      {/* Header de sección */}
      <div className="flex items-center justify-between -mb-2">
        <h2 className="text-sm font-medium text-zinc-500">
          {debouncedQuery
            ? `Resultados para "${debouncedQuery}"`
            : TABS.find((t) => t.id === activeTab)?.label}
        </h2>
        {!loading && animes.length > 0 && (
          <span className="text-xs text-zinc-600">Pág. {page} / {pageInfo.lastPage}</span>
        )}
      </div>

      {/* Grid */}
      <AnimeGrid items={animes} loading={loading} />

      {/* Paginación */}
      {!loading && animes.length > 0 && pageInfo.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 transition-colors"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="px-4 py-2 text-sm text-zinc-400">{page} / {pageInfo.lastPage}</span>
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
