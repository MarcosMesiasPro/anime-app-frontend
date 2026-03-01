import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const schema = z.object({
  username: z.string().min(3, 'Minimo 3 caracteres').max(30, 'Maximo 30 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
});

const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await registerAuth(values);
      showToast({ message: 'Cuenta creada correctamente', type: 'success' });
      navigate('/', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudo registrar la cuenta';
      setError('root', { message });
      showToast({ message, type: 'error' });
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="mb-4 text-2xl font-bold text-amber-300">Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Username</label>
          <input
            type="text"
            {...register('username')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-rose-400">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Ya tienes cuenta?{' '}
        <Link to="/login" className="text-amber-300 hover:text-amber-200">
          Inicia sesion
        </Link>
      </p>
    </section>
  );
};

export default RegisterPage;
