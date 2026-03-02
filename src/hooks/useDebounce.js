import { useState, useEffect } from 'react'

// Retrasa la actualización del valor hasta que el usuario deja de escribir.
// Útil para evitar una petición a la API por cada tecla presionada.
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
