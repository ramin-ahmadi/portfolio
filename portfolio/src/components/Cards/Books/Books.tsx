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
  const booksScrollEl = useRef<HTMLDivElement | null>(null)
  const startRect = useRef<DOMRect | null>(null)
  const closeTimer = useRef<number | null>(null)
  const expandedRef = useRef(false)
  const closingRef = useRef(false)

  const [expanded, setExpanded] = useState(false)
  const [settled, setSettled] = useState(false)
  const [closing, setClosing] = useState(false)
  const [viewedPercent, setViewedPercent] = useState(0)
  const [hasCompletedList, setHasCompletedList] = useState(false)
  const booksData = goodreadsSnapshot as GoodreadsData
  const books = booksData?.books || []
  const bookCount = booksData?.count ?? books.length
  const latestBooks = books.slice(0, 3)
  const isAtListEnd = viewedPercent >= 100
  const { spawnRipple, renderRipples } = useRipple()

  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  useEffect(() => {
    closingRef.current = closing
  }, [closing])

  const updateViewedPercent = useCallback(() => {
    const el = booksScrollEl.current
    if (!el) {
      setViewedPercent(0)
      return
    }

    const scrollable = el.scrollHeight - el.clientHeight
    if (scrollable <= 0) {
      const nextPercent = bookCount > 0 ? 100 : 0
      setViewedPercent(nextPercent)
      if (nextPercent === 100) setHasCompletedList(true)
      return
    }

    const viewed = (el.scrollTop / scrollable) * 100
    const nextPercent = Math.min(100, Math.max(0, Math.round(viewed)))
    setViewedPercent(nextPercent)
    if (nextPercent === 100) setHasCompletedList(true)
  }, [bookCount])

  useEffect(() => {
    if (!expanded) return

    const frame = window.requestAnimationFrame(updateViewedPercent)
    window.addEventListener('resize', updateViewedPercent)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateViewedPercent)
    }
  }, [expanded, updateViewedPercent])

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

  const toggleBooksScroll = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const el = booksScrollEl.current
    if (!el) return

    el.scrollTo({
      top: isAtListEnd ? 0 : Math.min(el.scrollHeight, el.scrollTop + Math.max(240, el.clientHeight * 0.85)),
      behavior: 'smooth',
    })
  }, [isAtListEnd])

  return (
    <div className="ux-quote-card-wrapper">
      <div
        ref={cardEl}
        className={['bento-card', 'ux-quote-card', expanded ? 'ux-quote-card--ghost' : ''].filter(Boolean).join(' ')}
        onClick={open}
        data-tooltip="Books read on Goodreads 📚"
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

                <div
                  ref={booksScrollEl}
                  className="ux-quote-expanded-body books-expanded-body"
                  onScroll={updateViewedPercent}
                >
                  <p> Reading has been one of the biggest influences on how I think and work. Here's a collection of books I've finished over the years. The list below is pulled straight from my <a href={GOODREADS_PROFILE} target="_blank" rel="noopener noreferrer">Goodreads profile</a> account.</p>
                  {bookCount === 0 ? (
                    <p>Failed to connect to Goodreads.</p>
                  ) : null}

                  {bookCount > 0 ? (
                    <>

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

            {bookCount > 0 ? (
              <div className="books-scroll-footer" onClick={(event) => event.stopPropagation()}>
                <span
                  className={[
                    'books-scroll-progress',
                    hasCompletedList ? 'books-scroll-progress--complete' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={hasCompletedList ? 'Completed the books list' : `${viewedPercent}% through the list`}
                >
                  {hasCompletedList ? <span className="books-scroll-check" aria-hidden="true" /> : `${viewedPercent}% through the list`}
                </span>
                <button
                  className={[
                    'books-scroll-btn',
                    isAtListEnd ? 'books-scroll-btn--up' : '',
                  ].filter(Boolean).join(' ')}
                  type="button"
                  onClick={toggleBooksScroll}
                  aria-label={isAtListEnd ? 'Scroll to the top of the books list' : 'Scroll down the books list'}
                  data-tooltip={isAtListEnd ? 'Back to top' : 'Scroll down'}
                />
              </div>
            ) : null}

            {renderRipples()}
          </div>
        </div>
      ) : null}
    </div>
  )
}
