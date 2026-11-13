import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, fonts } from '../theme'
import { Button } from './Button'

type Props =
  | { status: 'loading'; label?: string }
  | { status: 'empty'; label: string }
  | { status: 'error'; message: string; onRetry?: () => void }

// Mesmo componente da Fase 3: carregando, vazio (caixa tracejada) e erro
// (caixa rosada com "Tentar novamente").
export function AsyncState(props: Props) {
  if (props.status === 'loading') {
    return (
      <View style={styles.loading} accessibilityRole="progressbar">
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.text}>{props.label ?? 'Carregando...'}</Text>
      </View>
    )
  }

  if (props.status === 'empty') {
    return (
      <View style={styles.empty}>
        <Text style={[styles.text, styles.center]}>{props.label}</Text>
      </View>
    )
  }

  return (
    <View style={styles.errorBox}>
      <Text style={[styles.text, { color: colors.error }]} accessibilityRole="alert">
        {props.message}
      </Text>
      {props.onRetry && (
        <Button
          title="Tentar novamente"
          variant="accent"
          onPress={props.onRetry}
          style={styles.retry}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 48 },
  text: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  center: { textAlign: 'center', fontSize: 17 },
  empty: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: 14,
  },
  errorBox: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: 14,
    backgroundColor: colors.errorBg,
  },
  retry: { marginTop: 14, alignSelf: 'flex-start', paddingVertical: 10, minHeight: 0 },
})

