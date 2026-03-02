// Utilidad para combinar clases de Tailwind de forma condicional
// (reemplaza clsx que no está instalado)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
