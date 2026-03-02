import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { anilistApi } from '../services/api';
import { Star, Tv, Filter, X } from 'lucide-react';

// Utilidades para determinar la temporada actual y siguiente
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'WINTER';
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  return 'FALL';
};

const getNextSeason = () => {
  const current = getCurrentSeason();
  const year = new Date().getFullYear();
  if (current === 'WINTER') return { season: 'SPRING', year };
  if (current === 'SPRING') return { season: 'SUMMER', year };
  if (current === 'SUMMER') return { season: 'FALL', year };
  return { season: 'WINTER', year: year + 1 };
};

const currentYear = new Date().getFullYear();
const currentSeason = getCurrentSeason();
const next = getNextSeason();

// Configuración de las Pestañas (Navegación principal de categorías)
const TABS = [
  { id: 'trending', label: 'Tendencias' },
  { id: 'season', label: 'Esta Temporada' },
  { id: 'next', label: 'Próxima Temporada' },
  { id: 'popular', label: 'Más Populares' },
  { id: 'top', label: 'Top 100 Animes' }
];

// Mapeo de cómo cada pestaña afecta a la API de AniList
const PRESETS = {
  trending: { sort: 'TRENDING_DESC', title: 'Tendencias Ahora' },
  season: { sort: 'POPULARITY_DESC', season: currentSeason, seasonYear: currentYear, title: 'Populares esta Temporada' },
  next: { sort: 'POPULARITY_DESC', season: next.season, seasonYear: next.year, status: 'NOT_YET_RELEASED', title: 'Próxima Temporada' },
  popular: { sort: 'POPULARITY_DESC', title: 'Animes Más Populares' },
  top: { sort: 'SCORE_DESC', title: 'Mejores Valorados (Top 100)' }
};

// Datos para los filtros avanzados
const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"];
const YEARS = Array.from({length: currentYear - 1989 + 2}, (_, i) => currentYear + 1 - i); // Incluye hasta el próximo año
const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "TV_SHORT"];
const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];

// Consulta GraphQL Dinámica
const DISCOVER_ANIMES_QUERY = `
  query (
    $page: Int, 
    $perPage: Int, 
    $sort: [MediaSort], 
    $season: MediaSeason, 
    $seasonYear: Int,
    $status: MediaStatus,
    $formatIn: [MediaFormat],
    $genreIn: [String],
    $scoreGreater: Int,
    $scoreLesser: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      }
      media(
        type: ANIME, 
        isAdult: false,
        sort: $sort,
        season: $season,
        seasonYear: $seasonYear,
        status: $status,
        format_in: $formatIn,
        genre_in: $genreIn,
        averageScore_greater: $scoreGreater,
        averageScore_lesser: $scoreLesser
      ) {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
        averageScore
        episodes
        status
        format
        genres
        description
      }
    }
  }
`;

const Home = () => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Estados de navegación y filtros
  const [activeTab, setActiveTab] = useState('trending');
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    season: '',
    format: '',
    scoreRange: ''
  });

  // Constructor de variables para GraphQL basado en Tab + Filtros
  const buildVariables = (pageNumber) => {
    const base = PRESETS[activeTab];
    const vars = {
      page: pageNumber,
      perPage: 24,
      sort: [base.sort],
    };
    
    // Aplicar base del Tab (solo si el usuario no ha forzado un filtro que lo sobrescriba)
    if (base.season && !filters.season) vars.season = base.season;
    if (base.seasonYear && !filters.year) vars.seasonYear = base.seasonYear;
    if (base.status) vars.status = base.status;

    // Aplicar Filtros Manuales Avanzados
    if (filters.genre) vars.genreIn = [filters.genre];
    if (filters.year) vars.seasonYear = parseInt(filters.year);
    if (filters.season) vars.season = filters.season;
    if (filters.format) vars.formatIn = [filters.format];
    
    // Convertir el rango 1-10 en porcentajes 0-100 para AniList
    if (filters.scoreRange) {
      if (filters.scoreRange === '1-3') { vars.scoreGreater = 0; vars.scoreLesser = 39; }
      if (filters.scoreRange === '4-6') { vars.scoreGreater = 40; vars.scoreLesser = 69; }
      if (filters.scoreRange === '7-10') { vars.scoreGreater = 70; vars.scoreLesser = 100; }
    }

    return vars;
  };

  const fetchAnimes = async (pageNumber, isNew = false) => {
    try {
      if (isNew) setLoading(true);
      else setLoadingMore(true);

      const vars = buildVariables(pageNumber);
      const data = await anilistApi(DISCOVER_ANIMES_QUERY, vars);
      
      // Si estamos en la categoría Top 100, forzamos que no haya más páginas después de ~100 elementos (pág 4)
      const isTop100Limit = activeTab === 'top' && pageNumber >= 4;
      setHasNextPage(!isTop100Limit && data.Page.pageInfo.hasNextPage);

      if (isNew) {
        setAnimes(data.Page.media);
      } else {
        setAnimes(prev => [...prev, ...data.Page.media]);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar los animes de AniList.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Disparar búsqueda cuando cambie la pestaña o algún filtro
  useEffect(() => {
    setPage(1);
    fetchAnimes(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    clearFilters(); // Limpiar filtros manuales al cambiar de sección principal
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ genre: '', year: '', season: '', format: '', scoreRange: '' });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnimes(nextPage);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{PRESETS[activeTab].title}</h1>
          <p className="text-gray-400">Explora, filtra y descubre el catálogo completo de animes.</p>
        </div>
      </div>

      {/* Navegación por Categorías (TABS) */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar border-b border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary bg-primary/10' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros Avanzados */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Filter size={18} /> Filtros Rápidos
          </h3>
          {Object.values(filters).some(val => val !== '') && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
              <X size={14} /> Limpiar Filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select name="genre" value={filters.genre} onChange={handleFilterChange} className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded-md p-2 focus:border-primary focus:outline-none">
            <option value="">Cualquier Género</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          
          <select name="year" value={filters.year} onChange={handleFilterChange} className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded-md p-2 focus:border-primary focus:outline-none">
            <option value="">Cualquier Año</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <select name="season" value={filters.season} onChange={handleFilterChange} className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded-md p-2 focus:border-primary focus:outline-none">
            <option value="">Cualquier Temporada</option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select name="format" value={filters.format} onChange={handleFilterChange} className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded-md p-2 focus:border-primary focus:outline-none">
            <option value="">Cualquier Formato</option>
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          
          <select name="scoreRange" value={filters.scoreRange} onChange={handleFilterChange} className="bg-gray-800 text-sm text-gray-300 border border-gray-700 rounded-md p-2 focus:border-primary focus:outline-none">
            <option value="">Cualquier Puntuación</option>
            <option value="7-10">Alta (7 a 10)</option>
            <option value="4-6">Media (4 a 6)</option>
            <option value="1-3">Baja (1 a 3)</option>
          </select>
        </div>
      </div>

      {/* Grid de Animes */}
      {loading && animes.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : animes.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No se encontraron animes con estos filtros.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {animes.map((anime) => (
              <Link 
                to={`/anime/${anime.id}`} 
                key={anime.id}
                className="group relative flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-800">
                  <img 
                    src={anime.coverImage.large} 
                    alt={anime.title.userPreferred} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 p-3 w-full">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {anime.genres.slice(0, 2).map(genre => (
                          <span key={genre} className="text-[10px] px-1.5 py-0.5 bg-primary/80 text-white rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-3">
                        {anime.description?.replace(/<[^>]*>?/gm, '') || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)}` : 'N/A'}
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {anime.title.userPreferred}
                  </h3>
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span className="flex items-center gap-1">
                      <Tv size={12} />
                      {anime.format || 'TV'}
                    </span>
                    <span>
                      {anime.episodes ? `${anime.episodes} eps` : 'Emisión'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                {loadingMore ? 'Cargando más...' : 'Cargar más animes'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;