import { DefaultTheme, type Theme } from '@react-navigation/native'

import { colors, fonts } from '../theme'

// Tema do React Navigation com as cores da Fase 3: fundo creme nos cabecalhos
// (como o header do site), vinho como cor de destaque e Public Sans nos rotulos.
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg,
    text: colors.textH,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' },
    medium: { fontFamily: fonts.medium, fontWeight: '500' },
    bold: { fontFamily: fonts.semibold, fontWeight: '600' },
    heavy: { fontFamily: fonts.bold, fontWeight: '700' },
  },
}

// Titulos de cabecalho em serifa, como os h1/h2 do site.
export const headerTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 26,
  color: colors.textH,
}
