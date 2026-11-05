// Parametros de cada rota. Telas empilhadas (formularios) entram aqui nos
// proximos PRs.
export type AppStackParamList = {
  Tabs: undefined
  // O titulo vai junto so para o cabecalho aparecer na hora, antes do GET.
  PostDetail: { id: string; title?: string }
  // So existe enquanto ninguem esta logado.
  Login: undefined
}

export type AppTabsParamList = {
  Posts: undefined
  AdminPosts: undefined
  People: undefined
  Account: undefined
}
