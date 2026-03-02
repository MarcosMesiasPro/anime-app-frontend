import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react'
import useToastStore from '../../store/toastStore.js'
import { cn } from '../../utils/cn.js'

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={16} className="text-red-400 shrink-0" />,
  info: <AlertCircle size={16} className="text-blue-400 shrink-0" />,
}

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

const Toast = () => {
  const { toasts, remove } = useToastStore()

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-right-4 text-sm text-zinc-100',
            colors[t.type] || colors.info
          )}
        >
          {icons[t.type] || icons.info}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
