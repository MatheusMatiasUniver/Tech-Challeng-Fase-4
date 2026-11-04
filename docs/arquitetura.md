# Arquitetura do app (Fase 4)

Este documento registra as decisões de estrutura do app e **por que** cada uma foi tomada. Ele também serve de base para o documento de arquitetura pedido na entrega.

## Visão geral

```
App (Expo / React Native)
 ├─ AuthProvider (Context)         guarda usuário e token; expõe login/logout
 │   └─ expo-secure-store          persiste o token no armazenamento seguro do aparelho
 ├─ api/client.ts (Axios)          baseURL + header Authorization + tratamento de 401
 └─ Navegação (React Navigation)
     ├─ Pilha pública              Login
     └─ Pilha autenticada
         ├─ Abas: Posts | Admin* | Pessoas*      (* só professor)
         └─ Telas empilhadas: Post, Editar post, Professor, Aluno...
                │
                ▼
     API REST da Fase 2 (Render)   /auth, /posts, /teachers, /students
```

## Decisões

### 1. Expo (fluxo gerenciado) com TypeScript

- **Por quê:** é o caminho das aulas de React Native Básico. Roda no celular pelo app Expo Go, sem Android Studio nem Xcode, o que facilita o grupo testar e gravar o vídeo. Nada que o desafio pede (formulários, listas, chamadas HTTP, armazenamento seguro) exige código nativo próprio.
- **TypeScript:** a API da Fase 2 já é TypeScript; tipar as respostas (`User`, `Post`, `Paginated<T>`) evita erros bobos de campo e deixa o contrato da API explícito no app.
- **Alternativa descartada:** React Native CLI "puro". Dá mais controle nativo, mas exige ambiente Android/iOS montado e não traz ganho para este escopo.

### 2. React Navigation (pilha + abas)

- **Por quê:** é a biblioteca ensinada nas aulas, então o que está no código bate com o material e com o que os avaliadores esperam ver. As rotas protegidas ficam explícitas: o app renderiza a pilha de login **ou** a pilha autenticada conforme o estado do `AuthContext`. Não existe "rota protegida" que dá para acessar pulando a tela; a tela simplesmente não está montada.
- **Todo o app exige login:** a leitura de posts é pública na API, mas o desafio diferencia professor (cria e edita) de aluno (só visualiza), então os dois entram com conta. Isso também deixa claro no vídeo como funciona a rota protegida.
- **Abas por papel:** a aba de administração e a de pessoas (professores/alunos) só são montadas para `role === 'professor'`. Isso é conveniência de interface; quem garante a regra é a API (403 para aluno).
- **Alternativa considerada:** Expo Router (rotas por arquivos, padrão novo do template do Expo, construído em cima do React Navigation). É bom, mas esconde a navegação atrás de convenções de pastas e foge do que as aulas mostram.

### 3. Autenticação com Context API + SecureStore

- **Context em vez de Redux:** o estado global do app é pequeno (usuário logado + token). Context resolve sem a cerimônia de store/slices/actions. O PDF diz que Context ou Redux são opcionais; se o estado crescer (cache de posts compartilhado, por exemplo), dá para migrar para Redux Toolkit, que é a aula Medium 6.
- **SecureStore em vez de AsyncStorage:** o token JWT dá acesso à conta. O SecureStore usa o Keychain (iOS) e o Keystore (Android), que são criptografados; o AsyncStorage é texto puro.
- **Ao abrir o app:** se houver token salvo, o app chama `GET /auth/me`. Isso confirma que o token ainda vale **e** que o usuário ainda existe com o mesmo papel (a API confere isso no banco). Se a resposta for 401, o token é apagado e o app volta ao login.
- **Durante o uso:** um interceptor do Axios observa respostas 401 e faz logout automático, para o app não ficar num estado "logado" com token inválido.

### 4. Camada de API (Axios)

- Um único cliente em `src/api/client.ts` com `baseURL` vinda de `EXPO_PUBLIC_API_URL` (variável pública do Expo, lida no build). Assim dá para apontar para a API local ou para o Render sem mudar código.
- Um arquivo por recurso (`auth.ts`, `posts.ts`, `teachers.ts`, `students.ts`) com funções tipadas. As telas não montam URL nem header; só chamam `postsApi.list()`.
- **Por que não precisa de CORS:** CORS é uma regra do navegador. O app nativo faz a requisição direto, sem proxy, ao contrário do front web da Fase 3.

### 5. Estrutura de pastas

```
src/
  api/          cliente Axios e funções por recurso
  auth/         AuthContext, armazenamento do token
  navigation/   pilhas e abas
  screens/      uma pasta por tela
  components/   componentes reutilizáveis (botão, campo, cartão de post)
  types/        tipos das respostas da API
  theme/        cores e espaçamentos
```

### 6. Testes

- Jest com `jest-expo` e React Native Testing Library (aula de Câmeras e Sensores 4). Prioridade: `AuthContext` (login, restauração da sessão, logout no 401) e as telas de formulário.

## Contrato com a API (Fase 2)

| Recurso | Rotas | Quem pode |
| --- | --- | --- |
| Auth | `POST /auth/login` → `{ access_token, token_type, user }`; `GET /auth/me` | público / logado |
| Posts | `GET /posts`, `GET /posts/search?q=`, `GET /posts/:id` | público |
| Posts | `POST`, `PUT /:id`, `DELETE /:id` | professor |
| Professores | `/teachers` CRUD, `?page&limit` → `{ data, meta }` | professor |
| Alunos | `/students` CRUD, `?page&limit` → `{ data, meta }` | professor |

Excluir professor com posts retorna 409 `TEACHER_HAS_POSTS`; o app pergunta ao usuário e repete com `?deletePosts=true`.
