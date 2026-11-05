import { isAxiosError } from 'axios'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import { getErrorMessage } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { Brand } from '../../components/Brand'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { colors, fonts, radii } from '../../theme'

interface FieldErrors {
  email?: string
  password?: string
}

// Mesma mensagem da Fase 3 para 401: nao revela se o e-mail existe.
const INVALID_CREDENTIALS = 'E-mail ou senha inválidos. Tente novamente.'

export function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    // Validacao local igual a do LoginForm da Fase 3, antes de chamar a API.
    const errors: FieldErrors = {}
    if (email.trim() === '') errors.email = 'Informe o e-mail.'
    if (password === '') errors.password = 'Informe a senha.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      // Sem navigate(): o AuthContext muda para 'signedIn' e o RootNavigator
      // troca a pilha de login pela pilha autenticada sozinho.
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 401 ? INVALID_CREDENTIALS : getErrorMessage(err),
      )
      setPassword('')
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Brand />
        <Text style={styles.title} accessibilityRole="header">
          Entrar
        </Text>
        <Text style={styles.subtitle}>Use sua conta de professor ou aluno da Sala Aberta.</Text>

        <View style={styles.card}>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setFieldErrors((current) => ({ ...current, email: undefined }))
            }}
            error={fieldErrors.email}
            editable={!submitting}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setFieldErrors((current) => ({ ...current, password: undefined }))
            }}
            error={fieldErrors.password}
            editable={!submitting}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={handleSubmit}
          />

          {error !== null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} accessibilityRole="alert">
                {error}
              </Text>
            </View>
          )}

          <Button
            title={submitting ? 'Entrando...' : 'Entrar'}
            onPress={handleSubmit}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 48 },
  title: {
    marginTop: 40,
    marginBottom: 8,
    fontFamily: fonts.heading,
    fontSize: 44,
    lineHeight: 46,
    color: colors.textH,
  },
  subtitle: { marginBottom: 26, fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 22,
    gap: 18,
  },
  errorBox: {
    padding: 14,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radii.field,
  },
  errorText: { fontFamily: fonts.regular, fontSize: 15, color: colors.error },
})
