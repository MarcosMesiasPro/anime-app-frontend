import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi.js'
import useAuthStore from '../store/authStore.js'
import useToastStore from '../store/toastStore.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const { toast } = useToastStore()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.username || form.username.length < 3)
      errs.username = 'Username mínimo 3 caracteres'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      errs.username = 'Solo letras, números y _'
    if (!form.email) errs.email = 'Email requerido'
    if (!form.password || form.password.length < 6)
      errs.password = 'Contraseña mínimo 6 caracteres'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    setErrors({})
    try {
      const { data } = await register(form)
      setAuth(data.data.user, data.data.token)
      toast('Cuenta creada exitosamente', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrarse'
      toast(msg, 'error')
      if (err.response?.data?.errors?.length) {
        const fieldErrors = {}
        err.response.data.errors.forEach((e) => {
          if (e.toLowerCase().includes('username')) fieldErrors.username = e
          else if (e.toLowerCase().includes('email')) fieldErrors.email = e
          else if (e.toLowerCase().includes('contrase')) fieldErrors.password = e
        })
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-4xl">⚡</span>
          <h1 className="mt-3 text-2xl font-bold text-zinc-100">Crear cuenta</h1>
          <p className="mt-1 text-sm text-zinc-500">Únete a la comunidad anime</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username"
            name="username"
            placeholder="mi_username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
