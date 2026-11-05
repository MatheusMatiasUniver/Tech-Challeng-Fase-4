import { type Post } from '../types/api'
import { api } from './client'

export interface PostInput {
  title: string
  content: string
}

// GET /posts e /posts/search devolvem arrays (sem paginacao) ordenados do mais
// novo para o mais antigo. Mantido assim para nao quebrar o front da Fase 3.
// Escrita exige professor; editar/excluir exige ser o autor (senao 403).
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

  // O autor nao vai no corpo: a API usa o dono do token.
  async create(input: PostInput): Promise<Post> {
    const { data } = await api.post<Post>('/posts', input)
    return data
  },

  async update(id: string, input: PostInput): Promise<Post> {
    const { data } = await api.put<Post>(`/posts/${id}`, input)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}
