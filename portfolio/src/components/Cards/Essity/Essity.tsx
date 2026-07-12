import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useRipple } from '../../useRipple'

const VIDEO_SRC = '/src/assets/videos/duolingo-avatar.webm'
const HERO_IMAGE = '/src/assets/images/general/quote-icon.svg'

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

function TldrToggle({ modelValue, onUpdate }: { modelValue: boolean; onUpdate: (value: boolean) => void }) {
  return (
    <div className="tldr-bar">
      <span
        className="tldr-indicator"
        style={{ transform: modelValue ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
      />
      <button
        className={['tldr-pill', !modelValue ? 'tldr-pill--active' : ''].filter(Boolean).join(' ')}
        type="button"
        onClick={() => onUpdate(false)}
      >
        Full
      </button>
      <button
        className={['tldr-pill', modelValue ? 'tldr-pill--active' : ''].filter(Boolean).join(' ')}
        type="button"
        onClick={() => onUpdate(true)}
      >
        TL;DR
      </button>
    </div>
  )
}

function CaseStudyOverlay({
  cardClass,
  videoSrc,
  videoClass,
  tooltip,
  heroSize,
  children,
}: {
  cardClass: string
  videoSrc: string
  videoClass: string
  tooltip: string
  heroSize: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [wasOpen, setWasOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const { spawnRipple, renderRipples } = useRipple()

  function openOverlay() {
    setWasOpen(true)
    setClosing(false)
    setOpen(true)
  }

  function closeOverlay() {
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
      setShowBackToTop(false)
    }, 450)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOverlay()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="cs-card-wrapper">
      <div
        className={['bento-card', cardClass, open ? 'cs-card--ghost' : '', wasOpen ? 'cs-card--was-open' : ''].filter(Boolean).join(' ')}
        data-tooltip={tooltip}
        onClick={openOverlay}
      >
        <img className={videoClass} src={HERO_IMAGE} alt="Essity case study preview" />
        <span className="action-icon" aria-hidden="true">
          <img src={ICON_EXPAND} alt="" />
        </span>
      </div>

      {open ? (
        <>
          <div className={['cs-backdrop', closing ? 'cs-backdrop--out' : ''].filter(Boolean).join(' ')} onClick={closeOverlay} />
          <div
            className={['cs-expanded', 'cs-expanded--settled', closing ? 'cs-expanded--closing' : ''].filter(Boolean).join(' ')}
            style={{ left: 0, top: 0, width: '100vw', height: '100vh' }}
            onClick={spawnRipple}
          >
            <div className="cs-header">
              <button className="cs-header-close" type="button" data-tooltip="Press Esc to exit fullscreen" aria-label="Close case study" onClick={closeOverlay}>
                <img src={ICON_SHRINK} alt="" />
              </button>
            </div>

            <div
              ref={innerRef}
              className="cs-expanded-inner"
              onScroll={(event) => setShowBackToTop(event.currentTarget.scrollTop > 600)}
            >
              <div className="cs-expanded-content">
                <video
                  className="cs-hero-video"
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  style={{ width: `${heroSize}px`, height: `${heroSize}px` }}
                />
                {children}
              </div>
            </div>

            <button
              className={['cs-back-to-top', showBackToTop ? 'cs-back-to-top--visible' : ''].filter(Boolean).join(' ')}
              type="button"
              aria-label="Back to top"
              onClick={() => innerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              ↑
            </button>

            {renderRipples()}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function Essity() {
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="essity-card"
      videoSrc={VIDEO_SRC}
      videoClass="essity-preview"
      tooltip="Designing a more intuitive healthcare journey ↩️"
      heroSize={448}
    >
      <div className="cs-body">
        <div className="tldr-bar-wrap">
          <TldrToggle modelValue={tldr} onUpdate={setTldr} />
        </div>

        <h1 className="cs-title">Essity — Designing for clarity in a complex healthcare journey</h1>
        <p className="cs-body-text">
          I shaped a more intuitive experience for Essity’s digital ecosystem, helping users navigate sensitive products and information with less friction.
        </p>

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">Product Design</p>

        <h2 className="cs-section-title">Impact</h2>
        {full(
          <>
            <h3 className="cs-subsection-title">🧭 Simplified a complex journey</h3>
            <p className="cs-body-text">
              The experience was reworked around clearer navigation, more confident decisions, and less cognitive load for users in high-stress moments.
            </p>
            <h3 className="cs-subsection-title">🧩 Built a scalable design system direction</h3>
            <p className="cs-body-text">
              The work established reusable patterns that made the product easier to extend across channels and future use cases.
            </p>
          </>,
        )}
      </div>

      <img className="cs-cover-img" src={HERO_IMAGE} alt="Essity experience overview" />
      <p className="cs-hint">Concept exploration for a healthcare-focused product journey</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">What changed</h2>
        {full(
          <>
            <p className="cs-body-text">
              The project focused on reducing ambiguity in a healthcare context where trust, clarity, and ease of use matter more than novelty.
            </p>
            <p className="cs-body-text">
              The result was a more guided, calmer experience that helped users progress with confidence while keeping the design system practical and reusable.
            </p>
          </>,
        )}
      </div>
    </CaseStudyOverlay>
  )
}
