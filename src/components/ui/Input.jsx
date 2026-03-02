import { cn } from '../../utils/cn.js'

const Input = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-sm font-medium text-zinc-300">{label}</label>
    )}
    <input
      className={cn(
        'input-field',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
)

export default Input
