import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourceDir = path.join(root, 'source')
const dataDir = path.join(root, 'data')

const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100 }

function romanToInt(roman) {
  let total = 0
  for (let i = 0; i < roman.length; i++) {
    const current = ROMAN_VALUES[roman[i]]
    const next = ROMAN_VALUES[roman[i + 1]]
    if (next && current < next) total -= current
    else total += current
  }
  return total
}

function cleanText(text) {
  return text
    .split('\n')
    .filter((line) => !/^\[Illustration/i.test(line.trim()))
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/(^|\s|["'])[a-z]/g, (match) => match.toUpperCase())
}

function parseLathburySections(text) {
  const startMarker = 'CHILD\'S STORY OF THE BIBLE'
  const ntMarker = 'THE NEW TESTAMENT.'

  const firstChapter = text.indexOf('CHAPTER I.')
  const ntStart = text.indexOf(ntMarker, firstChapter + 1)
  const endMarker = text.indexOf('*** END OF THE PROJECT GUTENBERG')

  const otText = text.slice(firstChapter, ntStart)
  const ntText = text.slice(ntStart, endMarker === -1 ? undefined : endMarker)

  return {
    oldTestament: parseLathburyChapters(otText),
    newTestament: parseLathburyChapters(ntText),
  }
}

function parseLathburyChapters(sectionText) {
  const matches = [...sectionText.matchAll(/CHAPTER ([IVXLC]+)\.\s*\n+([^\n]+)\.?\s*\n+/g)]
  const chapters = []

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const roman = match[1]
    const rawTitle = match[2].trim().replace(/\.$/, '')
    const start = match.index + match[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : sectionText.length
    const body = cleanText(sectionText.slice(start, end))
    if (!body) continue

    const number = String(romanToInt(roman))
    const title = titleCase(rawTitle)

    chapters.push({
      id: number,
      number,
      reference: title,
      content: body,
    })
  }

  return chapters
}

function normalizeStoryTitle(line) {
  return line.trim().replace(/^["'\u201C\u201D]+|["'\u201C\u201D.]+$/g, '').trim()
}

function isStoryTitleLine(line) {
  const title = normalizeStoryTitle(line)
  if (title.length < 8) return false
  if (/^(NEW TESTAMENT STORIES|CONTENTS)$/.test(title)) return false
  return /^[A-Z][A-Z0-9' ",\-–—]+$/.test(title)
}

function parseMotherStories(text) {
  const start = text.indexOf('NEW TESTAMENT STORIES')
  const end = text.indexOf('*** END OF THE PROJECT GUTENBERG')
  const body = text.slice(start, end === -1 ? undefined : end)

  const lines = body.split('\n')
  const matches = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!isStoryTitleLine(line)) continue

    const title = normalizeStoryTitle(line)
    const index = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0)
    matches.push({ title, index, lineLength: line.length })
  }

  const chapters = matches.map((entry, idx) => {
    const contentStart = entry.index + entry.lineLength
    const contentEnd = idx + 1 < matches.length ? matches[idx + 1].index : body.length
    const content = cleanText(body.slice(contentStart, contentEnd))
    const number = String(idx + 1)
    const title = titleCase(entry.title.replace(/\.$/, ''))

    return {
      id: number,
      number,
      reference: title,
      content,
    }
  })

  return chapters.filter((chapter) => chapter.content.length > 50)
}

function buildBook({ id, name, abbreviation, author, source, testament, chapters }) {
  return {
    id,
    name,
    abbreviation,
    author,
    source,
    testament,
    chapters: chapters.map((chapter) => ({
      id: `${id}.${chapter.number}`,
      number: chapter.number,
      reference: chapter.reference,
      content: chapter.content,
    })),
  }
}

function main() {
  const lathburyPath = path.join(sourceDir, 'pg25309-childs-story.txt')
  const motherPath = path.join(sourceDir, 'pg17163-mother-stories.txt')

  const lathburyText = fs.readFileSync(lathburyPath, 'utf8')
  const motherText = fs.readFileSync(motherPath, 'utf8')

  const { oldTestament, newTestament: lathburyNT } = parseLathburySections(lathburyText)
  const motherStories = parseMotherStories(motherText)

  const oldTestamentData = {
    bibleName: "Project Gutenberg — Child's Story of the Bible (Old Testament)",
    bibleId: 'gutenberg-25309-ot',
    books: [
      buildBook({
        id: 'CSB-OT',
        name: "Child's Story of the Bible",
        abbreviation: "Child's Bible",
        author: 'Mary A. Lathbury',
        source: 'https://www.gutenberg.org/ebooks/25309',
        testament: 'old',
        chapters: oldTestament,
      }),
    ],
  }

  const newTestamentData = {
    bibleName: 'Project Gutenberg — New Testament Bible Stories for Children',
    bibleId: 'gutenberg-nt-stories',
    books: [
      buildBook({
        id: 'CSB-NT',
        name: "Child's Story of the Bible",
        abbreviation: "Child's Bible",
        author: 'Mary A. Lathbury',
        source: 'https://www.gutenberg.org/ebooks/25309',
        testament: 'new',
        chapters: lathburyNT,
      }),
      buildBook({
        id: 'MSNT',
        name: 'Mother Stories from the New Testament',
        abbreviation: 'Mother Stories',
        author: 'Anonymous',
        source: 'https://www.gutenberg.org/ebooks/17163',
        testament: 'new',
        chapters: motherStories,
      }),
    ],
  }

  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'old-testament-data.json'), JSON.stringify(oldTestamentData, null, 2))
  fs.writeFileSync(path.join(dataDir, 'new-testament-data.json'), JSON.stringify(newTestamentData, null, 2))

  console.log('Old Testament stories:', oldTestament.length)
  console.log("Child's Story NT stories:", lathburyNT.length)
  console.log('Mother Stories:', motherStories.length)
}

main()
