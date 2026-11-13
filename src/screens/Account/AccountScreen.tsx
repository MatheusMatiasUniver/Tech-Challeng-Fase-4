import { StyleSheet, Text, View } from 'react-native'

import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/Button'
import { Eyebrow } from '../../components/Eyebrow'
import { colors, fonts, radii } from '../../theme'

export function AccountScreen() {
  const { user, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Eyebrow>Sua conta</Eyebrow>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.role === 'professor' ? 'Professor(a)' : 'Aluno(a)'}
          </Text>
        </View>
      </View>
      {/* Mesmo estilo do "Sair" da Fase 3: botao secundario com contorno. */}
      <Button title="Sair" variant="secondary" onPress={signOut} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg, gap: 18 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 22,
    gap: 6,
  },
  name: { fontFamily: fonts.heading, fontSize: 32, lineHeight: 36, color: colors.textH },
  email: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.accentBg,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.accent },
})
