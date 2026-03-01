import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { updateMyProfileRequest } from '../api/users.api';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const schema = z.object({
  username: z.string().min(3, 'Minimo 3 caracteres').max(30, 'Maximo 30 caracteres').optional(),
  avatarUrl: z.union([z.string().url('URL invalida'), z.literal('')]).optional(),
  bio: z.string().max(300, 'Maximo 300 caracteres').optional(),
});

const EditProfilePage = () => {
  const { user, setAuth, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username || '',
      avatarUrl: user?.avatarUrl || '',
      bio: user?.bio || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMyProfileRequest,
    onSuccess: (response) => {
      setAuth((prev) => {
        const next = { ...prev, user: response.user };
        localStorage.setItem('anime_app_auth', JSON.stringify(next));
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['profile', user?._id] });
      showToast({ message: 'Perfil actualizado', type: 'success' });
      navigate('/profile');
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'No se pudo actualizar el perfil', type: 'error' });
    },
  });

  const onSubmit = async (values) => {
    try {
      if (!token) {
        throw new Error('Missing auth token');
      }
      await updateMutation.mutateAsync(values);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'No se pudo actualizar el perfil';
      setError('root', {
        message,
      });
    }
  };

  return (
    <section className="mx-auto max-w-lg rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="mb-4 text-2xl font-bold text-amber-300">Edit Profile</h1>

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
          <label className="mb-1 block text-sm text-slate-300">Avatar URL</label>
          <input
            type="text"
            {...register('avatarUrl')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          {errors.avatarUrl && <p className="mt-1 text-xs text-rose-400">{errors.avatarUrl.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Bio</label>
          <textarea
            rows={4}
            {...register('bio')}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
          {errors.bio && <p className="mt-1 text-xs text-rose-400">{errors.bio.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-rose-400">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
          className="w-full rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
        >
          {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  );
};

export default EditProfilePage;
