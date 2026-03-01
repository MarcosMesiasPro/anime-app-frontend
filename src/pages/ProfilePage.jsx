import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { getUserProfileRequest } from '../api/users.api';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?._id],
    queryFn: () => getUserProfileRequest(user._id),
    enabled: Boolean(user?._id),
  });

  if (isLoading) return <Loader text="Loading profile..." />;

  const profile = data?.user;

  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-amber-300">My Profile</h1>

      <div className="space-y-2 text-slate-200">
        <p>
          <span className="font-semibold text-slate-400">Username:</span> {profile?.username}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Email:</span> {profile?.email}
        </p>
        <p>
          <span className="font-semibold text-slate-400">Bio:</span> {profile?.bio || 'No bio yet.'}
        </p>
      </div>

      <Link
        to="/profile/edit"
        className="inline-flex rounded-md bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300"
      >
        Edit profile
      </Link>
    </section>
  );
};

export default ProfilePage;
