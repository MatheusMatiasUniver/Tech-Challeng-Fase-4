import { memo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { colors, fonts, radii } from '../theme'
import { type Post } from '../types/api'
import { authorName, excerpt } from '../utils/format'

interface Props {
  post: Post
  onPress: (post: Post) => void
}

// Cartao da Fase 3: titulo serifado, autor em caixa alta, resumo e "Ler mais →".
// No site o cartao sobe no hover; no toque, a borda escurece enquanto pressionado.
// memo: a FlatList re-renderiza os itens visiveis a cada mudanca de estado da
// tela (ex.: digitar na busca); com memo, o cartao so renderiza se o post mudar.
export const PostCard = memo(function PostCard({ post, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(post)}
      accessibilityRole="button"
      accessibilityLabel={`Ler o post ${post.title}`}
    >
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.author}>{authorName(post).toUpperCase()}</Text>
      <Text style={styles.excerpt} numberOfLines={4}>
        {excerpt(post.content)}
      </Text>
      <Text style={styles.readMore}>Ler mais →</Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 22,
    gap: 12,
  },
  pressed: { borderColor: colors.ink },
  title: { fontFamily: fonts.heading, fontSize: 27, lineHeight: 31, color: colors.textH },
  author: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 0.8, color: colors.muted },
  excerpt: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25, color: colors.text },
  readMore: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.accent,
  },
})
