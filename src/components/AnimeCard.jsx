import { Link } from 'react-router-dom';

const AnimeCard = ({ anime }) => {
  const title = anime?.title?.english || anime?.title?.romaji || 'Unknown title';

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-slate-950/40 transition hover:-translate-y-1 hover:border-amber-300/70">
      <img
        src={anime.coverImage?.large || anime.coverImage?.medium}
        alt={title}
        className="h-72 w-full object-cover"
      />
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">Score: {anime.averageScore ?? 'N/A'}</p>
        <Link
          to={`/anime/${anime.id}`}
          className="inline-flex rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300"
        >
          View details
        </Link>
      </div>
    </article>
  );
};

export default AnimeCard;
