import { useState } from 'react'
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'

import { colors, fonts, radii } from '../theme'

interface Props extends TextInputProps {
  label: string
  error?: string
  // A Fase 3 usa fundo creme nos campos dentro de cartao e branco fora dele.
  tone?: 'onSurface' | 'onBg'
}

// Campo com rotulo, igual ao FormField da Fase 3: rotulo em negrito acima,
// borda que fica vinho ao focar e mensagem de erro com ⚠ abaixo.
export function TextField({
  label,
  error,
  tone = 'onSurface',
  style,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          { backgroundColor: tone === 'onSurface' ? colors.bg : colors.surface },
          focused && styles.focused,
          error !== undefined && styles.invalid,
          style,
        ]}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        {...inputProps}
      />
      {error !== undefined && (
        <Text style={styles.error} accessibilityRole="alert">
          ⚠ {error}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textH },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textH,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.field,
  },
  // No site o foco e um contorno de 2px; no app, borda de 2px tem o mesmo efeito.
  focused: { borderColor: colors.accent, borderWidth: 2, paddingVertical: 11, paddingHorizontal: 13 },
  invalid: { borderColor: colors.error },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error },
})
