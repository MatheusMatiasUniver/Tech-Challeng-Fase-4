import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useAuth } from '../auth/AuthContext'
import { LoginScreen } from '../screens/Login/LoginScreen'
import { colors } from '../theme'
import { AppTabs } from './AppTabs'
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {status === 'signedIn' ? (
        <AppStack.Navigator>
          <AppStack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
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
    backgroundColor: colors.background,
  },
})
