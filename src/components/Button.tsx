import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native'

import { colors, fonts, radii } from '../theme'

type Variant = 'primary' | 'secondary' | 'accent'

interface Props {
  title: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

// Botoes da Fase 3: primario preto (--ink), secundario com contorno e
// "accent" vinho (usado no "Tentar novamente"). O hover do site vira o
// estado pressionado no toque: o primario fica vinho ao ser tocado.
export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) =>
        loading ? (
          <ActivityIndicator color={variant === 'secondary' ? colors.ink : colors.onInk} />
        ) : (
          <Text style={[styles.label, labelStyles[variant], pressed && variant === 'secondary' && { color: colors.ink }]}>
            {title}
          </Text>
        )
      }
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.field,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: colors.ink },
  secondary: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'transparent' },
  accent: { backgroundColor: colors.accent },
  disabled: { opacity: 0.6 },
  label: { fontFamily: fonts.semibold, fontSize: 16 },
})

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accent },
  secondary: { borderColor: colors.ink },
  accent: { backgroundColor: colors.ink },
})

const labelStyles = StyleSheet.create({
  primary: { color: colors.onInk },
  secondary: { color: colors.text, fontFamily: fonts.medium },
  accent: { color: '#ffffff' },
})
