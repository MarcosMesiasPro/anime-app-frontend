import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <h1 className="text-3xl font-bold text-amber-300">404</h1>
      <p className="mt-2 text-slate-300">Page not found.</p>
      <Link to="/" className="mt-4 inline-flex rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950">
        Back home
      </Link>
    </section>
  );
};

export default NotFoundPage;
