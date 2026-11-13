import { type Post } from '../types/api'

// Mesmo formato da Fase 3 ("2 nov 2026"), montado a mao para nao depender
// do Intl do aparelho, que varia entre versoes de Android.
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function authorName(post: Post): string {
  return post.author?.name ?? 'Autor não informado'
}

// "Por Ana · publicado em 2 nov 2026 · atualizado em 3 nov 2026" (postMeta da Fase 3).
export function formatPostMeta(post: Post): string {
  const published = `Por ${authorName(post)} · publicado em ${formatDate(post.createdAt)}`
  if (post.updatedAt === post.createdAt) return published
  return `${published} · atualizado em ${formatDate(post.updatedAt)}`
}

// Resumo para o cartao da lista: primeira parte do conteudo, sem quebras de linha.
export function excerpt(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= max ? flat : `${flat.slice(0, max).trimEnd()}…`
}
