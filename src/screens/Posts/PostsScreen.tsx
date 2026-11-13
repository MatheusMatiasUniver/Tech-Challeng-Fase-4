import { useNavigation } from '@react-navigation/native'
import { type NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { AsyncState } from '../../components/AsyncState'
import { Eyebrow } from '../../components/Eyebrow'
import { PostCard } from '../../components/PostCard'
import { TextField } from '../../components/TextField'
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
  const term = query.trim()

  const openPost = useCallback(
    (post: Post) => navigation.navigate('PostDetail', { id: post.id, title: post.title }),
    [navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} onPress={openPost} />,
    [openPost],
  )

  // Cabecalho da lista rola junto com os cartoes, como na pagina da Fase 3.
  // No site a busca tem botoes "Buscar" e "Limpar"; no celular ela busca
  // sozinha ao parar de digitar e o "x" do teclado limpa o campo.
  const header = (
    <View style={styles.header}>
      <Eyebrow>Conteúdo aberto</Eyebrow>
      <TextField
        label="Termo de busca"
        tone="onBg"
        value={search}
        onChangeText={setSearch}
        placeholder="Título ou trecho"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  )

  let body: React.ReactElement | null = null
  if (loading && !refreshing) body = <AsyncState status="loading" label="Carregando posts..." />
  else if (error !== null) body = <AsyncState status="error" message={error} onRetry={refresh} />

  return (
    <FlatList
      style={styles.container}
      data={body === null ? posts : []}
      keyExtractor={(post) => post.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={Separator}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
      ListEmptyComponent={
        body ?? (
          <AsyncState
            status="empty"
            label={term === '' ? 'Nenhum post encontrado.' : `Nenhum resultado para "${term}".`}
          />
        )
      }
    />
  )
}

function Separator() {
  return <View style={{ height: 18 }} />
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  header: { marginBottom: 28, gap: spacing.xs },
})
