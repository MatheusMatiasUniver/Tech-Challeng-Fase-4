import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useAuth } from '../auth/AuthContext'
import { LoginScreen } from '../screens/Login/LoginScreen'
import { PostDetailScreen } from '../screens/PostDetail/PostDetailScreen'
import { colors } from '../theme'
import { AppTabs } from './AppTabs'
import { headerTitleStyle, navigationTheme } from './theme'
import { type AppStackParamList } from './types'

const Stack = createNativeStackNavigator<AppStackParamList>()

// Leitura e publica, como na API e no site da Fase 3: lista e post abrem sem
// login. As rotas protegidas sao as abas de professor (AppTabs) e a de Conta,
// que so sao montadas depois do login. A tela de Login, ao contrario, so existe
// enquanto ninguem esta logado: ao entrar, o React Navigation a remove sozinho
// e volta para onde o usuario estava, sem precisar de navigate().
export function RootNavigator() {
  const { status } = useAuth()

  if (status === 'restoring') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          // O titulo do post ja aparece grande na tela; no cabecalho fica so
          // o "voltar", como o link "← Voltar para a lista" do site.
          options={{ title: '', headerBackTitle: 'Voltar', headerTitleStyle }}
        />
        {status !== 'signedIn' && (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            // Modal: abre por cima da lista e fecha com o gesto de voltar.
            options={{ presentation: 'modal', title: '', headerBackTitle: 'Fechar' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
})
