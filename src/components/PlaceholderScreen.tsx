import { StyleSheet, Text, View } from 'react-native'

import { colors, spacing } from '../theme'

// Tela provisoria usada enquanto cada funcionalidade nao e implementada.
export function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  description: { marginTop: spacing.sm, color: colors.muted, textAlign: 'center' },
})
