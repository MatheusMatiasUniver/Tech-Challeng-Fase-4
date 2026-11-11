import { useNavigation } from '@react-navigation/native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { COMMENT_MAX_LENGTH, commentsApi } from '../../api/comments'
import { useAuth } from '../../auth/AuthContext'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Notice } from '../../components/Notice'
import { SmallButton } from '../../components/SmallButton'
import { TextField } from '../../components/TextField'
import { type AppStackParamList } from '../../navigation/types'
import { colors, fonts, radii } from '../../theme'
import { type Comment } from '../../types/api'
import { formatDate } from '../../utils/format'

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; comments: Comment[] }

interface Props {
  postId: string
  // Para saber se o usuario logado pode moderar (professor autor do post).
  postAuthorId: string
}

// Comentarios (item opcional da Fase 4). Qualquer um le; para comentar
// precisa estar logado. Sem login, no lugar do campo aparece um convite
// para entrar, e o Login abre por cima e volta para este mesmo post.
export function CommentsSection({ postId, postAuthorId }: Props) {
  const { status, user } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const [list, setList] = useState<ListState>({ status: 'loading' })
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | undefined>(undefined)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'info' | 'error'; message: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      setList({ status: 'ready', comments: await commentsApi.list(postId) })
    } catch (err) {
      setList({ status: 'error', message: getErrorMessage(err) })
    }
  }, [postId])

  useEffect(() => {
    void load()
  }, [load])

  async function send() {
    // So envia com a lista carregada: o comentario novo entra no fim dela.
    // Com a lista ainda carregando ou com erro, ele sumiria da tela.
    if (list.status !== 'ready') return
    const content = draft.trim()
    if (content.length === 0) {
      setDraftError('Escreva algo antes de enviar.')
      return
    }
    setSending(true)
    setNotice(null)
    try {
      const created = await commentsApi.create(postId, content)
      // A lista e cronologica: o novo vai para o fim, sem outro GET.
      setList((current) =>
        current.status === 'ready' ? { status: 'ready', comments: [...current.comments, created] } : current,
      )
      setDraft('')
    } catch (err) {
      const code = isAxiosError(err) ? err.response?.status : undefined
      // 401 ja derruba a sessao pelo interceptor; a tela troca sozinha para
      // o convite de login. 404: o post foi apagado enquanto o usuario lia.
      if (code === 404) setNotice({ tone: 'error', message: 'Este post não existe mais.' })
      else if (code !== 401) setNotice({ tone: 'error', message: getErrorMessage(err) })
    } finally {
      setSending(false)
    }
  }

  async function confirmDelete() {
    if (pendingDelete === null) return
    const comment = pendingDelete
    setDeleting(true)
    try {
      await commentsApi.remove(postId, comment.id)
      setList((current) =>
        current.status === 'ready'
          ? { status: 'ready', comments: current.comments.filter((item) => item.id !== comment.id) }
          : current,
      )
      setNotice({ tone: 'info', message: 'Comentário excluído.' })
    } catch (err) {
      const code = isAxiosError(err) ? err.response?.status : undefined
      setNotice({
        tone: 'error',
        message:
          code === 403
            ? 'Você não pode excluir este comentário.'
            : code === 404
              ? 'Este comentário já havia sido removido.'
              : getErrorMessage(err),
      })
      if (code === 404) void load()
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  const count = list.status === 'ready' ? list.comments.length : null
  // Mesma regra da API: quem escreveu ou o professor dono do post.
  const canDelete = (comment: Comment) =>
    user !== null && (comment.authorId === user.id || postAuthorId === user.id)

  return (
    <View style={styles.section}>
      <Text style={styles.heading} accessibilityRole="header">
        Comentários{count !== null && count > 0 ? ` (${count})` : ''}
      </Text>

      {notice !== null && <Notice tone={notice.tone} message={notice.message} />}

      {list.status === 'loading' && <AsyncState status="loading" label="Carregando comentários..." />}
      {list.status === 'error' && <AsyncState status="error" message={list.message} onRetry={load} />}
      {list.status === 'ready' && list.comments.length === 0 && (
        <Text style={styles.empty}>Nenhum comentário ainda. Seja o primeiro a comentar.</Text>
      )}
      {list.status === 'ready' &&
        list.comments.map((comment) => {
          const mine = comment.authorId === user?.id
          return (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Text style={styles.author}>{comment.author?.name ?? 'Usuário'}</Text>
                {comment.author?.role === 'professor' && <Text style={styles.badge}>Professor</Text>}
                {mine && <Text style={[styles.badge, styles.badgeMine]}>Você</Text>}
              </View>
              <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
              <Text style={styles.content} selectable>
                {comment.content}
              </Text>
              {canDelete(comment) && (
                <View style={styles.commentActions}>
                  <SmallButton
                    label="Excluir"
                    a11y={`Excluir comentário de ${comment.author?.name ?? 'usuário'}`}
                    variant="danger"
                    onPress={() => {
                      setNotice(null)
                      setPendingDelete(comment)
                    }}
                  />
                </View>
              )}
            </View>
          )
        })}

      {status === 'signedIn' ? (
        <View style={styles.composer}>
          <TextField
            label="Deixe seu comentário"
            value={draft}
            onChangeText={(text) => {
              setDraft(text)
              setDraftError(undefined)
            }}
            error={draftError}
            multiline
            textAlignVertical="top"
            maxLength={COMMENT_MAX_LENGTH}
            editable={!sending}
            placeholder={`Comentando como ${user?.name ?? ''}`}
            style={styles.input}
          />
          <View style={styles.composerFooter}>
            <Text style={styles.counter}>
              {draft.length}/{COMMENT_MAX_LENGTH}
            </Text>
            <Button
              title="Comentar"
              onPress={send}
              loading={sending}
              disabled={list.status !== 'ready'}
            />
          </View>
        </View>
      ) : (
        <View style={styles.signInBox}>
          <Text style={styles.signInText}>Entre na sua conta para comentar.</Text>
          <Button title="Entrar para comentar" variant="secondary" onPress={() => navigation.navigate('Login')} />
        </View>
      )}

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Excluir comentário?"
        message="O comentário será removido permanentemente."
        confirmLabel="Excluir"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: 36,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 14,
  },
  heading: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 34, color: colors.textH },
  empty: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted },
  comment: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  author: { fontFamily: fonts.semibold, fontSize: 16, color: colors.textH },
  badge: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.onInk,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  badgeMine: { color: colors.accent, backgroundColor: colors.accentBg },
  date: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  content: { marginTop: 10, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.textBody },
  commentActions: { flexDirection: 'row', marginTop: 12 },
  composer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 18,
    gap: 12,
  },
  input: { minHeight: 110, lineHeight: 23 },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  signInBox: {
    padding: 20,
    borderRadius: radii.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    gap: 12,
    alignItems: 'flex-start',
  },
  signInText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
})
