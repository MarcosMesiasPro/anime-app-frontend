import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/authApi.js'
import useAuthStore from '../store/authStore.js'
import useToastStore from '../store/toastStore.js'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const { toast } = useToastStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email requerido'
    if (!form.password) errs.password = 'Contraseña requerida'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    setErrors({})
    try {
      const { data } = await login(form)
      setAuth(data.data.user, data.data.token)
      toast(`Bienvenido, ${data.data.user.username}`, 'success')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión'
      toast(msg, 'error')
      if (err.response?.status === 401) {
        setErrors({ password: 'Email o contraseña incorrectos' })
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
          <h1 className="mt-3 text-2xl font-bold text-zinc-100">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-zinc-500">Bienvenido de vuelta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
