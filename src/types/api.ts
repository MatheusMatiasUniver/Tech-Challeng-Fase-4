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
