import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { type UserUpdateInput, usersApiFor } from '../../api/users'
import { useAuth } from '../../auth/AuthContext'
import { AsyncState } from '../../components/AsyncState'
import { Button } from '../../components/Button'
import { Notice } from '../../components/Notice'
import { TextField } from '../../components/TextField'
import { type AppStackParamList } from '../../navigation/types'
import { colors, fonts, radii } from '../../theme'

type Props = NativeStackScreenProps<AppStackParamList, 'UserForm'>

// Mesmos limites do createUserSchema da API, para o erro aparecer no campo
// antes de ir para a rede (a API valida de novo de qualquer jeito).
const NAME_MAX = 150
const EMAIL_MAX = 255
const PASSWORD_MIN = 6
const PASSWORD_MAX = 72
// Validacao simples; a regra completa e o z.string().email() da API.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

function validate(name: string, email: string, password: string, isEdit: boolean): FieldErrors {
  const errors: FieldErrors = {}
  if (name.length === 0) errors.name = 'Informe o nome.'
  else if (name.length > NAME_MAX) errors.name = `O nome deve ter no máximo ${NAME_MAX} caracteres.`
  if (email.length === 0) errors.email = 'Informe o e-mail.'
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) errors.email = 'Informe um e-mail válido.'
  // Na edicao a senha e opcional: vazia mantem a atual.
  if (password.length === 0) {
    if (!isEdit) errors.password = 'Informe uma senha.'
  } else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    errors.password = `A senha deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`
  }
  return errors
}

// Formulario unico para professor e aluno, criar e editar: a API usa o mesmo
// schema para os quatro casos, entao a tela tambem.
export function UserFormScreen({ route, navigation }: Props) {
  const { role, id } = route.params
  const isEdit = id !== undefined
  const singular = role === 'professor' ? 'professor' : 'aluno'
  const { user: me, updateCurrentUser } = useAuth()
  const [loadState, setLoadState] = useState<'loading' | 'ready' | { error: string }>(
    isEdit ? 'loading' : 'ready',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [original, setOriginal] = useState<{ name: string; email: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? `Editar ${singular}` : `Novo ${singular}` })
  }, [navigation, isEdit, singular])

  // Edicao: carrega os dados atuais (requisitos 6 e 8 do desafio).
  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    usersApiFor(role)
      .get(id)
      .then(
        (user) => {
          if (cancelled) return
          setName(user.name)
          setEmail(user.email)
          setOriginal({ name: user.name, email: user.email })
          setLoadState('ready')
        },
        (err: unknown) => {
          if (cancelled) return
          const notFound = isAxiosError(err) && err.response?.status === 404
          setLoadState({ error: notFound ? `Este ${singular} não existe mais.` : getErrorMessage(err) })
        },
      )
    return () => {
      cancelled = true
    }
  }, [id, isEdit, role, singular])

  async function handleSubmit() {
    // A API faz trim no nome e trim+minusculas no e-mail; senha vai como esta.
    const input = { name: name.trim(), email: email.trim().toLowerCase(), password }
    const errors = validate(input.name, input.email, input.password, isEdit)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitError(null)
    setSaving(true)
    try {
      const api = usersApiFor(role)
      if (isEdit) {
        // So manda o que mudou: o PUT da API e parcial e exige ao menos um campo.
        const changes: UserUpdateInput = {}
        if (input.name !== original?.name) changes.name = input.name
        if (input.email !== original?.email) changes.email = input.email
        if (input.password.length > 0) changes.password = input.password
        if (Object.keys(changes).length > 0) {
          const updated = await api.update(id, changes)
          if (updated.id === me?.id) updateCurrentUser(updated)
        }
      } else {
        await api.create(input)
      }
      navigation.popTo('Tabs', {
        screen: 'People',
        params: {
          role,
          notice: isEdit ? 'Alterações salvas.' : `${input.name} foi cadastrado como ${singular}.`,
        },
      })
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      if (status === 409) {
        // 409 aqui so pode ser e-mail repetido (create-user/update-user).
        setFieldErrors((current) => ({ ...current, email: 'Este e-mail já está cadastrado.' }))
      } else {
        setSubmitError(
          status === 404 ? `Este ${singular} não existe mais.` : getErrorMessage(err),
        )
      }
      setSaving(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <View style={styles.center}>
        <AsyncState status="loading" label="Carregando cadastro..." />
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <TextField
            label="Nome"
            value={name}
            onChangeText={(text) => {
              setName(text)
              setFieldErrors((current) => ({ ...current, name: undefined }))
            }}
            error={fieldErrors.name}
            maxLength={NAME_MAX + 1}
            editable={!saving}
            autoComplete="name"
            textContentType="name"
          />
          <TextField
            label="E-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setFieldErrors((current) => ({ ...current, email: undefined }))
            }}
            error={fieldErrors.email}
            editable={!saving}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            // "off": e o cadastro de outra pessoa, o celular nao deve sugerir
            // o e-mail de quem esta usando o app.
            autoComplete="off"
          />
          <View style={styles.passwordField}>
            <TextField
              label={isEdit ? 'Nova senha (opcional)' : 'Senha'}
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setFieldErrors((current) => ({ ...current, password: undefined }))
              }}
              error={fieldErrors.password}
              editable={!saving}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={PASSWORD_MAX}
            />
            <Text style={styles.hint}>
              {isEdit
                ? 'Deixe em branco para manter a senha atual.'
                : `Entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres. Repasse a senha para a pessoa entrar no app.`}
            </Text>
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
              title={isEdit ? 'Salvar' : 'Cadastrar'}
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
  passwordField: { gap: 6 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
})
