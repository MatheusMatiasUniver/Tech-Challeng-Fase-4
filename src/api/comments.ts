import { type Comment } from '../types/api'
import { api } from './client'

// Mesmo limite do createCommentSchema da API.
export const COMMENT_MAX_LENGTH = 1000

// Ler e publico; comentar e excluir exigem login (qualquer papel). Excluir:
// autor do comentario ou professor autor do post, senao 403.
export const commentsApi = {
  async list(postId: string): Promise<Comment[]> {
    const { data } = await api.get<Comment[]>(`/posts/${postId}/comments`)
    return data
  },

  async create(postId: string, content: string): Promise<Comment> {
    const { data } = await api.post<Comment>(`/posts/${postId}/comments`, { content })
    return data
  },

  async remove(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`)
  },
}
