// Parametros de cada rota. Telas empilhadas (detalhe do post, formularios)
// entram aqui nos proximos PRs.
export type AuthStackParamList = {
  Login: undefined
}

export type AppStackParamList = {
  Tabs: undefined
  // O titulo vai junto so para o cabecalho aparecer na hora, antes do GET.
  PostDetail: { id: string; title?: string }
}

export type AppTabsParamList = {
  Posts: undefined
  AdminPosts: undefined
  People: undefined
  Account: undefined
}
