export interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

export interface Book {
  id: string
  name: string
  abbreviation: string
  testament?: Testament
  chapters: Chapter[]
}

export interface BibleData {
  bibleName: string
  bibleId: string
  books: Book[]
}

export type Testament = 'old' | 'new'
export type MatchMode = 'phrase' | 'all' | 'any'

export interface SearchOptions {
  query: string
  testament: 'all' | Testament
  bookId: string | null
  matchMode: MatchMode
  caseSensitive: boolean
}

export interface SearchResult {
  bookId: string
  bookName: string
  testament: Testament
  chapterId: string
  chapterNumber: string
  reference: string
  verseNumber: number
  text: string
  snippet: string
  score: number
}

export interface HighlightOptions {
  query: string
  matchMode: MatchMode
  caseSensitive: boolean
  passageNumber?: number
}

const NT_BOOK_IDS = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
])

const PROJECT_NT_BOOK_IDS = new Set(['CSB-NT', 'MSNT'])
const PROJECT_OT_BOOK_IDS = new Set(['CSB-OT'])

export const MAX_SEARCH_RESULTS = 150
const SNIPPET_MAX_LENGTH = 220
const SNIPPET_CONTEXT = 70

export function getTestament(bookId: string): Testament {
  const rootId = bookId.split('.')[0]

  if (PROJECT_NT_BOOK_IDS.has(rootId)) return 'new'
  if (PROJECT_OT_BOOK_IDS.has(rootId)) return 'old'
  if (NT_BOOK_IDS.has(bookId) || NT_BOOK_IDS.has(rootId)) return 'new'

  return 'old'
}

export function resolveTestament(book: Pick<Book, 'id' | 'testament'>): Testament {
  return book.testament ?? getTestament(book.id)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function normalizeForCompare(text: string, caseSensitive: boolean): string {
  const trimmed = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

  return caseSensitive ? trimmed : trimmed.toLowerCase()
}

function getQueryWords(query: string, caseSensitive: boolean): string[] {
  return normalizeForCompare(query, caseSensitive)
    .split(/\s+/)
    .filter(Boolean)
}

function buildFlexiblePattern(words: string[]): string {
  return words.map((word) => escapeRegex(word)).join('\\s+')
}

function findMatchRanges(
  text: string,
  query: string,
  matchMode: MatchMode,
  caseSensitive: boolean,
): Array<{ start: number; end: number }> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const flags = caseSensitive ? 'g' : 'gi'
  const ranges: Array<{ start: number; end: number }> = []

  if (matchMode === 'phrase') {
    const words = getQueryWords(trimmedQuery, caseSensitive)
    if (words.length === 0) return []

    const regex = new RegExp(buildFlexiblePattern(words), flags)
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
    }
    return ranges
  }

  const words = getQueryWords(trimmedQuery, caseSensitive)
  for (const word of words) {
    const regex = new RegExp(escapeRegex(word), flags)
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
    }
  }

  return mergeRanges(ranges)
}

function mergeRanges(
  ranges: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  if (ranges.length === 0) return []

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged = [sorted[0]]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const previous = merged[merged.length - 1]

    if (current.start <= previous.end) {
      previous.end = Math.max(previous.end, current.end)
    } else {
      merged.push({ ...current })
    }
  }

  return merged
}

function matchesQuery(text: string, query: string, options: SearchOptions): boolean {
  const haystack = normalizeForCompare(text, options.caseSensitive)
  const words = getQueryWords(query, options.caseSensitive)

  if (words.length === 0) return false

  if (options.matchMode === 'phrase') {
    return findMatchRanges(text, query, 'phrase', options.caseSensitive).length > 0
  }

  if (options.matchMode === 'all') {
    return words.every((word) => haystack.includes(word))
  }

  return words.some((word) => haystack.includes(word))
}

function scoreMatch(text: string, query: string, options: SearchOptions): number {
  const ranges = findMatchRanges(text, query, options.matchMode, options.caseSensitive)
  if (ranges.length === 0) return 0

  const firstMatch = ranges[0]
  const queryWords = getQueryWords(query, options.caseSensitive)
  let score = 0

  if (options.matchMode === 'phrase') {
    score += 120
    score += Math.min(queryWords.join(' ').length, 40)
  } else if (options.matchMode === 'all') {
    score += 90
    score += queryWords.length * 8
  } else {
    score += 60
    score += queryWords.length * 4
  }

  if (firstMatch.start <= SNIPPET_CONTEXT) {
    score += 10
  }

  score += Math.max(0, 20 - Math.floor(text.length / 120))

  return score
}

function buildSnippet(text: string, query: string, options: SearchOptions): string {
  const ranges = findMatchRanges(text, query, options.matchMode, options.caseSensitive)
  if (ranges.length === 0) {
    return text.length <= SNIPPET_MAX_LENGTH
      ? text
      : `${text.slice(0, SNIPPET_MAX_LENGTH).trim()}…`
  }

  const firstMatch = ranges[0]
  const start = Math.max(0, firstMatch.start - SNIPPET_CONTEXT)
  let end = Math.min(text.length, firstMatch.end + SNIPPET_CONTEXT)

  if (end - start < SNIPPET_MAX_LENGTH) {
    end = Math.min(text.length, start + SNIPPET_MAX_LENGTH)
  }

  let snippet = text.slice(start, end).trim()
  if (start > 0) snippet = `…${snippet}`
  if (end < text.length) snippet = `${snippet}…`

  return snippet
}

function parsePassages(content: string): Array<{ verseNumber: number; text: string }> {
  const numberedPattern = /\[(\d+)\]([\s\S]*?)(?=\[\d+\]|$)/g
  const numberedPassages: Array<{ verseNumber: number; text: string }> = []
  let match: RegExpExecArray | null

  while ((match = numberedPattern.exec(content)) !== null) {
    const text = match[2].trim().replace(/\n+/g, ' ')
    if (!text) continue

    numberedPassages.push({
      verseNumber: Number.parseInt(match[1], 10),
      text,
    })
  }

  if (numberedPassages.length > 0) {
    return numberedPassages
  }

  return content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim().replace(/\n+/g, ' '))
    .filter(Boolean)
    .map((text, index) => ({
      verseNumber: index + 1,
      text,
    }))
}

export function searchBible(bibleData: BibleData, options: SearchOptions): SearchResult[] {
  const query = options.query.trim()
  if (!query) return []

  const results: SearchResult[] = []

  for (const book of bibleData.books) {
    const testament = resolveTestament(book)

    if (options.testament !== 'all' && options.testament !== testament) continue
    if (options.bookId && options.bookId !== book.id) continue

    for (const chapter of book.chapters) {
      const passages = parsePassages(chapter.content)

      for (const passage of passages) {
        if (!matchesQuery(passage.text, query, options)) continue

        const score = scoreMatch(passage.text, query, options)
        const snippet = buildSnippet(passage.text, query, options)
        const reference =
          passages.length > 1
            ? `${book.name} ${chapter.number}:${passage.verseNumber}`
            : `${book.name} ${chapter.number}`

        results.push({
          bookId: book.id,
          bookName: book.name,
          testament,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          reference,
          verseNumber: passage.verseNumber,
          text: passage.text,
          snippet,
          score,
        })
      }
    }
  }

  results.sort((a, b) => b.score - a.score || a.reference.localeCompare(b.reference))

  return results.slice(0, MAX_SEARCH_RESULTS)
}

export function highlightMatch(text: string, options: HighlightOptions): string {
  const trimmedQuery = options.query.trim()
  if (!trimmedQuery) return escapeHtml(text)

  const ranges = findMatchRanges(
    text,
    trimmedQuery,
    options.matchMode,
    options.caseSensitive,
  )

  if (ranges.length === 0) return escapeHtml(text)

  let html = ''
  let cursor = 0

  for (const range of ranges) {
    html += escapeHtml(text.slice(cursor, range.start))
    html += `<mark class="search-highlight">${escapeHtml(text.slice(range.start, range.end))}</mark>`
    cursor = range.end
  }

  html += escapeHtml(text.slice(cursor))
  return html
}
