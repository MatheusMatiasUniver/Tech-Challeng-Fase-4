import { StyleSheet, View } from 'react-native'

import { colors } from '../theme'
import { AsyncState } from './AsyncState'

// Tela provisoria usada enquanto cada funcionalidade nao e implementada.
// O titulo ja aparece no cabecalho da aba.
export function PlaceholderScreen({ description }: { description: string }) {
  return (
    <View style={styles.container}>
      <AsyncState status="empty" label={description} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.bg },
})
