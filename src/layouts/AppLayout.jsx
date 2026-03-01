import { Outlet } from 'react-router-dom';

import Navbar from '../components/Navbar';
import ToastViewport from '../components/ToastViewport';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937,transparent_40%),linear-gradient(160deg,#020617,#0f172a_45%,#1e293b)] text-slate-100">
      <ToastViewport />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
