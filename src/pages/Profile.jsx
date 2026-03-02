import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { api } from '../services/api';
import { User, Camera, Mail } from 'lucide-react';

const Profile = () => {
  const { user, checkAuth } = useAuthStore();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar === 'default-avatar.png' ? '' : (user?.avatar || '')
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/profile', formData);
      await checkAuth(); // Recargar los datos del usuario en el store global
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800">
        
        {/* Header / Banner Cover del perfil (decorativo) */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary/50"></div>

        <div className="px-6 sm:px-10 pb-8">
          {/* Avatar superpuesto */}
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {formData.avatar || (user.avatar && user.avatar !== 'default-avatar.png') ? (
                <img 
                  src={formData.avatar || user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-gray-500" />
              )}
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors"
              >
                Editar Perfil
              </button>
            )}
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de Usuario</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  <Camera size={14} /> URL de Avatar (Imagen)
                </label>
                <input 
                  type="url" 
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Pega el link directo a una imagen (jpg, png).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Biografía</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Escribe algo sobre ti, tus animes favoritos..."
                  maxLength={200}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Mail size={14} />
                  {user.email}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Biografía</h3>
                {user.bio ? (
                  <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-4 rounded-lg border border-gray-800/50">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-gray-600 italic">Este usuario aún no ha escrito una biografía.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;