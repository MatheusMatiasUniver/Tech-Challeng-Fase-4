import { memo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { colors, spacing } from '../theme'
import { type Post } from '../types/api'
import { excerpt, formatDate } from '../utils/format'

interface Props {
  post: Post
  onPress: (post: Post) => void
}

// memo: a FlatList re-renderiza os itens visiveis a cada mudanca de estado da
// tela (ex.: digitar na busca); com memo, o cartao so renderiza se o post mudar.
export const PostCard = memo(function PostCard({ post, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(post)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir post ${post.title}`}
    >
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.meta}>
        {post.author?.name ?? 'Autor desconhecido'} · {formatDate(post.createdAt)}
      </Text>
      <Text style={styles.excerpt} numberOfLines={3}>
        {excerpt(post.content)}
      </Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: { opacity: 0.7 },
  title: { fontSize: 17, fontWeight: '600', color: colors.text },
  meta: { marginTop: spacing.xs, fontSize: 13, color: colors.muted },
  excerpt: { marginTop: spacing.sm, color: colors.text, lineHeight: 20 },
})
