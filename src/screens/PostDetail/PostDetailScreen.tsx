import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { postsApi } from '../../api/posts'
import { type AppStackParamList } from '../../navigation/types'
import { colors, spacing } from '../../theme'
import { type Post } from '../../types/api'
import { formatDate } from '../../utils/format'

type Props = NativeStackScreenProps<AppStackParamList, 'PostDetail'>

export function PostDetailScreen({ route }: Props) {
  const { id } = route.params
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Busca o post de novo em vez de reaproveitar o da lista: garante o conteudo
  // atualizado e permite abrir a tela so com o id (ex.: depois de editar).
  const load = useCallback(async () => {
    setError(null)
    try {
      setPost(await postsApi.get(id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (error !== null) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retry} onPress={load} accessibilityRole="button">
          <Text style={styles.retryText}>Tentar de novo</Text>
        </Pressable>
      </View>
    )
  }

  if (post === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const edited = post.updatedAt !== post.createdAt

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        {post.title}
      </Text>
      <Text style={styles.meta}>
        {post.author?.name ?? 'Autor desconhecido'} · {formatDate(post.createdAt)}
        {edited ? ` · editado em ${formatDate(post.updatedAt)}` : ''}
      </Text>
      <Text style={styles.body} selectable>
        {post.content}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  meta: { marginTop: spacing.sm, color: colors.muted },
  body: { marginTop: spacing.lg, fontSize: 16, lineHeight: 24, color: colors.text },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  error: { color: colors.danger, textAlign: 'center' },
  retry: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  retryText: { color: colors.primary, fontWeight: '600' },
})
