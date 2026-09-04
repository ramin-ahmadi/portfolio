
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './styles/App.css'
import './styles/tokens.css'
import Nav from './components/Nav/Nav'
import CursorTooltip from './components/tooltip/Tooltip'
import { LAYOUTS, MOBILE_BREAKPOINT, MOBILE_LAYOUTS } from './components/FilterLayout/FilterLayout'
import AboutCard from './components/Cards/AboutCard/AboutCard'
import GmailCard from './components/Cards/GmailCard/GmailCard'
import LinkedinCard from './components/Cards/LinkedinCard/LinkedinCard'
import BulbCard from './components/Cards/BulbCard/BulbCard'
import DuolingoCard from './components/Cards/DuolingoCard/DuolingoCard'
import ModularSofa from './components/Cards/modular-sofa/ModularSofa'
import DesignSystem from './components/Cards/DesignSystem/DesignSystem'
import Rebrand from './components/Cards/Rebrand/Rebrand'
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
  Rebrand: <Rebrand />,
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

function useGlobalCoverImageReveal() {
  useEffect(() => {
    const selector = '.cs-expanded-content .cs-cover-img'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const intersectionObserver = !reduceMotion && 'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return

              entry.target.classList.add('cs-scroll-reveal--visible')
              observer.unobserve(entry.target)
            })
          },
          {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12,
          },
        )
      : null

    const registerImage = (image: Element) => {
      if (image.classList.contains('cs-scroll-reveal--visible')) return

      if (intersectionObserver) {
        intersectionObserver.observe(image)
      } else {
        image.classList.add('cs-scroll-reveal--visible')
      }
    }

    const registerImagesWithin = (root: ParentNode) => {
      if (root instanceof Element && root.matches(selector)) {
        registerImage(root)
      }
      root.querySelectorAll(selector).forEach(registerImage)
    }

    registerImagesWithin(document)

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) registerImagesWithin(node)
        })
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      intersectionObserver?.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}

function App() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const previousSlotRects = useRef<Record<string, DOMRect>>({})
  const hasMeasuredInitialLayout = useRef(false)
  const isMobileLayout = useIsMobileLayout()

  useGlobalCoverImageReveal()

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

  useEffect(() => {
    const openCoverImage = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const image = target.closest('img.cs-cover-img')
      if (!(image instanceof HTMLImageElement)) return

      event.preventDefault()
      event.stopPropagation()
      setLightboxImage({
        src: image.currentSrc || image.src,
        alt: image.alt,
      })
    }

    document.addEventListener('click', openCoverImage, true)
    return () => document.removeEventListener('click', openCoverImage, true)
  }, [])

  useEffect(() => {
    if (!lightboxImage) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      event.stopImmediatePropagation()
      setLightboxImage(null)
    }

    document.addEventListener('keydown', closeOnEscape, true)
    return () => document.removeEventListener('keydown', closeOnEscape, true)
  }, [lightboxImage])

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
                        <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
      </button>

      <CursorTooltip />

      {lightboxImage ? (
        <div
          className="cs-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.alt || 'Expanded image'}
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightboxImage(null)
          }}
        >
          <div className="cs-image-lightbox-dialog">
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
            <button
              className="cs-image-lightbox-close"
              type="button"
              aria-label="Close expanded image"
              autoFocus
              onClick={() => setLightboxImage(null)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
