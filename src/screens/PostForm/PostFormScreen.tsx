import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { postsApi } from '../../api/posts'
import { useAuth } from '../../auth/AuthContext'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { Notice } from '../../components/Notice'
import { TextField } from '../../components/TextField'
import { type AppStackParamList } from '../../navigation/types'
import { colors, fonts, radii } from '../../theme'

type Props = NativeStackScreenProps<AppStackParamList, 'PostForm'>

// Mesmo limite do schema da API (z.string().max(255)).
const TITLE_MAX_LENGTH = 255

interface FieldErrors {
  title?: string
  content?: string
}

function validate(title: string, content: string): FieldErrors {
  const errors: FieldErrors = {}
  if (title.length === 0) errors.title = 'Informe um título.'
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`
  if (content.length === 0) errors.content = 'Informe o conteúdo do post.'
  return errors
}

// Uma tela para criar e editar: sem id cria, com id carrega o post e edita.
// Assim as regras de validacao e o layout ficam num lugar so.
export function PostFormScreen({ route, navigation }: Props) {
  const id = route.params?.id
  const isEdit = id !== undefined
  const { user } = useAuth()
  const [loadState, setLoadState] = useState<'loading' | 'ready' | { error: string }>(
    isEdit ? 'loading' : 'ready',
  )
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState(user?.name ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Editar post' : 'Novo post' })
  }, [navigation, isEdit])

  // Edicao: carrega os dados atuais do post (requisito 4 do desafio).
  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    postsApi.get(id).then(
      (post) => {
        if (cancelled) return
        setTitle(post.title)
        setContent(post.content)
        if (post.author) setAuthorName(post.author.name)
        setLoadState('ready')
      },
      (err: unknown) => {
        if (cancelled) return
        const notFound = isAxiosError(err) && err.response?.status === 404
        setLoadState({ error: notFound ? 'Post não encontrado.' : getErrorMessage(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  async function handleSubmit() {
    // Mesma limpeza que a API faz (trim), para validar o que sera salvo.
    const input = { title: title.trim(), content: content.trim() }
    const errors = validate(input.title, input.content)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitError(null)
    setSaving(true)
    try {
      if (isEdit) await postsApi.update(id, input)
      else await postsApi.create(input)
      // Volta para a aba de administracao com o aviso de sucesso.
      navigation.popTo('Tabs', {
        screen: 'AdminPosts',
        params: { notice: isEdit ? 'Alterações salvas.' : 'Post publicado.' },
      })
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      setSubmitError(
        status === 403
          ? 'Você não tem permissão para alterar este post.'
          : status === 404
            ? 'Este post não existe mais.'
            : getErrorMessage(err),
      )
      setSaving(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <View style={styles.center}>
        <AsyncState status="loading" label="Carregando post..." />
      </View>
    )
  }
  if (typeof loadState === 'object') {
    return (
      <View style={styles.center}>
        <AsyncState status="error" message={loadState.error} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <TextField
            label="Título"
            value={title}
            onChangeText={(text) => {
              setTitle(text)
              setFieldErrors((current) => ({ ...current, title: undefined }))
            }}
            error={fieldErrors.title}
            maxLength={TITLE_MAX_LENGTH + 1}
            editable={!saving}
            style={styles.titleInput}
          />
          <TextField
            label="Conteúdo"
            value={content}
            onChangeText={(text) => {
              setContent(text)
              setFieldErrors((current) => ({ ...current, content: undefined }))
            }}
            error={fieldErrors.content}
            editable={!saving}
            multiline
            textAlignVertical="top"
            style={styles.contentInput}
          />
          {/* O desafio pede o campo "autor"; a API grava o professor logado
              como autor, entao o campo e so informativo. */}
          <View style={styles.author}>
            <Text style={styles.authorLabel}>Autor</Text>
            <Text style={styles.authorName}>{authorName}</Text>
          </View>

          {submitError !== null && <Notice tone="error" message={submitError} />}

          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => navigation.goBack()}
              disabled={saving}
              style={styles.action}
            />
            <Button
              title={isEdit ? 'Salvar' : 'Publicar'}
              onPress={handleSubmit}
              loading={saving}
              style={styles.action}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, padding: 20, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 22,
    gap: 20,
  },
  titleInput: { fontSize: 17 },
  contentInput: { minHeight: 220, lineHeight: 26 },
  author: { gap: 4 },
  authorLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textH },
  authorName: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
})
