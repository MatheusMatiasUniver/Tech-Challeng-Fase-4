import { type NavigatorScreenParams } from '@react-navigation/native'

import { type UserRole } from '../types/api'

export type AppTabsParamList = {
  Posts: undefined
  // `notice`: aviso mostrado no topo depois de criar/editar (ex.: "Post publicado.").
  AdminPosts: { notice?: string } | undefined
  // `role` escolhe a lista aberta (professores ou alunos) ao voltar do formulario.
  People: { notice?: string; role?: UserRole } | undefined
  Account: undefined
}

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabsParamList> | undefined
  // O titulo vai junto so para o cabecalho aparecer na hora, antes do GET.
  PostDetail: { id: string; title?: string }
  // So existe enquanto ninguem esta logado.
  Login: undefined
  // Sem id cria um post; com id edita. So existe para professores.
  PostForm: { id?: string } | undefined
  // Cadastro de professor ou aluno: sem id cria, com id edita. So professores.
  UserForm: { role: UserRole; id?: string }
}
