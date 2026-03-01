import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchAnimeList } from '../api/anilist';
import AnimeCard from '../components/AnimeCard';
import Loader from '../components/Loader';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';
  const initialScore = Number(searchParams.get('score') || 0);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [minScore, setMinScore] = useState(Number.isNaN(initialScore) ? 0 : initialScore);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search) nextParams.set('q', search);
    if (selectedGenre) nextParams.set('genre', selectedGenre);
    if (minScore > 0) nextParams.set('score', String(minScore));

    setSearchParams(nextParams, { replace: true });
  }, [search, selectedGenre, minScore, setSearchParams]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['anime-list', search],
    queryFn: ({ pageParam }) => fetchAnimeList({ search, page: pageParam, perPage: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNextPage) return undefined;
      return lastPage.currentPage + 1;
    },
  });

  const animes = useMemo(() => data?.pages?.flatMap((page) => page.media || []) || [], [data]);

  const availableGenres = useMemo(() => {
    const set = new Set();
    animes.forEach((anime) => {
      (anime.genres || []).forEach((genre) => set.add(genre));
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [animes]);

  const filteredAnimes = useMemo(() => {
    return animes.filter((anime) => {
      const matchesGenre = selectedGenre ? (anime.genres || []).includes(selectedGenre) : true;
      const score = anime.averageScore ?? 0;
      const matchesScore = score >= minScore;
      return matchesGenre && matchesScore;
    });
  }, [animes, minScore, selectedGenre]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '250px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, animes.length]);

  const onSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const resetExplore = () => {
    setSearch('');
    setSearchInput('');
    setSelectedGenre('');
    setMinScore(0);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setMinScore(0);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h1 className="text-2xl font-bold text-amber-300">Discover Anime</h1>
        <p className="mt-1 text-sm text-slate-400">Busca y explora anime popular desde AniList.</p>

        <form onSubmit={onSearch} className="mt-4 flex flex-wrap gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Naruto, One Piece, Attack on Titan..."
            className="min-w-64 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          <button
            type="submit"
            className="rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300"
          >
            Search
          </button>
          <button
            type="button"
            onClick={resetExplore}
            className="rounded-md border border-slate-600 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-800"
          >
            Explore
          </button>
        </form>

        <div className="mt-4 grid gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm text-slate-300">
            Genre
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="">All genres</option>
              {availableGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Minimum score: <span className="font-semibold text-amber-300">{minScore}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="mt-3 w-full accent-amber-400"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="self-end rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>
      </div>

      {isLoading && <Loader text="Loading animes..." />}
      {isError && (
        <p className="rounded-md border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-300">
          Error loading animes: {error?.message || 'Unknown error'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <p className="text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-100">{filteredAnimes.length}</span> of{' '}
            <span className="font-semibold text-slate-100">{animes.length}</span> loaded results.
          </p>

          {!filteredAnimes.length ? (
            <p className="rounded-md border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300">
              No results match current filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAnimes.map((anime) => (
                <AnimeCard key={`${anime.id}`} anime={anime} />
              ))}
            </div>
          )}

          {isFetchingNextPage && <Loader text="Loading more..." />}

          <div ref={sentinelRef} className="h-6" />

          {!hasNextPage && animes.length > 0 && (
            <p className="text-center text-sm text-slate-500">No more results.</p>
          )}

          {isFetching && !isFetchingNextPage && (
            <p className="text-center text-xs text-slate-500">Refreshing results...</p>
          )}
        </>
      )}
    </section>
  );
};

export default HomePage;
