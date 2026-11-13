import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, fonts, radii } from '../theme'
import { Button } from './Button'

interface Props {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Dialogo de confirmacao no estilo do DeletePostDialog da Fase 3. Usa Modal em
// vez de Alert.alert para seguir o visual do app (e porque o Alert nativo nao
// tem botoes na versao web usada nas previas).
export function ConfirmDialog({ visible, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onCancel} accessibilityLabel="Fechar">
        {/* Pressable interno impede que o toque no cartao feche o dialogo. */}
        <Pressable style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onCancel} disabled={busy} style={styles.flex} />
            <Button title={confirmLabel} variant="accent" onPress={onConfirm} loading={busy} style={styles.flex} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(22, 24, 29, 0.45)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    gap: 10,
  },
  title: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 34, color: colors.textH },
  message: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.text },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  flex: { flex: 1 },
})
