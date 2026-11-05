import { StyleSheet, Text, View } from 'react-native'

import { colors, fonts } from '../theme'
import { SmallButton } from './SmallButton'

interface Props {
  page: number
  totalPages: number
  disabled?: boolean
  onChange: (page: number) => void
}

// "Anterior · Pagina X de Y · Proxima". Botoes em vez de rolagem infinita
// porque o requisito pede lista paginada e assim o professor sabe quantas
// paginas existem (a API devolve totalPages).
export function Pagination({ page, totalPages, disabled, onChange }: Props) {
  if (totalPages <= 1) return null
  return (
    <View style={styles.row}>
      <SmallButton
        label="‹ Anterior"
        a11y="Página anterior"
        variant="outline"
        disabled={disabled || page <= 1}
        onPress={() => onChange(page - 1)}
      />
      <Text style={styles.label} accessibilityLiveRegion="polite">
        Página {page} de {totalPages}
      </Text>
      <SmallButton
        label="Próxima ›"
        a11y="Próxima página"
        variant="outline"
        disabled={disabled || page >= totalPages}
        onPress={() => onChange(page + 1)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
})
