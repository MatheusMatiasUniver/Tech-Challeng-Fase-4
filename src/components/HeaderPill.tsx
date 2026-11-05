import { Pressable, StyleSheet, Text } from 'react-native'

import { colors, fonts, radii } from '../theme'

// Botao em pilula do cabecalho, como o "Entrar" do topo do site da Fase 3.
export function HeaderPill({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  pressed: { backgroundColor: colors.accent },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: colors.onInk },
})
