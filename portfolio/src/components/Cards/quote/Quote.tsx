import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRipple } from '../../useRipple'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'


const ABOUT_MAX_W = 800
const ANIM_MS = 700

const PARAGRAPHS: Array<Array<string | { bold: string }>> = [
  ['A design system gives teams a common language. It helps people work faster, stay aligned, and build with more confidence, but it should remain a tool, ', { bold: 'not a rulebook' }, '. When a component or pattern blocks a better experience, it deserves to be questioned.'],
  ['I see design systems as evolving foundations, not fixed restrictions. If stepping outside a pattern solves a genuine user problem more effectively, I will do it, then bring that learning back into the system so it improves. The strongest design systems ', { bold: 'aren\'t the ones that enforce the most rules' }, ', but the ones that make it easier to ', { bold: 'do the right thing for users' }, '.'],
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

        <span className="quote-icon" />
        <p className="quote-text">
        A good design is something <strong> we build together</strong>.
        </p>
        <span className="design-principle">How I see design</span>
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
                <span className="ds-quote-expanded-icon" ></span>

                <p className="ds-quote-expanded-quote">
                   A good design is something <strong> we build together</strong>.
                </p>

                <div className="ds-quote-expanded-body">
                 <p>
                  Earlier in my career, I probably thought about design in a much neater way. There was a user, they had a problem, and my job was to design something that made that problem easier to solve. After working and delivering several products, I don't believe design works like that anymore. </p>
                 <p>Products are messy. A decision that makes something easier for one person can create more work for someone else. A simple workflow might depend on data coming from three different avenues. That’s changed how I think about my role as a designer. </p>
                 <p>A good design to me is about understanding enough of the system to know where to intervene, what not to change, and what consequences a decision might have elsewhere. I’ve learned that good design tends to emerge organically when our understanding of the system and the people within it gets deeper. That understanding rarely comes from just a designer like me which is why I believe good design is something <strong>we build together</strong>.  </p>
                </div>

          
              </div>
            </div>

            {renderRipples()}
          </div>
        </div>
      ) : null}
    </div>
  )
}
