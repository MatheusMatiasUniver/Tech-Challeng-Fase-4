import axios, { isAxiosError } from 'axios'

import { type ApiErrorBody } from '../types/api'

// EXPO_PUBLIC_* e embutida no bundle pelo Expo; troca-se a API sem mexer no codigo.
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://tech-challenge-vhbi.onrender.com'

export const api = axios.create({
  baseURL,
  // O Render gratuito "dorme" e a primeira requisicao pode levar ~50 s.
  timeout: 60_000,
})

// O token fica em memoria para nao ler o SecureStore (assincrono) a cada requisicao.
// Quem define o valor e o AuthContext.
let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  if (authToken !== null) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401 com token enviado = sessao invalida (expirada ou usuario excluido).
    // Sem token (ex.: senha errada no login) o 401 e so um erro da tela.
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      authToken !== null
    ) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

// Converte qualquer falha em uma mensagem que da para mostrar ao usuario.
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message
    if (error.code === 'ECONNABORTED') {
      return 'A API demorou demais para responder. Tente de novo.'
    }
    if (!error.response) return 'Sem conexão com a API.'
  }
  return 'Algo deu errado. Tente de novo.'
}
