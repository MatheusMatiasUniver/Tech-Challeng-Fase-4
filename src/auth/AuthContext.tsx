import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { authApi } from '../api/auth'
import { setAuthToken, setUnauthorizedHandler } from '../api/client'
import { type User } from '../types/api'
import { tokenStorage } from './tokenStorage'

// 'restoring': o app acabou de abrir e ainda esta conferindo o token salvo.
type AuthStatus = 'restoring' | 'signedOut' | 'signedIn'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isTeacher: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  // Atualiza os dados do usuario logado depois que ele edita o proprio cadastro.
  updateCurrentUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring')
  const [user, setUser] = useState<User | null>(null)

  const signOut = useCallback(async () => {
    setAuthToken(null)
    setUser(null)
    setStatus('signedOut')
    await tokenStorage.clear()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { access_token, user: loggedUser } = await authApi.login(
      email,
      password,
    )
    setAuthToken(access_token)
    await tokenStorage.set(access_token)
    setUser(loggedUser)
    setStatus('signedIn')
  }, [])

  // So aceita o proprio usuario: editar outra pessoa nao troca quem esta logado.
  const updateCurrentUser = useCallback((updated: User) => {
    setUser((current) => (current !== null && current.id === updated.id ? updated : current))
  }, [])

  // Qualquer 401 com token (expirado, usuario excluido) derruba a sessao.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut()
    })
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  // Ao abrir o app: se ha token salvo, /auth/me confirma que ele ainda vale
  // e traz o papel atualizado do banco.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      let token: string | null
      try {
        token = await tokenStorage.get()
      } catch {
        // Falha ao ler o armazenamento seguro (raro, mas acontece em alguns
        // Android apos restaurar backup): segue sem sessao em vez de travar
        // na tela de carregamento.
        token = null
      }
      if (token === null) {
        if (!cancelled) setStatus('signedOut')
        return
      }

      setAuthToken(token)
      try {
        const me = await authApi.me()
        if (cancelled) return
        setUser(me)
        setStatus('signedIn')
      } catch {
        // 401 ja cai no signOut pelo interceptor; outros erros (sem rede)
        // tambem voltam para o login para nao prender o usuario no carregamento.
        if (!cancelled) await signOut()
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isTeacher: user?.role === 'professor',
      signIn,
      signOut,
      updateCurrentUser,
    }),
    [status, user, signIn, signOut, updateCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  }
  return context
}
