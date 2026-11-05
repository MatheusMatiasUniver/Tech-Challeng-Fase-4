import { StyleSheet, Text } from 'react-native'

import { colors, fonts } from '../theme'

// Rotulo pequeno em caixa alta e espacado ("CONTEUDO ABERTO" na Fase 3).
export function Eyebrow({ children }: { children: string }) {
  return <Text style={styles.eyebrow}>{children.toUpperCase()}</Text>
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 1.8,
    color: colors.muted,
    marginBottom: 10,
  },
})
