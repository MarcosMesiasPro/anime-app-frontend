import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { anilistApi } from '../services/api';
import { Star, Tv, Search } from 'lucide-react';

const SEARCH_RESULTS_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        hasNextPage
      }
      media(search: $search, type: ANIME, isAdult: false) {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
        averageScore
        episodes
        format
        genres
        description
      }
    }
  }
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    // Reset state when query changes
    setAnimes([]);
    setPage(1);
    setTotal(0);
    setHasNextPage(false);
    if (query) {
      fetchResults(1, true);
    }
  }, [query]);

  const fetchResults = async (pageNumber, isNewSearch = false) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      const data = await anilistApi(SEARCH_RESULTS_QUERY, {
        search: query,
        page: pageNumber,
        perPage: 24
      });

      setTotal(data.Page.pageInfo.total);
      setHasNextPage(data.Page.pageInfo.hasNextPage);
      
      if (isNewSearch) {
        setAnimes(data.Page.media);
      } else {
        setAnimes(prev => [...prev, ...data.Page.media]);
      }
      setError(null);
    } catch (err) {
      setError('Error al buscar animes.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage);
  };

  if (!query) {
    return (
      <div className="text-center py-20">
        <Search size={48} className="mx-auto text-gray-700 mb-4" />
        <h2 className="text-2xl text-gray-400">Ingresa un término para buscar.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Resultados para "{query}"
        </h1>
        <p className="text-gray-400">
          Se encontraron <span className="font-bold text-white">{total}</span> títulos.
        </p>
      </div>

      {animes.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No se encontraron animes con ese nombre.
        </div>
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
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más resultados'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
