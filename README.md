# Bible Stories for Children

A beautiful, modern web application for reading classic Old and New Testament Bible stories for children, built with Next.js, TypeScript, and Tailwind CSS — styled like [bible-old-and-new-testament](https://github.com/raimonvibe/bible-old-and-new-testament).

## Sources (Project Gutenberg)

- [Child's Story of the Bible](https://www.gutenberg.org/ebooks/25309) by Mary A. Lathbury — 34 Old Testament stories and 48 New Testament stories
- [Mother Stories from the New Testament](https://www.gutenberg.org/ebooks/17163) by Anonymous — 45 New Testament stories

All texts are public domain in the United States.

## Features

- **127 Bible stories** across Old and New Testament collections
- **Beautiful design** with beige linear gradients and elegant typography
- **Responsive** layout for mobile, tablet, and desktop
- **Easy navigation** — browse collections, pick stories, move prev/next
- **Search**, dark mode, and read-aloud support

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Regenerate story data from source texts

```bash
npm run parse-gutenberg
```

Source texts live in `source/` and parsed JSON is written to `data/`.

### Production build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages and API
├── components/             # UI components (BookSelector, BibleReader, etc.)
├── data/                   # Parsed story JSON
├── scripts/                # Gutenberg parser
└── source/                 # Raw Project Gutenberg text files
```

## Technology Stack

- Next.js 16, TypeScript, Tailwind CSS, Lucide React
- Google Fonts: Playfair Display, Merriweather, Inter

## License

This project uses public domain texts from Project Gutenberg.
