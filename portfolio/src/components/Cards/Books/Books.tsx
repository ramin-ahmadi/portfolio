import React, { useCallback, useEffect, useRef, useState } from 'react'
import goodreadsSnapshot from '../../../assets/goodreads-books.json'
import { useRipple } from '../../useRipple'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'
const GOODREADS_PROFILE = 'https://www.goodreads.com/user/show/5344267'

const ABOUT_MAX_W = 800
const ANIM_MS = 700

type GoodreadsBook = {
  reviewId?: string
  title: string
  author?: string
  rating?: string
  dateRead?: string
  cover?: string
  url?: string
}

type GoodreadsData = {
  source: string
  count: number
  fetchedAt: string | null
  books: GoodreadsBook[]
}

export default function Books() {
  const cardEl = useRef<HTMLDivElement | null>(null)
  const innerEl = useRef<HTMLDivElement | null>(null)
  const startRect = useRef<DOMRect | null>(null)
  const closeTimer = useRef<number | null>(null)
  const expandedRef = useRef(false)
  const closingRef = useRef(false)

  const [expanded, setExpanded] = useState(false)
  const [settled, setSettled] = useState(false)
  const [closing, setClosing] = useState(false)
  const booksData = goodreadsSnapshot as GoodreadsData
  const { spawnRipple, renderRipples } = useRipple()

  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  useEffect(() => {
    closingRef.current = closing
  }, [closing])

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    if (expanded) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expanded])

  function expandedStyle(): React.CSSProperties {
    if (!startRect.current) return {}

    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const targetW = Math.min(ABOUT_MAX_W, vpW - 48)
    const targetH = Math.min(vpH * 0.85, 820)
    const targetL = (vpW - targetW) / 2
    const targetT = (vpH - targetH) / 2

    if (!settled || closing) {
      return {
        left: `${startRect.current.left}px`,
        top: `${startRect.current.top}px`,
        width: `${startRect.current.width}px`,
        height: `${startRect.current.height}px`,
      }
    }

    return {
      left: `${Math.max(24, targetL)}px`,
      top: `${Math.max(24, targetT)}px`,
      width: `${targetW}px`,
      height: `${targetH}px`,
    }
  }

  const open = useCallback(async () => {
    if (expandedRef.current) return
    if (!cardEl.current) return

    startRect.current = cardEl.current.getBoundingClientRect()
    setExpanded(true)
    setSettled(false)
    setClosing(false)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)

    setSettled(true)
  }, [])

  const close = useCallback(() => {
    if (closingRef.current) return

    setClosing(true)
    closingRef.current = true

    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setExpanded(false)
      setSettled(false)
      setClosing(false)
      closingRef.current = false
      startRect.current = null
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }, ANIM_MS + 20)
  }, [])

  const books = booksData?.books || []
  const bookCount = booksData?.count ?? books.length
  const latestBooks = books.slice(0, 3)

  return (
    <div className="ux-quote-card-wrapper">
      <div
        ref={cardEl}
        className={['bento-card', 'ux-quote-card', expanded ? 'ux-quote-card--ghost' : ''].filter(Boolean).join(' ')}
        onClick={open}
        data-tooltip="Books read on Goodreads"
      >
        <a
          className="action-icon"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            open()
          }}
        >
          <img src={ICON_EXPAND} alt="Expand" />
        </a>

        <span className="books-icon"></span>
        <p className="quote-text">My <strong>library</strong> at Goodreads</p>
        <p className="quote-text">
          {bookCount > 0 ? (
            <></>
          ) : (
            <>My read books from <strong>Goodreads</strong>.</>
          )}
        </p>
        <span className="design-principle"></span>
      </div>

      {expanded ? (
        <div>
          <div
            className={['about-backdrop', closing ? 'about-backdrop--out' : ''].join(' ')}
            onClick={close}
            onWheel={(event) => event.preventDefault()}
            onTouchMove={(event) => event.preventDefault()}
          />

          <div
            className={[
              'about-expanded-card',
              settled ? 'about-expanded-card--settled' : '',
              closing ? 'about-expanded-card--closing' : '',
            ].filter(Boolean).join(' ')}
            style={expandedStyle()}
            onClick={spawnRipple}
          >
            <button
              className="about-shrink-btn"
              onClick={(event) => {
                event.stopPropagation()
                close()
              }}
              aria-label="Close"
              data-tooltip="Press Esc to exit"
            >
              <img src={ICON_SHRINK} alt="Close" width={20} height={20} />
            </button>

            <div ref={innerEl} className="about-expanded-inner ux-quote-expanded-inner">
              <div className="about-expanded-content">
                <span className="books-expanded-icon"></span>

                <p className="ux-quote-expanded-quote">
                  Books read on <strong>Goodreads</strong>.
                </p>

                <div className="ux-quote-expanded-body books-expanded-body">
                  {bookCount === 0 ? (
                    <p>No read books have been imported yet. Run <strong>npm run fetch:goodreads</strong> to pull the public read shelf.</p>
                  ) : null}

                  {bookCount > 0 ? (
                    <>
                      <p>
                        Imported <strong>{bookCount}</strong> read books from Goodreads.
                      </p>
                      <div className="books-list">
                        {books.map((book) => (
                          <a
                            className="books-list-item"
                            href={book.url || GOODREADS_PROFILE}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={book.reviewId || `${book.title}-${book.author}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {book.cover ? <img className="books-cover" src={book.cover} alt="" /> : <span className="books-cover books-cover--empty" />}
                            <span className="books-meta">
                              <span className="books-title">{book.title}</span>
                              {book.author ? <span className="books-author">{book.author}</span> : null}
                              {[book.rating, book.dateRead].filter(Boolean).length ? (
                                <span className="books-detail">{[book.rating, book.dateRead].filter(Boolean).join(' · ')}</span>
                              ) : null}
                            </span>
                          </a>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {latestBooks.length ? (
                  <span className="design-principle">
                    Latest: {latestBooks.map((book) => book.title).join(', ')}
                  </span>
                ) : (
                  <span className="design-principle">Goodreads shelf</span>
                )}
              </div>
            </div>

            {renderRipples()}
          </div>
        </div>
      ) : null}
    </div>
  )
}
