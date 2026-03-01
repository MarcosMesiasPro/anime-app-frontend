import useToast from '../hooks/useToast';

const toastTypeStyles = {
  success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
  error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
  info: 'border-cyan-500/40 bg-cyan-950/90 text-cyan-100',
};

const ToastViewport = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur ${toastTypeStyles[toast.type] || toastTypeStyles.info} ${toast.isLeaving ? 'toast-leave' : 'toast-enter'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded bg-slate-900/40 px-2 py-0.5 text-xs text-slate-100 hover:bg-slate-800/70"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;
