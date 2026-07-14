import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'src/assets/goodreads-books.json')
const USER_ID = process.env.GOODREADS_USER_ID || '5344267'
const SHELF = process.env.GOODREADS_SHELF || 'read'
const LIMIT = Number(process.env.GOODREADS_LIMIT || 100)

function decodeHtml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTags(value = '') {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '))
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? decodeHtml(match[1]) : ''
}

function extractDescriptionBookUrl(description = '') {
  const match = description.match(/href=["']([^"']+)["']/i)
  return match ? decodeHtml(match[1]) : ''
}

function normalizeRating(value = '') {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return ''
  return `${numeric}/5`
}

function formatGoodreadsDate(value = '') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function parseRssBooks(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]

  return items.slice(0, LIMIT).map(([, item]) => {
    const description = extractTag(item, 'description')
    const reviewUrl = extractTag(item, 'link')
    const bookUrl = extractDescriptionBookUrl(description)
    const rating = normalizeRating(extractTag(item, 'user_rating'))
    const dateRead = formatGoodreadsDate(extractTag(item, 'user_read_at'))
    const dateAdded = formatGoodreadsDate(extractTag(item, 'user_date_added'))

    return {
      reviewId: extractTag(item, 'guid').match(/review\/show\/(\d+)/)?.[1] || extractTag(item, 'book_id'),
      bookId: extractTag(item, 'book_id'),
      title: stripTags(extractTag(item, 'title')),
      author: stripTags(extractTag(item, 'author_name')),
      rating,
      averageRating: extractTag(item, 'average_rating'),
      dateRead,
      dateAdded,
      cover: extractTag(item, 'book_medium_image_url') || extractTag(item, 'book_image_url'),
      url: bookUrl || reviewUrl,
    }
  }).filter((book) => book.title)
}

async function fetchReadShelfRss() {
  const url = new URL(`https://www.goodreads.com/review/list_rss/${USER_ID}`)
  url.searchParams.set('shelf', SHELF)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml',
      'User-Agent': 'Mozilla/5.0 (compatible; portfolio-goodreads-fetch/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Goodreads RSS responded with ${response.status} ${response.statusText}`)
  }

  return response.text()
}

async function main() {
  const xml = await fetchReadShelfRss()
  const books = parseRssBooks(xml)

  if (!books.length) {
    throw new Error('No books were parsed from the Goodreads RSS feed.')
  }

  const data = {
    source: `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}`,
    userId: USER_ID,
    shelf: SHELF,
    fetchedAt: new Date().toISOString(),
    count: books.length,
    books,
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Wrote ${books.length} Goodreads books to ${path.relative(ROOT, OUTPUT_PATH)}`)
}

main().catch((error) => {
  console.error(`Goodreads fetch failed: ${error.message}`)
  process.exit(1)
})
