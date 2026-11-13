import {
  InstrumentSerif_400Regular,
} from '@expo-google-fonts/instrument-serif'
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider } from './src/auth/AuthContext'
import { RootNavigator } from './src/navigation/RootNavigator'
import { colors } from './src/theme'

export default function App() {
  // As mesmas fontes do site da Fase 3 (Google Fonts), embutidas no app.
  // Ate carregarem, mostra so o fundo creme para o texto nao "piscar" com a
  // fonte do sistema e depois trocar.
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
  })

  if (!fontsLoaded && fontError === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
