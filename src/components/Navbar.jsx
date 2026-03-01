import { Link, NavLink } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-amber-400 text-slate-900' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
  }`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-wide text-amber-300">
          AnimeVerse
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Explore
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/favorites" className={navLinkClass}>
                Favorites
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                {user?.username || 'Profile'}
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
