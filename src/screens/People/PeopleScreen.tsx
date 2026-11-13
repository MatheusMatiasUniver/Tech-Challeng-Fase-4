import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useCallback, useRef, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { usersApiFor } from '../../api/users'
import { useAuth } from '../../auth/AuthContext'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Notice } from '../../components/Notice'
import { Pagination } from '../../components/Pagination'
import { SmallButton } from '../../components/SmallButton'
import { type AppStackParamList, type AppTabsParamList } from '../../navigation/types'
import { colors, fonts, radii } from '../../theme'
import { type ApiErrorBody, type PaginationMeta, type User, type UserRole } from '../../types/api'

type Props = BottomTabScreenProps<AppTabsParamList, 'People'>
type StackNav = NativeStackNavigationProp<AppStackParamList>
type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: User[]; meta: PaginationMeta }
type Announcement = { tone: 'info' | 'error'; message: string } | null
// Excluir professor pode ter duas etapas: a primeira tenta sem apagar posts;
// se a API responder TEACHER_HAS_POSTS, a segunda pergunta de novo, agora
// avisando quantos posts serao apagados junto.
type PendingDelete = { user: User; postsCount?: number } | null

const labels: Record<UserRole, { plural: string; singular: string; empty: string }> = {
  professor: { plural: 'Professores', singular: 'professor', empty: 'Nenhum professor cadastrado.' },
  aluno: { plural: 'Alunos', singular: 'aluno', empty: 'Nenhum aluno cadastrado.' },
}

function apiErrorBody(err: unknown): ApiErrorBody | undefined {
  return isAxiosError<ApiErrorBody>(err) ? err.response?.data : undefined
}

// Cadastro de professores e alunos (requisitos 5 a 8): uma tela com duas
// listas, porque a API trata os dois do mesmo jeito e assim nao duplicamos
// telas. A aba so existe para professor; a regra de verdade e o 403 da API.
export function PeopleScreen({ route }: Props) {
  const { user: me } = useAuth()
  const stack = useNavigation<StackNav>()
  const [role, setRole] = useState<UserRole>('professor')
  // Cada lista guarda a propria pagina: trocar de aba nao perde onde estava.
  const [pages, setPages] = useState<Record<UserRole, number>>({ professor: 1, aluno: 1 })
  const page = pages[role]
  const [list, setList] = useState<ListState>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const [deleting, setDeleting] = useState(false)
  const lastNotice = useRef<string | undefined>(undefined)
  // Ignora respostas antigas se o usuario trocar de pagina/lista rapido.
  const requestId = useRef(0)

  const load = useCallback(async (targetRole: UserRole, targetPage: number) => {
    const current = ++requestId.current
    try {
      const result = await usersApiFor(targetRole).list(targetPage)
      if (current !== requestId.current) return
      // Depois de excluir o ultimo item da ultima pagina, ela deixa de existir:
      // volta para a ultima pagina que ainda tem gente.
      if (result.data.length === 0 && targetPage > 1 && result.meta.totalPages < targetPage) {
        const lastPage = Math.max(1, result.meta.totalPages)
        setPages((p) => ({ ...p, [targetRole]: lastPage }))
        return
      }
      setList({ status: 'ready', users: result.data, meta: result.meta })
    } catch (err) {
      if (current !== requestId.current) return
      setList({ status: 'error', message: getErrorMessage(err) })
    }
  }, [])

  // Recarrega ao focar a aba (ex.: voltando do formulario) e quando muda a
  // lista ou a pagina. O aviso de sucesso e a lista certa vem pela rota.
  const notice = route.params?.notice
  const noticeRole = route.params?.role
  useFocusEffect(
    useCallback(() => {
      if (notice !== undefined && notice !== lastNotice.current) {
        lastNotice.current = notice
        setAnnouncement({ tone: 'info', message: notice })
        if (noticeRole !== undefined && noticeRole !== role) {
          setRole(noticeRole)
          return
        }
      }
      setList({ status: 'loading' })
      void load(role, page)
    }, [load, role, page, notice, noticeRole]),
  )

  function switchRole(next: UserRole) {
    if (next === role) return
    setAnnouncement(null)
    setRole(next)
  }

  function changePage(next: number) {
    setPages((p) => ({ ...p, [role]: next }))
  }

  async function refresh() {
    setRefreshing(true)
    await load(role, page)
    setRefreshing(false)
  }

  async function confirmDelete() {
    if (pendingDelete === null) return
    const { user, postsCount } = pendingDelete
    setDeleting(true)
    try {
      await usersApiFor(user.role).remove(user.id, { deletePosts: postsCount !== undefined })
      setAnnouncement({
        tone: 'info',
        message:
          postsCount !== undefined
            ? `${user.name} e ${postsCount === 1 ? 'o post' : `os ${postsCount} posts`} foram excluídos.`
            : `${user.name} foi excluído.`,
      })
      setPendingDelete(null)
      void load(role, page)
    } catch (err) {
      const body = apiErrorBody(err)
      const status = isAxiosError(err) ? err.response?.status : undefined
      if (body?.code === 'TEACHER_HAS_POSTS') {
        // Nao apaga nada sem perguntar: reabre o dialogo com a contagem.
        setPendingDelete({ user, postsCount: Number(body.postsCount) || 0 })
      } else {
        setPendingDelete(null)
        setAnnouncement({
          tone: 'error',
          message:
            body?.code === 'CANNOT_DELETE_SELF'
              ? 'Você não pode excluir a própria conta.'
              : status === 404
                ? `Este ${labels[user.role].singular} já havia sido removido.`
                : getErrorMessage(err),
        })
        if (status === 404) void load(role, page)
      }
    } finally {
      setDeleting(false)
    }
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.subtitle}>
        Cadastre, edite e remova professores e alunos da plataforma.
      </Text>
      <View style={styles.segment} accessibilityRole="tablist">
        {(['professor', 'aluno'] as const).map((option) => {
          const selected = option === role
          return (
            <Pressable
              key={option}
              onPress={() => switchRole(option)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.segmentItem, selected && styles.segmentSelected]}
            >
              <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                {labels[option].plural}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {list.status === 'ready'
            ? `${list.meta.total} ${list.meta.total === 1 ? labels[role].singular : labels[role].plural.toLowerCase()}`
            : ' '}
        </Text>
        <Button
          title={`+ Novo ${labels[role].singular}`}
          onPress={() => stack.navigate('UserForm', { role })}
        />
      </View>
      {announcement !== null && <Notice tone={announcement.tone} message={announcement.message} />}
    </View>
  )

  let empty: React.ReactElement
  if (list.status === 'loading') empty = <AsyncState status="loading" label="Carregando..." />
  else if (list.status === 'error')
    empty = <AsyncState status="error" message={list.message} onRetry={() => load(role, page)} />
  else empty = <AsyncState status="empty" label={labels[role].empty} />

  const pendingName = pendingDelete?.user.name ?? ''
  const pendingCount = pendingDelete?.postsCount

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={list.status === 'ready' ? list.users : []}
        keyExtractor={(user) => user.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          list.status === 'ready' ? (
            <Pagination page={list.meta.page} totalPages={list.meta.totalPages} onChange={changePage} />
          ) : undefined
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.accent]} tintColor={colors.accent} />
        }
        renderItem={({ item }) => {
          const isMe = item.id === me?.id
          return (
            <View style={styles.row}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                {isMe && <Text style={styles.youBadge}>Você</Text>}
              </View>
              <Text style={styles.email}>{item.email}</Text>
              <View style={styles.actions}>
                <SmallButton
                  label="Editar"
                  a11y={`Editar ${item.name}`}
                  variant="ink"
                  onPress={() => stack.navigate('UserForm', { role: item.role, id: item.id })}
                />
                {/* A API recusa excluir a propria conta (CANNOT_DELETE_SELF);
                    o botao some para nao oferecer algo que vai falhar. */}
                {!isMe && (
                  <SmallButton
                    label="Excluir"
                    a11y={`Excluir ${item.name}`}
                    variant="danger"
                    onPress={() => {
                      setAnnouncement(null)
                      setPendingDelete({ user: item })
                    }}
                  />
                )}
              </View>
            </View>
          )
        }}
      />
      <ConfirmDialog
        visible={pendingDelete !== null}
        title={pendingCount !== undefined ? 'Excluir também os posts?' : `Excluir ${pendingDelete ? labels[pendingDelete.user.role].singular : ''}?`}
        message={
          pendingCount !== undefined
            ? `${pendingName} é autor de ${pendingCount === 1 ? '1 post' : `${pendingCount} posts`}. Para excluir a conta, ${pendingCount === 1 ? 'esse post também será apagado' : 'esses posts também serão apagados'}. Essa ação não pode ser desfeita.`
            : `${pendingName} perderá o acesso à plataforma. Essa ação não pode ser desfeita.`
        }
        confirmLabel={pendingCount !== undefined ? 'Excluir tudo' : 'Excluir'}
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
  // Controle segmentado no lugar de duas abas a mais: as listas sao irmas.
  segment: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: 'center' },
  segmentSelected: { backgroundColor: colors.ink },
  segmentLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  segmentLabelSelected: { color: colors.onInk },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  count: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: colors.textH },
  youBadge: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.accent,
    backgroundColor: colors.accentBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  email: { marginTop: 4, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
})
