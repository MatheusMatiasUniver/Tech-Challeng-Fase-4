// Tipos espelhando as respostas da API da Fase 2 (serializeUser/serializePost).

export type UserRole = 'professor' | 'aluno'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

// Erros da API vem como { message, ...detalhes } (ver error-handler.ts).
export interface ApiErrorBody {
  message: string
  [detail: string]: unknown
}

export interface PostAuthor {
  id: string
  name: string
  email: string
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
  // A API sempre carrega o autor em list/search/get; fica opcional porque
  // create/update devolvem o post sem a relacao.
  author?: PostAuthor
}

// Listas de professores e alunos sao paginadas: { data, meta } (ver list-users.ts).
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}
