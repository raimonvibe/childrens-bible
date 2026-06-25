'use client'

import { useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { highlightMatch, type HighlightOptions } from '@/lib/bibleSearch'

interface Chapter {
  id: string
  number: string
  reference: string
  content: string
}

interface BibleReaderProps {
  bookName: string
  chapter: Chapter
  onBack: () => void
  onPrevChapter?: () => void
  onNextChapter?: () => void
  hasPrev: boolean
  hasNext: boolean
  onBackToBooks?: () => void
  searchHighlight?: HighlightOptions | null
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatStoryHtml(content: string, searchHighlight?: HighlightOptions | null): string {
  return content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => {
      const normalizedParagraph = paragraph.replace(/\n/g, ' ')
      const passageNumber = index + 1
      const shouldHighlight =
        searchHighlight &&
        (!searchHighlight.passageNumber || searchHighlight.passageNumber === passageNumber)
      const html = shouldHighlight
        ? highlightMatch(normalizedParagraph, searchHighlight)
        : escapeHtml(normalizedParagraph)

      return `<p class="verse" data-passage="${passageNumber}">${html}</p>`
    })
    .join('')
}

export default function BibleReader({
  bookName,
  chapter,
  onBack,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
  onBackToBooks,
  searchHighlight = null,
}: BibleReaderProps) {
  const processedContent = useMemo(
    () => formatStoryHtml(chapter.content, searchHighlight),
    [chapter.content, searchHighlight],
  )

  useEffect(() => {
    if (!searchHighlight?.query.trim()) return

    const timer = window.setTimeout(() => {
      const passageSelector = searchHighlight.passageNumber
        ? `[data-passage="${searchHighlight.passageNumber}"] .search-highlight`
        : '.search-highlight'
      const firstMatch = document.querySelector(passageSelector)
      firstMatch?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)

    return () => window.clearTimeout(timer)
  }, [chapter.id, searchHighlight])

  return (
    <article className="card-surface p-4 md:p-6 lg:p-10">
      <nav
        data-read-aloud-ignore
        className="flex items-center gap-2 text-sm text-beige-600 dark:text-brown-400 mb-4 font-sans"
        aria-label="Breadcrumb"
      >
        <button
          onClick={onBackToBooks}
          className="hover:text-beige-900 dark:hover:text-brown-50 transition-colors flex items-center gap-1"
          aria-label="Go to home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <span>/</span>
        <button
          onClick={onBack}
          className="hover:text-beige-900 dark:hover:text-brown-50 transition-colors"
          aria-label="Go back to story list"
        >
          {bookName}
        </button>
        <span>/</span>
        <span className="text-beige-800 dark:text-brown-200 font-medium">Story {chapter.number}</span>
      </nav>

      <div
        data-read-aloud-ignore
        className="flex items-center justify-between mb-6 pb-4 border-b border-beige-300 dark:border-brown-700"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            aria-label="Go to previous story"
            className={`p-2 rounded-lg transition-all ${hasPrev ? 'btn-surface hover:shadow-md' : 'btn-surface-muted'}`}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            aria-label="Go to next story"
            className={`p-2 rounded-lg transition-all ${hasNext ? 'btn-surface hover:shadow-md' : 'btn-surface-muted'}`}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onBack}
            className="ml-2 flex items-center gap-2 px-3 py-2 btn-surface rounded-lg hover:shadow-md font-sans text-sm"
            aria-label="Select different story"
          >
            <span>Story {chapter.number}</span>
          </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-beige-800 dark:text-brown-50 mb-2">
          {chapter.reference}
        </h1>
        <p className="text-beige-600 dark:text-brown-400 font-sans text-sm md:text-base">
          {bookName} • Story {chapter.number}
        </p>
      </div>

      <div className="prose max-w-none mb-8">
        <div
          className="text-beige-900 dark:text-brown-100 leading-relaxed text-base md:text-lg lg:text-xl"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          aria-live="polite"
        />
      </div>

      <footer
        data-read-aloud-ignore
        className="flex justify-between items-center pt-6 border-t border-beige-300 dark:border-brown-700"
      >
        <button
          onClick={onPrevChapter}
          disabled={!hasPrev}
          aria-label={`Go to previous story${hasPrev ? '' : ' (not available)'}`}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all ${
            hasPrev ? 'btn-surface hover:shadow-lg hover:-translate-x-1' : 'btn-surface-muted'
          }`}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-beige-600 dark:text-brown-400 font-sans text-sm md:text-base" aria-live="polite">
          Story {chapter.number}
        </div>

        <button
          onClick={onNextChapter}
          disabled={!hasNext}
          aria-label={`Go to next story${hasNext ? '' : ' (not available)'}`}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-medium transition-all ${
            hasNext ? 'btn-surface hover:shadow-lg hover:translate-x-1' : 'btn-surface-muted'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </footer>
    </article>
  )
}
