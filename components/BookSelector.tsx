'use client'

import { Book, ScrollText } from 'lucide-react'

interface BookSelectorProps {
  books: Array<{
    id: string
    name: string
    abbreviation: string
    author?: string
    testament?: 'old' | 'new'
    chapters: Array<{ id: string; number: string; reference: string }>
  }>
  selectedBookId: string | null
  onSelectBook: (bookId: string) => void
}

export default function BookSelector({ books, selectedBookId, onSelectBook }: BookSelectorProps) {
  const oldTestamentBooks = books.filter((book) => book.testament === 'old')
  const newTestamentBooks = books.filter((book) => book.testament === 'new')

  const renderBookGrid = (booksList: typeof books) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {booksList.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book.id)}
          aria-label={`${book.name}, ${book.chapters.length} stor${book.chapters.length !== 1 ? 'ies' : 'y'}`}
          aria-pressed={selectedBookId === book.id}
          className={`
            p-4 md:p-5 rounded-xl transition-all duration-200
            text-left hover:scale-[1.02] hover:shadow-lg
            ${
              selectedBookId === book.id
                ? 'bg-selection-gradient text-white shadow-lg scale-[1.02]'
                : 'btn-surface hover:shadow-md'
            }
          `}
        >
          <div className="font-display font-semibold text-base md:text-lg mb-1">
            {book.name}
          </div>
          {book.author && (
            <div
              className={`text-xs md:text-sm mb-2 ${
                selectedBookId === book.id
                  ? 'text-beige-100/90 dark:text-brown-100/90'
                  : 'text-beige-700 dark:text-brown-300'
              }`}
            >
              by {book.author}
            </div>
          )}
          <div
            className={`text-xs ${
              selectedBookId === book.id
                ? 'text-beige-100 dark:text-brown-100'
                : 'text-beige-600 dark:text-brown-400'
            }`}
            aria-hidden="true"
          >
            {book.chapters.length} stor{book.chapters.length !== 1 ? 'ies' : 'y'}
          </div>
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <section data-read-aloud-block className="card-surface p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300 dark:border-brown-700">
          <div className="flex items-center gap-3">
            <ScrollText className="w-7 h-7 md:w-8 md:h-8 text-amber-700 dark:text-amber-500" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
                Old Testament
              </h2>
              <p className="text-sm text-beige-600 dark:text-brown-400 font-sans mt-1">
                {oldTestamentBooks.length} collection{oldTestamentBooks.length !== 1 ? 's' : ''} • {oldTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} stories
              </p>
            </div>
          </div>
        </div>

        <nav data-read-aloud-ignore aria-label="Old Testament book selection">
          {renderBookGrid(oldTestamentBooks)}
        </nav>
      </section>

      <section data-read-aloud-block className="card-surface p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-beige-300 dark:border-brown-700">
          <div className="flex items-center gap-3">
            <Book className="w-7 h-7 md:w-8 md:h-8 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-beige-800 dark:text-brown-50">
                New Testament
              </h2>
              <p className="text-sm text-beige-600 dark:text-brown-400 font-sans mt-1">
                {newTestamentBooks.length} collection{newTestamentBooks.length !== 1 ? 's' : ''} • {newTestamentBooks.reduce((sum, book) => sum + book.chapters.length, 0)} stories
              </p>
            </div>
          </div>
        </div>

        <nav data-read-aloud-ignore aria-label="New Testament book selection">
          {renderBookGrid(newTestamentBooks)}
        </nav>
      </section>
    </div>
  )
}
