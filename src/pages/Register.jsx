import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await register(username, email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Crear Cuenta</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-1 text-sm">Nombre de Usuario</label>
          <input 
            type="text" 
            required
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-1 text-sm">Correo Electrónico</label>
          <input 
            type="email" 
            required
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-gray-400 mb-1 text-sm">Contraseña</label>
          <input 
            type="password" 
            required
            minLength={6}
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 mt-4"
        >
          {isLoading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-center text-gray-400 mt-6">
        ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default Register;