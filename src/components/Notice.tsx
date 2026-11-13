import { StyleSheet, Text, View } from 'react-native'

import { colors, fonts, radii } from '../theme'

// Aviso de resultado (sucesso ou erro) no topo das telas administrativas,
// equivalente ao "Announcement" da Fase 3.
export function Notice({ tone, message }: { tone: 'info' | 'error'; message: string }) {
  return (
    <View style={[styles.box, tone === 'error' ? styles.error : styles.info]}>
      <Text
        style={[styles.text, tone === 'error' && { color: colors.error }]}
        accessibilityRole={tone === 'error' ? 'alert' : 'text'}
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { padding: 14, borderRadius: radii.field, borderWidth: 1 },
  info: { backgroundColor: colors.accentBg, borderColor: colors.accentSoft },
  error: { backgroundColor: colors.errorBg, borderColor: colors.accentSoft },
  text: { fontFamily: fonts.regular, fontSize: 15, color: colors.textH },
})
