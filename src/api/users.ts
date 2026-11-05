import { type Paginated, type User, type UserRole } from '../types/api'
import { api } from './client'

export interface UserInput {
  name: string
  email: string
  password: string
}

// Na edicao todos os campos sao opcionais; sem senha, a senha atual continua.
export type UserUpdateInput = Partial<UserInput>

// Mesmo teto do paginationSchema da API (max 50, padrao 10).
export const PAGE_SIZE = 10

// /teachers e /students tem exatamente o mesmo contrato na API (um controller
// so, makeUsersController(role)). Por isso o app tambem usa uma fabrica: as
// duas telas de cadastro compartilham o codigo e so muda o caminho.
function makeUsersApi(path: '/teachers' | '/students') {
  return {
    async list(page: number, limit = PAGE_SIZE): Promise<Paginated<User>> {
      const { data } = await api.get<Paginated<User>>(path, { params: { page, limit } })
      return data
    },

    async get(id: string): Promise<User> {
      const { data } = await api.get<User>(`${path}/${id}`)
      return data
    },

    async create(input: UserInput): Promise<User> {
      const { data } = await api.post<User>(path, input)
      return data
    },

    async update(id: string, input: UserUpdateInput): Promise<User> {
      const { data } = await api.put<User>(`${path}/${id}`, input)
      return data
    },

    // deletePosts so faz sentido para professor: a API responde 409
    // TEACHER_HAS_POSTS e o app pergunta antes de apagar os posts junto.
    async remove(id: string, options: { deletePosts?: boolean } = {}): Promise<void> {
      await api.delete(`${path}/${id}`, {
        params: options.deletePosts ? { deletePosts: 'true' } : undefined,
      })
    },
  }
}

export const teachersApi = makeUsersApi('/teachers')
export const studentsApi = makeUsersApi('/students')

export function usersApiFor(role: UserRole) {
  return role === 'professor' ? teachersApi : studentsApi
}
