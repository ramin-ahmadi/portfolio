import React, { useCallback, useEffect, useRef, useState } from 'react'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'
const AVATAR = '/src/assets/hero.png'
const ABOUT_MAX_W = 800
const ANIM_MS = 700
const EASE = 'cubic-bezier(0.34, 1.1, 0.64, 1)'
const FLY_TRANSITION = `left ${ANIM_MS}ms ${EASE}, top ${ANIM_MS}ms ${EASE}, width ${ANIM_MS}ms ${EASE}, height ${ANIM_MS}ms ${EASE}, border-radius 400ms ease`

function useRipple() {
  function spawnRipple(e: React.MouseEvent<HTMLElement>) {
    const r = document.createElement('span')
    r.className = 'ripple'
    const rect = e.currentTarget.getBoundingClientRect()
    r.style.left = `${e.clientX - rect.left}px`
    r.style.top = `${e.clientY - rect.top}px`
    e.currentTarget.appendChild(r)
    setTimeout(() => r.remove(), 600)
  }

  function renderRipples() {
    return null
  }

  return { spawnRipple, renderRipples }
}

export default function AboutCard() {
  const cardEl = useRef<HTMLDivElement | null>(null)
  const avatarEl = useRef<HTMLImageElement | null>(null)
  const startRect = useRef<DOMRect | null>(null)
  const avatarStart = useRef<DOMRect | null>(null)
  const closeTimer = useRef<number | null>(null)
  const avatarTimer = useRef<number | null>(null)
  const previewRaf = useRef<number | null>(null)
  const previewTimer = useRef<number | null>(null)
  const expandedRef = useRef(false)
  const flyActiveRef = useRef(false)
  const closingRef = useRef(false)

  const [expanded, setExpanded] = useState(false)
  const [settled, setSettled] = useState(false)
  const [closing, setClosing] = useState(false)
  const [wasOpen, setWasOpen] = useState(false)
  const [flyActive, setFlyActive] = useState(false)
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({})
  const { spawnRipple, renderRipples } = useRipple()

  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  useEffect(() => {
    flyActiveRef.current = flyActive
  }, [flyActive])

  useEffect(() => {
    closingRef.current = closing
  }, [closing])

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
      if (avatarTimer.current) window.clearTimeout(avatarTimer.current)
      if (previewTimer.current) window.clearTimeout(previewTimer.current)
      if (previewRaf.current) window.cancelAnimationFrame(previewRaf.current)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    if (expanded) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [expanded])

  function avatarTarget() {
    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const targetW = Math.min(ABOUT_MAX_W, vpW - 48)
    const targetH = Math.min(vpH * 0.85, 820)
    const targetL = Math.max(24, (vpW - targetW) / 2)
    const targetT = Math.max(24, (vpH - targetH) / 2)
    return {
      left: targetL + (targetW - 150) / 2,
      top: targetT + 40,
      size: 150,
    }
  }

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
    if (!cardEl.current || !avatarEl.current) return

    startRect.current = cardEl.current.getBoundingClientRect()
    avatarStart.current = avatarEl.current.getBoundingClientRect()

    setFlyStyle({
      left: `${avatarStart.current.left}px`,
      top: `${avatarStart.current.top}px`,
      width: `${avatarStart.current.width}px`,
      height: `${avatarStart.current.height}px`,
      borderRadius: '24px 0 0 24px',
      transition: 'none',
    })

    setFlyActive(true)
    setExpanded(true)
    setSettled(false)
    setClosing(false)
    setWasOpen(true)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)

    setSettled(true)
    const target = avatarTarget()
    setFlyStyle({
      left: `${target.left}px`,
      top: `${target.top}px`,
      width: `${target.size}px`,
      height: `${target.size}px`,
      borderRadius: '50%',
      transition: FLY_TRANSITION,
    })

    if (avatarTimer.current) window.clearTimeout(avatarTimer.current)
    avatarTimer.current = window.setTimeout(() => {
      setFlyActive(false)
    }, ANIM_MS + 150)
  }, [])

  const close = useCallback(() => {
    if (closingRef.current) return

    const useFly = !flyActiveRef.current

    if (useFly && avatarStart.current) {
      const target = avatarTarget()
      setFlyStyle({
        left: `${target.left}px`,
        top: `${target.top}px`,
        width: `${target.size}px`,
        height: `${target.size}px`,
        borderRadius: '50%',
        transition: 'none',
      })
      setFlyActive(true)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!avatarStart.current) return
          setFlyStyle({
            left: `${avatarStart.current.left}px`,
            top: `${avatarStart.current.top}px`,
            width: `${avatarStart.current.width}px`,
            height: `${avatarStart.current.height}px`,
            borderRadius: '24px 0 0 24px',
            transition: FLY_TRANSITION,
          })
        })
      })
    }

    setClosing(true)
    setClosing(true)
    closingRef.current = true

    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setExpanded(false)
      setSettled(false)
      setClosing(false)
      closingRef.current = false
      setFlyActive(false)
      setWasOpen(true)
      startRect.current = null
      avatarStart.current = null
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }, ANIM_MS + 20)
  }, [])

  return (
    <div className="about-card-wrapper">
      <img
        className="about-avatar-fly"
        src={AVATAR}
        alt=""
        style={{
          ...flyStyle,
          opacity: flyActive ? 1 : 0,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={cardEl}
        className={`bento-card about-card ${expanded ? 'about-card--ghost' : ''} ${wasOpen ? 'about-card--was-open' : ''}`}
        onClick={open}
        data-tooltip="Expand to learn more about me"
      >
        <a
          className="action-icon"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            open()
          }}
        >
          <img src={ICON_EXPAND} alt="Expand" />
        </a>

        <img
          ref={avatarEl}
          className="about-avatar"
          src={AVATAR}
          alt="Profile"
          style={flyActive ? { opacity: 0 } : {}}
        />

        <div className="about-bio">
          <p>Heyyy 👋</p>
          <p>I'm a designer who builds polished systems and strong cross-functional collaboration.</p>
        </div>
      </div>

      {expanded ? (
        <div>
          <div
            className={`about-backdrop ${closing ? 'about-backdrop--out' : ''}`}
            onClick={close}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          />

          <div
            className={`about-expanded-card ${settled ? 'about-expanded-card--settled' : ''} ${closing ? 'about-expanded-card--closing' : ''}`}
            style={expandedStyle()}
            onClick={spawnRipple}
          >
            <button
              className="about-shrink-btn"
              onClick={(e) => {
                e.stopPropagation()
                close()
              }}
              aria-label="Close"
              data-tooltip="Press Esc to exit"
            >
              <img src={ICON_SHRINK} alt="Close" width={20} height={20} />
            </button>

            <div className="about-expanded-inner">
              <div className="about-expanded-content">
                <img
                  className="about-expanded-avatar"
                  src={AVATAR}
                  alt="Profile"
                  style={flyActive ? { opacity: 0 } : {}}
                />

                <div className="about-expanded-bio">
                  <h3>Bringing Design to a Team</h3>
                  <p>Role: Sole designer</p>
                  <p>I mapped existing journeys, rebuilt the interaction model, and introduced a single, reliable account-linking flow that reduced support tickets and improved user experience.</p>
                  <ul>
                    <li>Mapped user journeys</li>
                    <li>Consolidated account linking</li>
                    <li>Reduced support tickets</li>
                  </ul>
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
