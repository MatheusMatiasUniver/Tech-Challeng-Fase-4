import { type Post } from '../types/api'
import { api } from './client'

// GET /posts e /posts/search devolvem arrays (sem paginacao) ordenados do mais
// novo para o mais antigo. Mantido assim para nao quebrar o front da Fase 3.
export const postsApi = {
  async list(): Promise<Post[]> {
    const { data } = await api.get<Post[]>('/posts')
    return data
  },

  async search(query: string): Promise<Post[]> {
    const { data } = await api.get<Post[]>('/posts/search', { params: { q: query } })
    return data
  },

  async get(id: string): Promise<Post> {
    const { data } = await api.get<Post>(`/posts/${id}`)
    return data
  },
}
