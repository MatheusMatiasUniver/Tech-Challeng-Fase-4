import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { postsApi } from '../../api/posts'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { type AppStackParamList } from '../../navigation/types'
import { colors, fonts } from '../../theme'
import { type Post } from '../../types/api'
import { formatPostMeta } from '../../utils/format'
import { CommentsSection } from './CommentsSection'

type Props = NativeStackScreenProps<AppStackParamList, 'PostDetail'>

type ViewState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; post: Post }

export function PostDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const [state, setState] = useState<ViewState>({ status: 'loading' })

  // Busca o post de novo em vez de reaproveitar o da lista: garante o conteudo
  // atualizado e permite abrir a tela so com o id (ex.: depois de editar).
  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      setState({ status: 'success', post: await postsApi.get(id) })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) setState({ status: 'not-found' })
      else setState({ status: 'error', message: getErrorMessage(err) })
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    // No iPhone o teclado cobriria o campo de comentario no fim da tela.
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {state.status === 'loading' && <AsyncState status="loading" label="Carregando post..." />}
        {state.status === 'error' && (
          <AsyncState status="error" message={state.message} onRetry={load} />
        )}
        {state.status === 'not-found' && (
          <View style={styles.notFound} accessibilityRole="alert">
            <Text style={styles.notFoundTitle}>Post não encontrado</Text>
            <Text style={styles.notFoundText}>Ele pode ter sido removido pelo autor.</Text>
            <Button title="Voltar para a lista" onPress={() => navigation.goBack()} />
          </View>
        )}
        {state.status === 'success' && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {state.post.title}
            </Text>
            <Text style={styles.meta}>{formatPostMeta(state.post)}</Text>
            <Text style={styles.body} selectable>
              {state.post.content}
            </Text>
            <CommentsSection postId={state.post.id} postAuthorId={state.post.authorId} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontFamily: fonts.heading, fontSize: 38, lineHeight: 41, color: colors.textH },
  meta: {
    marginTop: 18,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  body: {
    marginTop: 28,
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 32,
    color: colors.textBody,
  },
  notFound: {
    padding: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    gap: 12,
  },
  notFoundTitle: { fontFamily: fonts.heading, fontSize: 32, color: colors.textH },
  notFoundText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, marginBottom: 4 },
})
