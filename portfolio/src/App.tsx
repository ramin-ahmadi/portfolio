
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './styles/App.css'
import './styles/tokens.css'
import Nav from './components/Nav/Nav'
import CursorTooltip from './components/Tooltip/Tooltip'
import { LAYOUTS, MOBILE_BREAKPOINT, MOBILE_LAYOUTS } from './components/FilterLayout/FilterLayout'
import AboutCard from './components/Cards/AboutCard/AboutCard'
import GmailCard from './components/Cards/GmailCard/GmailCard'
import LinkedinCard from './components/Cards/LinkedinCard/LinkedinCard'
import BulbCard from './components/Cards/BulbCard/BulbCard'
import DuolingoCard from './components/Cards/DuolingoCard/DuolingoCard'
import ModularSofa from './components/Cards/modular-sofa/ModularSofa'
import DesignSystem from './components/Cards/DesignSystem/DesignSystem'
import AgenticDesignSystem from './components/Cards/AgenticDesignSystem/AgenticDesignSystem'
import Libra from './components/Cards/Libra/Libra'
import Quote from './components/Cards/quote/Quote'
import QuoteUX from './components/Cards/QuoteUX/QuoteUX'
import Essity from './components/Cards/Essity/Essity'
import Strava from './components/Cards/Strava/Strava'
import Books from './components/Cards/Books/Books'

const CARD_COMPONENTS: Record<string, ReactNode> = {
  AboutCard: <AboutCard />,
  GmailCard: <GmailCard />,
  LinkedinCard: <LinkedinCard />,
  BulbCard: <BulbCard />,
  DuolingoCard: <DuolingoCard />,
  ModularSofa: <ModularSofa />,
  DesignSystem: <DesignSystem />,
  AgenticDesignSystem: <AgenticDesignSystem />,
  Libra: <Libra />,
  Quote: <Quote />,
  QuoteUX: <QuoteUX />,
  Essity: <Essity />,
  Strava: <Strava />,
  Books: <Books />,
}

function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  })

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const onChange = () => setIsMobile(query.matches)

    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

function App() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const previousSlotRects = useRef<Record<string, DOMRect>>({})
  const hasMeasuredInitialLayout = useRef(false)
  const isMobileLayout = useIsMobileLayout()

  const activeLayouts = isMobileLayout ? MOBILE_LAYOUTS : LAYOUTS
  const activeLayout = activeLayouts[activeFilter as keyof typeof activeLayouts] || activeLayouts.All

  const slots = useMemo(() => (
    Object.entries(CARD_COMPONENTS).map(([key, component]) => {
      const slot = (activeLayout as Record<string, { col: string; row: string; dim?: boolean }>)[key]
      if (!slot) return null

      const style: CSSProperties = {
        gridColumn: slot.col,
        gridRow: slot.row,
      }

      return {
        key,
        component,
        className: ['grid-slot', slot.dim ? 'grid-slot--dim' : ''].filter(Boolean).join(' '),
        style,
      }
    }).filter(Boolean)
  ), [activeLayout])

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  function captureSlotRects() {
    previousSlotRects.current = Object.fromEntries(
      Object.entries(slotRefs.current)
        .filter(([, el]) => Boolean(el))
        .map(([key, el]) => [key, el!.getBoundingClientRect()]),
    )
  }

  useLayoutEffect(() => {
    if (!hasMeasuredInitialLayout.current) {
      hasMeasuredInitialLayout.current = true
      return
    }

    const previousRects = previousSlotRects.current
    if (!Object.keys(previousRects).length) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    slots.forEach((slot) => {
      if (!slot) return

      const el = slotRefs.current[slot.key]
      const previousRect = previousRects[slot.key]
      if (!el || !previousRect) return

      const nextRect = el.getBoundingClientRect()
      const dx = previousRect.left - nextRect.left
      const dy = previousRect.top - nextRect.top

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return

      if (reduceMotion) return

      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        {
          duration: 520,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      )
    })

    previousSlotRects.current = {}
  }, [slots])

  function handleNavSelect(item: string) {
    const layout = LAYOUTS[item as keyof typeof LAYOUTS]
    if (layout && 'url' in layout) {
      window.open(layout.url, '_blank', 'noopener,noreferrer')
      return
    }

    captureSlotRects()
    setActiveFilter(item)
  }

  return (
    
    <>
    <div className="cs-root" >
       </div>
      <Nav activePill={activeFilter} onSelect={handleNavSelect} />
      <main className="main">
        <div className="grid">
          {slots.map((slot) => slot ? (
            <div
              className={slot.className}
              style={slot.style}
              key={slot.key}
              ref={(el) => {
                slotRefs.current[slot.key] = el
              }}
            >
              {slot.component}
            </div>
          ) : null)}

        </div>
      </main>
      <button
        className={['back-to-top', showBackToTop ? 'back-to-top--visible' : ''].filter(Boolean).join(' ')}
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>

      <CursorTooltip />
    </>
  )
}

export default App
