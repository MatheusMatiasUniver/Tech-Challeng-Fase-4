import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../../auth/AuthContext'
import { colors, spacing } from '../../theme'

export function AccountScreen() {
  const { user, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role === 'professor' ? 'Professor(a)' : 'Aluno(a)'}</Text>

      <Pressable style={styles.button} onPress={signOut} accessibilityRole="button">
        <Text style={styles.buttonText}>Sair</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  name: { fontSize: 22, fontWeight: '600', color: colors.text },
  email: { marginTop: spacing.xs, color: colors.muted },
  role: { marginTop: spacing.sm, color: colors.primary, fontWeight: '500' },
  button: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { color: colors.danger, fontWeight: '600' },
})
