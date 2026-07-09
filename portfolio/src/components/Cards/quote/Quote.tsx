import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRipple } from '../../useRipple'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'
const QUOTE_ICON = '/src/assets/images/general/quote-icon.svg'

const ABOUT_MAX_W = 800
const ANIM_MS = 700

const PARAGRAPHS: Array<Array<string | { bold: string }>> = [
  ['A design system is a shared language. It helps teams move faster, stay aligned, and build with confidence, but it\'s a tool, ', { bold: 'not a rulebook' }, '. The moment a component or pattern gets in the way of a better experience, it should be challenged.'],
  ['I treat design systems as living foundations, not rigid constraints. If breaking a pattern means solving a real user problem more effectively, I\'ll break it, then feed what I\'ve learned back into the system so it evolves. The best design systems ', { bold: 'aren\'t the ones that enforce the most rules' }, ', but the ones that make it easier to ', { bold: 'do the right thing for users' }, '.'],
]

export default function Quote() {
  const cardEl = useRef<HTMLDivElement | null>(null)
  const innerEl = useRef<HTMLDivElement | null>(null)
  const startRect = useRef<DOMRect | null>(null)
  const closeTimer = useRef<number | null>(null)
  const expandedRef = useRef(false)
  const closingRef = useRef(false)

  const [expanded, setExpanded] = useState(false)
  const [settled, setSettled] = useState(false)
  const [closing, setClosing] = useState(false)
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

  function renderParagraph(parts: Array<string | { bold: string }>, index: number) {
    return (
      <p key={index}>
        {parts.map((seg, segIndex): ReactNode => (
          typeof seg === 'string' ? seg : <strong key={segIndex}>{seg.bold}</strong>
        ))}
      </p>
    )
  }

  return (
    <div className="ds-quote-card-wrapper">
      <div
        ref={cardEl}
        className={['bento-card', 'ds-quote-card', expanded ? 'ds-quote-card--ghost' : ''].filter(Boolean).join(' ')}
        onClick={open}
        data-tooltip="My design system philosophy"
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

        <img className="quote-icon" src={QUOTE_ICON} alt="" />
        <p className="quote-text">
          Design system improves efficiency and consistency, but <strong>never at the cost of user experience</strong>.
        </p>
        <span className="design-principle">My design principle</span>
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

            <div ref={innerEl} className="about-expanded-inner ds-quote-expanded-inner">
              <div className="about-expanded-content">
                <img className="ds-quote-expanded-icon" src={QUOTE_ICON} alt="" />

                <p className="ds-quote-expanded-quote">
                  Design system improves efficiency and consistency, but <strong>never at the cost of user experience</strong>.
                </p>

                <div className="ds-quote-expanded-body">
                  {PARAGRAPHS.map(renderParagraph)}
                </div>

                <span className="design-principle">My design principle</span>
              </div>
            </div>

            {renderRipples()}
          </div>
        </div>
      ) : null}
    </div>
  )
}
