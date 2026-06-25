import { NextResponse } from 'next/server'
import newTestamentData from '@/data/new-testament-data.json'
import oldTestamentData from '@/data/old-testament-data.json'

export async function GET() {
  const combinedData = {
    bibleName: 'Project Gutenberg Children\'s Bible Stories',
    bibleId: 'gutenberg-csb-msnt',
    books: [...oldTestamentData.books, ...newTestamentData.books],
  }

  return NextResponse.json(combinedData)
}
