import { Navigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <p className="p-8 text-center text-slate-300">Loading session...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
