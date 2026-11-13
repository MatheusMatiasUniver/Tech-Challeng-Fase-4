import { useCallback, useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '../api/client'
import { postsApi } from '../api/posts'
import { type Post } from '../types/api'

interface UsePostsResult {
  posts: Post[]
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => void
}

// Busca a lista (ou o resultado da busca, se `query` nao estiver vazio).
export function usePosts(query: string): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Cada requisicao ganha um numero; so a mais recente pode atualizar a tela.
  // Sem isso, uma resposta lenta de "rea" poderia sobrescrever a de "react".
  const lastRequest = useRef(0)

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const requestId = ++lastRequest.current
      if (mode === 'initial') setLoading(true)
      else setRefreshing(true)
      setError(null)

      try {
        const term = query.trim()
        const data = term === '' ? await postsApi.list() : await postsApi.search(term)
        if (requestId === lastRequest.current) setPosts(data)
      } catch (err) {
        if (requestId === lastRequest.current) setError(getErrorMessage(err))
      } finally {
        if (requestId === lastRequest.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [query],
  )

  useEffect(() => {
    void load('initial')
  }, [load])

  const refresh = useCallback(() => {
    void load('refresh')
  }, [load])

  return { posts, loading, refreshing, error, refresh }
}
