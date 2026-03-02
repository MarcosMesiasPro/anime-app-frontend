import { Link, useNavigate } from 'react-router-dom'
import { Heart, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore.js'
import useToastStore from '../../store/toastStore.js'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { toast } = useToastStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast('Sesión cerrada', 'info')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-anime-border bg-anime-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-zinc-100">
          <span className="text-2xl">⚡</span>
          <span>AnimeTrack</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <Heart size={16} />
                Favoritos
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User size={16} />
                )}
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-anime-border bg-anime-bg px-4 py-3 flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800">
                <Heart size={16} /> Favoritos
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800">
                <User size={16} /> Perfil — {user?.username}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 text-left">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800">Iniciar sesión</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
