// Tokens copiados do front web da Fase 3 (src/index.css), para o app e o site
// parecerem o mesmo produto. Os nomes seguem as variaveis CSS de la.
export const colors = {
  bg: '#f6f3ec', // --bg: fundo creme
  surface: '#fffdf8', // --surface: cartoes
  text: '#4a4e58', // --text: texto corrido
  textH: '#16181d', // --text-h: titulos
  textBody: '#232730', // --text-body: corpo do post
  border: '#e2dccf',
  borderStrong: '#cfc7b6',
  accent: '#b6003f', // --accent: vinho da marca
  accentBg: 'rgba(182, 0, 63, 0.08)',
  accentSoft: '#e7b3c4',
  error: '#7a0f33',
  errorBg: '#fdf0f4',
  ink: '#16181d', // --ink: botao principal
  onInk: '#f6f3ec',
  muted: '#655d4e',
  hoverBg: '#ece6d9',
  footerBg: '#f1ede4',
}

// No React Native cada peso de uma fonte customizada e um arquivo (familia)
// separado: fontWeight nao "engrossa" a fonte como no CSS. Por isso ha uma
// chave por peso, e os estilos usam fontFamily em vez de fontWeight.
export const fonts = {
  heading: 'InstrumentSerif_400Regular', // --heading: titulos serifados
  regular: 'PublicSans_400Regular', // --sans
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }

export const radii = { field: 10, card: 16, pill: 999 }
