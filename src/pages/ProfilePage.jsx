import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User, Edit3, Check, X, Camera } from 'lucide-react'
import { getUserProfile, updateProfile } from '../api/usersApi.js'
import useAuthStore from '../store/authStore.js'
import useToastStore from '../store/toastStore.js'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

const ProfilePage = () => {
  const { id } = useParams() // si no hay :id, es el perfil propio
  const { user: authUser, isAuthenticated, updateUser } = useAuthStore()
  const { toast } = useToastStore()

  // Si hay id en la URL es perfil público, si no es el propio
  const profileId = id || authUser?.id || authUser?._id
  const isOwn = !id || id === (authUser?.id || authUser?._id)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ username: '', bio: '', avatar: '', currentPassword: '', newPassword: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!profileId) return
    setLoading(true)
    getUserProfile(profileId)
      .then(({ data }) => {
        setProfile(data.data.user)
        setForm((prev) => ({ ...prev, username: data.data.user.username, bio: data.data.user.bio || '', avatar: data.data.user.avatar || '' }))
      })
      .catch(() => toast('Error al cargar el perfil', 'error'))
      .finally(() => setLoading(false))
  }, [profileId])

  const validate = () => {
    const errs = {}
    if (!form.username || form.username.length < 3) errs.username = 'Mínimo 3 caracteres'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Solo letras, números y _'
    if (form.bio.length > 200) errs.bio = 'Máximo 200 caracteres'
    if (form.newPassword && form.newPassword.length < 6) errs.newPassword = 'Mínimo 6 caracteres'
    if (form.newPassword && !form.currentPassword) errs.currentPassword = 'Ingresa tu contraseña actual'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setSaving(true)
    setErrors({})
    try {
      const payload = {
        username: form.username,
        bio: form.bio,
        avatar: form.avatar || undefined,
      }
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword
        payload.newPassword = form.newPassword
      }

      const { data } = await updateProfile(payload)
      updateUser(data.data.user)
      setProfile((prev) => ({ ...prev, ...data.data.user }))
      setEditing(false)
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
      toast('Perfil actualizado', 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar'
      toast(msg, 'error')
      if (msg.toLowerCase().includes('contrase')) {
        setErrors({ currentPassword: msg })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!profile) return <div className="text-center text-zinc-500 py-24">Perfil no encontrado</div>

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Card de perfil */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {editing && form.avatar ? (
              <img src={form.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-violet-500" onError={(e) => e.target.classList.add('hidden')} />
            ) : profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-anime-border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-violet-600/20 flex items-center justify-center border-2 border-anime-border">
                <User size={32} className="text-violet-400" />
              </div>
            )}
          </div>

          {/* Info / Form */}
          <div className="flex-1 w-full">
            {editing ? (
              <div className="flex flex-col gap-3">
                <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username} />
                <Input label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} error={errors.bio} placeholder="Cuéntanos algo de ti..." />
                <Input label="URL del avatar" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." />
                <hr className="border-anime-border" />
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Cambiar contraseña (opcional)</p>
                <Input label="Contraseña actual" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} />
                <Input label="Nueva contraseña" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleSave} loading={saving}><Check size={16} /> Guardar</Button>
                  <Button variant="secondary" onClick={() => { setEditing(false); setErrors({}) }}><X size={16} /> Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-zinc-100">{profile.username}</h1>
                  {isOwn && isAuthenticated && (
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-zinc-400">{profile.bio || 'Sin bio'}</p>
                <div className="mt-4 flex gap-6 text-sm text-zinc-500">
                  <div><span className="text-zinc-200 font-semibold">{profile.favoriteCount}</span> favoritos</div>
                  <div><span className="text-zinc-200 font-semibold">{profile.commentCount}</span> comentarios</div>
                </div>
                <p className="mt-3 text-xs text-zinc-600">
                  Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
