import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { type ComponentProps } from 'react'

import { useAuth } from '../auth/AuthContext'
import { AccountScreen } from '../screens/Account/AccountScreen'
import { AdminPostsScreen } from '../screens/AdminPosts/AdminPostsScreen'
import { PeopleScreen } from '../screens/People/PeopleScreen'
import { PostsScreen } from '../screens/Posts/PostsScreen'
import { colors } from '../theme'
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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={icons[route.name][focused ? 0 : 1]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Posts" component={PostsScreen} />
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
