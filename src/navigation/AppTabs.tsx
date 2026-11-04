import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { useAuth } from '../auth/AuthContext'
import { AccountScreen } from '../screens/Account/AccountScreen'
import { AdminPostsScreen } from '../screens/AdminPosts/AdminPostsScreen'
import { PeopleScreen } from '../screens/People/PeopleScreen'
import { PostsScreen } from '../screens/Posts/PostsScreen'
import { colors } from '../theme'
import { type AppTabsParamList } from './types'

const Tab = createBottomTabNavigator<AppTabsParamList>()

export function AppTabs() {
  const { isTeacher } = useAuth()

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary }}>
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
