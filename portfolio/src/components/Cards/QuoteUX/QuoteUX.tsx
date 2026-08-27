import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRipple } from '../../useRipple'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

const ABOUT_MAX_W = 800
const ANIM_MS = 700

export default function QuoteUX() {
  const cardEl = useRef<HTMLDivElement | null>(null)
  const innerEl = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<number | null>(null)
  const expandedRef = useRef(false)
  const closingRef = useRef(false)

  const [expanded, setExpanded] = useState(false)
  const [settled, setSettled] = useState(false)
  const [closing, setClosing] = useState(false)
  const [startRect, setStartRect] = useState<DOMRect | null>(null)
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

  function expandedStyle(): React.CSSProperties {
    if (!startRect) return {}

    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const targetW = Math.min(ABOUT_MAX_W, vpW - 48)
    const targetH = Math.min(vpH * 0.85, 820)
    const targetL = (vpW - targetW) / 2
    const targetT = (vpH - targetH) / 2

    if (!settled || closing) {
      return {
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
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

    setStartRect(cardEl.current.getBoundingClientRect())
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
      setStartRect(null)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }, ANIM_MS + 20)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    if (expanded) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close, expanded])

  return (
    <div className="ux-quote-card-wrapper">
      <div
        ref={cardEl}
        className={['bento-card', 'ux-quote-card', expanded ? 'ux-quote-card--ghost' : ''].filter(Boolean).join(' ')}
        onClick={open}
        data-tooltip="My UX philosophy"
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

        <span className="quote-icon"></span>
        <p className="quote-text">
           My path into <strong>product design</strong>.
        </p>
        <span className="design-principle">From writing code to shaping products</span>
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
                <span className="ux-quote-expanded-icon"></span>

                <p className="ux-quote-expanded-quote">
                  My path into product design
                </p>

                <div className="ux-quote-expanded-body">
                  <p>
                   I started my career as a front-end engineer, moving from simple HTML, CSS and JS websites to building React applications over six years. Over time, I became more interested in the decisions behind the interface which led me to complete a Master’s degree in Human Computer Interaction (UX specialisation) at the University of Melbourne and gradually move into product design.
                  </p>
                  <p>
                    I’m drawn to simple ideas that help make sense of complex systems. Atomic Design shaped how I think about interfaces as connected parts rather than one page. while the work of Brad Frost, TJ Pitre, Don Norman and Michael Youngblood continues to influence how I think about design systems, AI agents. 
                
                  </p>
                  <p>
                     Outside of work I spend my time hiking, camping, reading (very) old books and occasionally writing about product design. you can find more of those thoughts on my blog at <a href="https://medium.com/@raminahmadi" target="_blank" rel="noopener noreferrer">https://medium.com/@raminahmadi</a>.
                  </p>
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
