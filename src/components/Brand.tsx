import { StyleSheet, Text, View } from 'react-native'

import { colors, fonts } from '../theme'

// Marca da Fase 3: quadrado vinho + "Sala Aberta" em serifa.
export function Brand({ size = 26 }: { size?: number }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Sala Aberta">
      <View style={[styles.swatch, { width: size, height: size, borderRadius: size * 0.27 }]} />
      <Text style={[styles.name, { fontSize: size }]}>Sala Aberta</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { backgroundColor: colors.accent },
  name: { fontFamily: fonts.heading, color: colors.textH, letterSpacing: -0.2 },
})
