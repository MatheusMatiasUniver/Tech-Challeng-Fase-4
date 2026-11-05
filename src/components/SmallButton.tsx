import { Pressable, StyleSheet, Text } from 'react-native'

import { colors, fonts } from '../theme'

type Variant = 'outline' | 'ink' | 'danger'

interface Props {
  label: string
  // Rotulo para leitor de tela, com o nome do item ("Editar Ana Souza").
  a11y: string
  variant: Variant
  onPress: () => void
  disabled?: boolean
}

// Botoes menores das linhas das listas administrativas, iguais aos
// Ver/Editar/Excluir do admin da Fase 3. Usado em Administracao e em Pessoas.
export function SmallButton({ label, a11y, variant, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.small,
        variants[variant],
        pressed && pressedVariants[variant],
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, labels[variant]]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  small: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 9, borderWidth: 1 },
  label: { fontFamily: fonts.semibold, fontSize: 14 },
  disabled: { opacity: 0.45 },
})

const variants = StyleSheet.create({
  outline: { borderColor: colors.borderStrong },
  ink: { borderColor: colors.ink, backgroundColor: colors.ink },
  danger: { borderColor: colors.accentSoft },
})
const pressedVariants = StyleSheet.create({
  outline: { borderColor: colors.ink },
  ink: { borderColor: colors.accent, backgroundColor: colors.accent },
  danger: { backgroundColor: colors.errorBg },
})
const labels = StyleSheet.create({
  outline: { color: colors.text },
  ink: { color: colors.onInk },
  danger: { color: colors.accent },
})
