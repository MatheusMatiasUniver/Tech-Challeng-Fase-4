import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { type ComponentProps } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '../auth/AuthContext'
import { AccountScreen } from '../screens/Account/AccountScreen'
import { AdminPostsScreen } from '../screens/AdminPosts/AdminPostsScreen'
import { PeopleScreen } from '../screens/People/PeopleScreen'
import { PostsScreen } from '../screens/Posts/PostsScreen'
import { Brand } from '../components/Brand'
import { colors, fonts } from '../theme'
import { headerTitleStyle } from './theme'
import { type AppTabsParamList } from './types'

const Tab = createBottomTabNavigator<AppTabsParamList>()

type IconName = ComponentProps<typeof Ionicons>['name']

// Icone cheio na aba ativa e contorno nas outras, padrao comum em apps nativos.
const icons: Record<keyof AppTabsParamList, [IconName, IconName]> = {
  Posts: ['newspaper', 'newspaper-outline'],
  AdminPosts: ['create', 'create-outline'],
  People: ['people', 'people-outline'],
  Account: ['person-circle', 'person-circle-outline'],
}

export function AppTabs() {
  const { isTeacher } = useAuth()
  // A barra padrao tem 49 px; com a Public Sans (mais alta que a fonte do
  // sistema) o rotulo encostava na borda de baixo. Altura propria + a area
  // segura do aparelho (barra de gestos do iPhone/Android).
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleStyle,
        headerShadowVisible: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 4,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={icons[route.name][focused ? 0 : 1]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen
        name="Posts"
        component={PostsScreen}
        // A aba inicial mostra a marca no lugar do titulo, como o topo do site.
        options={{ headerTitle: () => <Brand />, headerTitleAlign: 'left' }}
      />
      {/* Abas de professor nem sao montadas para aluno. E so interface:
          a regra de verdade e o 403 da API. */}
      {isTeacher && (
        <>
          <Tab.Screen
            name="AdminPosts"
            component={AdminPostsScreen}
            options={{ title: 'Administração' }}
          />
          <Tab.Screen name="People" component={PeopleScreen} options={{ title: 'Pessoas' }} />
        </>
      )}
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Conta' }} />
    </Tab.Navigator>
  )
}
