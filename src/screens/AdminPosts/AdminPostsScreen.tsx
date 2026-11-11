import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useCallback, useRef, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { postsApi } from '../../api/posts'
import { useAuth } from '../../auth/AuthContext'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Notice } from '../../components/Notice'
import { SmallButton } from '../../components/SmallButton'
import { type AppStackParamList, type AppTabsParamList } from '../../navigation/types'
import { colors, fonts } from '../../theme'
import { type Post } from '../../types/api'
import { formatPostMeta } from '../../utils/format'

type Props = BottomTabScreenProps<AppTabsParamList, 'AdminPosts'>
type StackNav = NativeStackNavigationProp<AppStackParamList>
type ListState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; posts: Post[] }
type Announcement = { tone: 'info' | 'error'; message: string } | null

export function AdminPostsScreen({ route }: Props) {
  const { user } = useAuth()
  const stack = useNavigation<StackNav>()
  const [list, setList] = useState<ListState>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement>(null)
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)
  const lastNotice = useRef<string | undefined>(undefined)
  // Cada GET ganha um numero e so o mais recente atualiza a lista. Excluir
  // tambem avanca o numero: um GET que saiu antes da exclusao ainda traz o
  // post apagado e nao pode devolver a linha para a tela.
  const generation = useRef(0)

  const load = useCallback(async () => {
    const current = ++generation.current
    try {
      const posts = await postsApi.list()
      if (current !== generation.current) return
      // A API so deixa o autor editar/excluir (403 para os outros), entao a
      // tela mostra so os posts do professor logado, como o admin da Fase 3.
      setList({ status: 'ready', posts: posts.filter((post) => post.authorId === user?.id) })
    } catch (err) {
      if (current !== generation.current) return
      setList({ status: 'error', message: getErrorMessage(err) })
    }
  }, [user?.id])

  // Recarrega sempre que a aba ganha foco: ao voltar do formulario a lista
  // ja mostra o post criado/editado. O aviso vem como parametro da rota.
  useFocusEffect(
    useCallback(() => {
      const notice = route.params?.notice
      if (notice !== undefined && notice !== lastNotice.current) {
        lastNotice.current = notice
        setAnnouncement({ tone: 'info', message: notice })
      }
      void load()
    }, [load, route.params?.notice]),
  )

  async function refresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function confirmDelete() {
    if (pendingDelete === null) return
    const post = pendingDelete
    setDeleting(true)
    try {
      await postsApi.remove(post.id)
      generation.current++
      // Remove da lista local sem esperar outro GET.
      setList((current) =>
        current.status === 'ready'
          ? { status: 'ready', posts: current.posts.filter((item) => item.id !== post.id) }
          : current,
      )
      setAnnouncement({ tone: 'info', message: 'Post excluído com sucesso.' })
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      setAnnouncement({
        tone: 'error',
        message:
          status === 403
            ? 'Você não tem permissão para excluir este post.'
            : status === 404
              ? 'Este post já havia sido removido.'
              : getErrorMessage(err),
      })
      if (status === 403 || status === 404) void load()
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.subtitle}>Seus posts. Só você pode editar e excluir estes conteúdos.</Text>
      <Button title="+ Novo post" onPress={() => stack.navigate('PostForm')} />
      {announcement !== null && <Notice tone={announcement.tone} message={announcement.message} />}
    </View>
  )

  let empty: React.ReactElement
  if (list.status === 'loading') empty = <AsyncState status="loading" label="Carregando posts..." />
  else if (list.status === 'error') empty = <AsyncState status="error" message={list.message} onRetry={load} />
  else empty = <AsyncState status="empty" label="Você ainda não publicou nenhum post." />

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={list.status === 'ready' ? list.posts : []}
        keyExtractor={(post) => post.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.accent]} tintColor={colors.accent} />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{formatPostMeta(item)}</Text>
            <View style={styles.actions}>
              <SmallButton
                label="Ver"
                a11y={`Ver ${item.title}`}
                variant="outline"
                onPress={() => stack.navigate('PostDetail', { id: item.id, title: item.title })}
              />
              <SmallButton
                label="Editar"
                a11y={`Editar ${item.title}`}
                variant="ink"
                onPress={() => stack.navigate('PostForm', { id: item.id })}
              />
              <SmallButton
                label="Excluir"
                a11y={`Excluir ${item.title}`}
                variant="danger"
                onPress={() => {
                  setAnnouncement(null)
                  setPendingDelete(item)
                }}
              />
            </View>
          </View>
        )}
      />
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Excluir post?"
        message={`"${pendingDelete?.title ?? ''}" será removido permanentemente.`}
        confirmLabel="Excluir"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  header: { gap: 14, marginBottom: 20 },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.text },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
  },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.textH },
  meta: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
})

