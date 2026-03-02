import { cn } from '../../utils/cn.js'

const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500',
        sizes[size],
        className
      )}
    />
  )
}

export default Spinner
