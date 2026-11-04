import { useEffect, useState } from 'react'

// Devolve o valor so depois que ele parar de mudar por `delayMs`.
// Na busca, evita uma requisicao a cada letra digitada.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
