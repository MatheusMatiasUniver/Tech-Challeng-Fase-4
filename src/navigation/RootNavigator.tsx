import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useAuth } from '../auth/AuthContext'
import { LoginScreen } from '../screens/Login/LoginScreen'
import { PostDetailScreen } from '../screens/PostDetail/PostDetailScreen'
import { colors } from '../theme'
import { AppTabs } from './AppTabs'
import { headerTitleStyle, navigationTheme } from './theme'
import { type AppStackParamList, type AuthStackParamList } from './types'

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()

// Rotas protegidas: so uma das duas pilhas existe por vez. Sem login, as telas
// do app nao estao montadas, entao nao ha como chegar nelas.
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
      {status === 'signedIn' ? (
        <AppStack.Navigator>
          <AppStack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
          <AppStack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            // O titulo do post ja aparece grande na tela; no cabecalho fica so
            // o "voltar", como o link "← Voltar para a lista" do site.
            options={{ title: '', headerBackTitle: 'Voltar', headerTitleStyle }}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
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
