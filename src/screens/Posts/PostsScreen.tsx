import { useNavigation } from '@react-navigation/native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { PostCard } from '../../components/PostCard'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { usePosts } from '../../hooks/usePosts'
import { type AppStackParamList } from '../../navigation/types'
import { colors, spacing } from '../../theme'
import { type Post } from '../../types/api'

type Navigation = NativeStackNavigationProp<AppStackParamList>

export function PostsScreen() {
  // A aba vive dentro da pilha do app; navigate('PostDetail') sobe ate ela.
  const navigation = useNavigation<Navigation>()
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search)
  const { posts, loading, refreshing, error, refresh } = usePosts(query)

  const openPost = useCallback(
    (post: Post) => navigation.navigate('PostDetail', { id: post.id, title: post.title }),
    [navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} onPress={openPost} />,
    [openPost],
  )

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por título ou conteúdo"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        accessibilityLabel="Buscar posts"
      />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.hint}>Carregando posts…</Text>
        </View>
      ) : error !== null && posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={refresh} accessibilityRole="button">
            <Text style={styles.retryText}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query.trim() === ''
                ? 'Nenhum post publicado ainda.'
                : `Nenhum post encontrado para "${query.trim()}".`}
            </Text>
          }
        />
      )}
    </View>
  )
}

function Separator() {
  return <View style={{ height: spacing.md }} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: spacing.md,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  list: { padding: spacing.md, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  hint: { marginTop: spacing.sm, color: colors.muted },
  error: { color: colors.danger, textAlign: 'center' },
  retry: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  retryText: { color: colors.primary, fontWeight: '600' },
  empty: { marginTop: spacing.xl, textAlign: 'center', color: colors.muted },
})
