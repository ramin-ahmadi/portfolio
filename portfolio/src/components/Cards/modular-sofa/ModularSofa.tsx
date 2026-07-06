import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRipple } from '../../useRipple'
import './modular-sofa.css'

const VIDEO_SRC = '/src/assets/videos/modular-sofa-clip.mp4'
const SCREENSHOT = '/src/assets/images/modular-sofa/modular-sofa-configurator.png'
const PODCAST_SCREENSHOT = '/src/assets/images/modular-sofa/modular-sofa-room-preview.png'
const IMG_SEL_REGION = '/src/assets/images/modular-sofa/select-layout-hover.png'
const IMG_FIND_ST = '/src/assets/images/modular-sofa/pick-modules-hover.png'
const IMG_QUICK = '/src/assets/images/modular-sofa/assembly-guide-hover.png'

const ICON_EXPAND = '/src/assets/icons/expand.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

type AntonymCard = {
  id: string
  title: string
  desc: string
  left: number
  top: number
  hoverImg: string | null
}

// Card positions taken directly from Figma (680px-wide container)
const CARDS: AntonymCard[] = [
  { id: 'select-region', title: 'Select a layout', desc: 'Pick a base arrangement for compact, corner, or open-plan rooms.', left: 55, top: 88, hoverImg: IMG_SEL_REGION },
  { id: 'find-station', title: 'Pick modules', desc: 'Choose seats, corners, chaises, and ottomans to build the sofa.', left: 55, top: 217, hoverImg: IMG_FIND_ST },
  { id: 'content-type', title: 'Preview mode', desc: 'Switch between configurator view and room preview.', left: 472, top: 63, hoverImg: null },
  { id: 'quick-guide', title: 'Assembly guide', desc: 'Clear rules for connectors, sizing, spacing, and combinations.', left: 472, top: 178, hoverImg: IMG_QUICK },
  { id: 'apply-designs', title: 'Save layout', desc: 'Apply the selected setup to the room and keep it for later.', left: 472, top: 313, hoverImg: null },
]

const ANTONYM_H = 600
const ANTONYM_SCREENSHOT_W = 225
const ANTONYM_SCREENSHOT_H = 476
const ANTONYM_CARD_W = 152

// Mobile card order: content-type first, then the rest stacked
const MOBILE_CARDS = [CARDS[2], CARDS[0], CARDS[1], CARDS[3], CARDS[4]]

const V_IMGS = [
  { src: '/src/assets/images/modular-sofa/modular-sofa-V1.png?v=2', hint: 'POC' },
  { src: '/src/assets/images/modular-sofa/modular-sofa-V2.png', hint: 'Added modules' },
  { src: '/src/assets/images/modular-sofa/modular-sofa-V3.png', hint: 'Room preview' },
  { src: '/src/assets/images/modular-sofa/modular-sofa-V4.png', hint: 'Fabric options' },
  { src: '/src/assets/images/modular-sofa/modular-sofa-V5.png', hint: 'Guided setup' },
]

const ERROR_IMGS = [
  '/src/assets/images/modular-sofa/modular-sofa-error-layout.png',
  '/src/assets/images/modular-sofa/modular-sofa-error-module.png',
  '/src/assets/images/modular-sofa/modular-sofa-error-dimensions.png',
  '/src/assets/images/modular-sofa/modular-sofa-error-fabric.png',
]

// ── Marquee background rows ──
const MARQUEE_ROWS = [
  { imgs: Array.from({ length: 11 }, (_, i) => `/src/assets/images/modular-sofa/module-row/${String(i + 1).padStart(2, '0')}.png`), dir: 'left' },
  { imgs: Array.from({ length: 10 }, (_, i) => `/src/assets/images/modular-sofa/module-row/${String(i + 12).padStart(2, '0')}.png`), dir: 'right' },
  { imgs: Array.from({ length: 11 }, (_, i) => `/src/assets/images/modular-sofa/module-row/${String(i + 22).padStart(2, '0')}.png`), dir: 'left' },
  { imgs: Array.from({ length: 10 }, (_, i) => `/src/assets/images/modular-sofa/module-row/${String(i + 33).padStart(2, '0')}.png`), dir: 'right' },
]

const HITS_IMG = '/src/assets/images/modular-sofa/modular-sofa-hero.png'

function useResponsiveScale(baseWidth: number) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [containerW, setContainerW] = useState(baseWidth)
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanHover(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      setContainerW(Math.min(baseWidth, Math.max(280, entry.contentRect.width)))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [baseWidth])

  return { ref, containerW, scale: containerW / baseWidth, canHover }
}

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

function InteractiveTag({ hint }: { hint: string }) {
  return <p className="cs-hint">{hint}</p>
}

function AntonymSection() {
  const { ref, containerW: csW, scale: csScale, canHover } = useResponsiveScale(680)
  const [active, setActive] = useState<string | null>(null)

  const s = csScale

  // aria-hidden: decorative interactive demo of the configurator UI cards.
  // The case-study prose covers the meaning; card titles/descriptions
  // would otherwise leak as run-on text into Reader Mode and screen readers.

  // ── Mobile: flex layout — cards left, screenshot right ──
  if (!canHover) {
    return (
      <div ref={ref} className="cs-responsive-measure">
        <div
          className="cs-antonym-section cs-antonym-section--mobile"
          style={{ width: `${csW}px` }}
          aria-hidden="true"
        >
          <div className="cs-antonym-mobile-cards">
            {MOBILE_CARDS.map((card) => (
              <div key={card.id} className="cs-antonym-card">
                <p className="cs-antonym-card-title">{card.title}</p>
                <p className="cs-antonym-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="cs-antonym-mobile-screenshot">
            <img className="cs-antonym-screenshot" src={SCREENSHOT} alt="Modular sofa configurator interface" />
          </div>
        </div>
      </div>
    )
  }

  // ── Desktop: absolute positioning from Figma ──
  return (
    <div ref={ref} className="cs-responsive-measure">
      <div
        className="cs-antonym-section"
        style={{ width: `${csW}px`, height: `${Math.round(ANTONYM_H * s)}px` }}
        aria-hidden="true"
      >
        <div
          className="cs-antonym-screenshot-wrap"
          style={{
            left: `calc(50% - ${Math.round((ANTONYM_SCREENSHOT_W * s) / 2)}px)`,
            top: `${Math.round(62 * s)}px`,
            width: `${Math.round(ANTONYM_SCREENSHOT_W * s)}px`,
            height: `${Math.round(ANTONYM_SCREENSHOT_H * s)}px`,
          }}
        >
          <img
            className={['cs-antonym-screenshot', active === 'content-type' ? 'cs-antonym-screenshot--exit' : ''].filter(Boolean).join(' ')}
            src={SCREENSHOT}
            alt="Modular sofa configurator interface"
          />
          <img
            className={['cs-antonym-screenshot', 'cs-antonym-screenshot--podcast', active === 'content-type' ? 'cs-antonym-screenshot--active' : ''].join(' ')}
            src={PODCAST_SCREENSHOT}
            alt="Modular sofa room preview interface"
          />
        </div>

        {CARDS.map((card) => (
          <div
            key={card.id}
            className="cs-antonym-card-wrapper"
            style={{
              left: `${Math.round(card.left * s)}px`,
              top: `${Math.round(card.top * s)}px`,
              width: `${Math.round(ANTONYM_CARD_W * s)}px`,
            }}
            onMouseEnter={() => setActive(card.id)}
            onMouseLeave={() => setActive(null)}
          >
            <div
              className="cs-antonym-card"
              style={{ opacity: active && active !== card.id ? 0.3 : 1 }}
            >
              <p className="cs-antonym-card-title">{card.title}</p>
              <p className="cs-antonym-card-desc">{card.desc}</p>
            </div>

            {card.hoverImg ? (
              <img
                className={['cs-antonym-hover-img', active === card.id ? 'cs-antonym-hover-img--visible' : ''].join(' ').trim()}
                src={card.hoverImg}
                alt={card.title}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function VersionSection() {
  const { ref: measureRef, containerW: csW } = useResponsiveScale(680)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // aria-hidden: decorative version-history demo. Version hint labels
  // would otherwise leak into Reader Mode alongside the case-study prose.
  return (
    <div ref={measureRef} className="cs-responsive-measure">
      <div
        ref={sectionRef}
        className="cs-versions-section"
        style={{ width: `${Math.round(csW * 1.5)}px` }}
        aria-hidden="true"
      >
        {V_IMGS.map((img, i) => (
          <div
            key={img.src}
            className={['cs-version-wrap', triggered ? 'cs-version-wrap--visible' : ''].join(' ').trim()}
            style={{ '--i': i } as CSSProperties}
          >
            <img className="cs-version-img" src={img.src} alt={`Modular Sofa V${i + 1}`} />
            <p className="cs-hint">{img.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIdx((current) => {
        setPrevIdx(current)
        window.setTimeout(() => setPrevIdx(null), 420)
        return (current + 1) % ERROR_IMGS.length
      })
    }, 2500)

    return () => window.clearInterval(timer)
  }, [])

  // aria-hidden: decorative rotating error-state demo. The case-study
  // prose explains the error guidance; the rotating images are visual
  // illustration only.
  return (
    <div className="cs-error-section" aria-hidden="true">
      <div className="cs-error-bar">
        {ERROR_IMGS.map((src, i) => {
          const isActive = activeIdx === i
          const isLeaving = prevIdx === i
          return (
            <img
              key={src}
              src={src}
              alt={`Modular sofa guidance ${i + 1}`}
              className={[
                'cs-error-img',
                isActive ? 'cs-error-img--active' : '',
                isLeaving ? 'cs-error-img--leaving' : '',
              ].filter(Boolean).join(' ')}
            />
          )
        })}
      </div>

      <img className="cs-figma-bar" src="/src/assets/images/modular-sofa/configurator-toolbar.png" alt="Configurator toolbar" />
    </div>
  )
}

function MarqueeSection() {
  // aria-hidden: decorative scrolling marquee of sofa module tiles.
  // Purely visual flourish — no meaningful content for a11y tree.
  return (
    <div className="cs-marquee-section" aria-hidden="true">
      {MARQUEE_ROWS.map((row, ri) => (
        <div
          key={`${row.dir}-${ri}`}
          className={['cs-marquee-track', row.dir === 'right' ? 'cs-marquee-track--right' : ''].filter(Boolean).join(' ')}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="cs-marquee-set" aria-hidden={copy === 1 ? 'true' : undefined}>
              {row.imgs.map((src, ii) => (
                <img key={`${src}-${ii}`} className="cs-marquee-img" src={src} alt="" loading="lazy" />
              ))}
            </div>
          ))}
        </div>
      ))}
      <img className="cs-marquee-hero" src={HITS_IMG} alt="Modular sofa configured for a living room" />
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
        className={[
          'bento-card',
          cardClass,
          open ? 'cs-card--ghost' : '',
          wasOpen ? 'cs-card--was-open' : '',
        ].filter(Boolean).join(' ')}
        data-tooltip={tooltip}
        onClick={openOverlay}
      >
        <video
          className={videoClass}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <span className="action-icon" aria-hidden="true">
          <img src={ICON_EXPAND} alt="" />
        </span>
      </div>

      {open ? (
        <>
          <div className={['cs-backdrop', closing ? 'cs-backdrop--out' : ''].filter(Boolean).join(' ')} onClick={closeOverlay} />
          <div
            className={[
              'cs-expanded',
              'cs-expanded--settled',
              closing ? 'cs-expanded--closing' : '',
            ].filter(Boolean).join(' ')}
            style={{ left: 0, top: 0, width: '100vw', height: '100vh' }}
            onClick={spawnRipple}
          >
            <div className="cs-header">
              <button className="cs-header-close" type="button"  data-tooltip="Press Esc to exit fullscreen" aria-label="Close case study" onClick={closeOverlay}>
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

export default function ModularSofa() {
  const { canHover } = useResponsiveScale(680)
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="plugin-card"
      videoSrc={VIDEO_SRC}
      videoClass="plugin-video"
      tooltip={'Design a flexible sofa system\nwith modular components 🛋️'}
      heroSize={448}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">Designing a Modular Sofa Configurator for Flexible Living Spaces</h1>

        {full(
          <p className="cs-body-text" key="intro">
            Modular Sofa is a product configurator that helps customers build a sofa from interchangeable modules, preview layout changes, and understand which combinations fit their room. It makes a complex furniture system feel simple, visual, and easy to personalise before purchase.
          </p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">Product design, interaction design, and prototyping</p>

        <h2 className="cs-section-title">Impact</h2>

        <h3 className="cs-subsection-title">⚡️ Faster Configuration</h3>
        {full(
          <p className="cs-body-text" key="faster">
            Reduced the effort of comparing sofa setups by making layout, module, and fabric choices visible in one guided flow. Customers can quickly test options without needing to decode product codes or dimensions.
          </p>,
        )}

        <h3 className="cs-subsection-title">🧩 Clear Modular Logic</h3>
        {full(
          <p className="cs-body-text" key="latest">
            Turned a flexible furniture system into clear rules for what can connect, where each piece fits, and how the final sofa changes as modules are added or removed.
          </p>,
        )}

        <h3 className="cs-subsection-title">🏠 Room-Level Confidence</h3>
        {full(
          <p className="cs-body-text" key="regions">
            Helped users move from abstract product choices to a room-ready decision by showing scale, orientation, fabric, and layout implications before checkout.
          </p>,
        )}
      </div>

      <AntonymSection />
      {canHover ? <InteractiveTag hint="Hover on the cards to learn more" /> : null}

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Problem</h2>
        <p className="cs-body-text">
          Modular furniture gives customers freedom, but it also introduces decision complexity. Shoppers need to understand module types, connection rules, room fit, fabric choices, and final pricing at the same time. Without a guided experience, the buying journey can become slow, uncertain, and dependent on sales support.
        </p>

        <h2 className="cs-section-title">Solution</h2>
        {full(
          <p className="cs-body-text" key="solution">
            I designed a configurator experience that breaks the sofa-building process into clear steps: select a layout, choose compatible modules, preview the arrangement, customise materials, and save the final setup. The interaction model keeps the structure visible while giving users immediate feedback on every change.
          </p>,
        )}
      </div>

      <video
        className="cs-demo-video"
        src="/src/assets/videos/modular-sofa-demo.mp4"
        poster="/src/assets/images/modular-sofa/modular-sofa-demo-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        style={{ pointerEvents: 'none' }}
        onLoadedData={(event) => {
          event.currentTarget.muted = true
          event.currentTarget.play().catch(() => {})
        }}
      />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Continuous Iteration</h2>
        {full(
          <p className="cs-body-text" key="iteration-1">
            I iterated on the flow by identifying where users hesitated: understanding module names, choosing a starting layout, comparing fabric options, and recognising invalid combinations. Each round made the configurator more visual and less dependent on explanatory copy.
          </p>,
          <p className="cs-body-text" key="iteration-2">
            The project evolved from a simple module picker into a more complete planning tool. Features were progressively introduced, including room preview, guided assembly rules, fabric comparison, saved configurations, and clearer error states for combinations that could not be built.
          </p>,
        )}
      </div>

      <VersionSection />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">User Guidance & Error Handling</h2>
        {full(
          <p className="cs-body-text" key="error-1">
            A key focus was keeping the experience supportive when users selected incompatible modules or dimensions. The configurator needed to explain constraints without making the product feel restrictive.
          </p>,
          <p className="cs-body-text" key="error-2">
            To address this, I designed clear, actionable guidance that explains why a choice will not work and what the user can do next. This keeps the flow moving and builds confidence in the final configuration.
          </p>,
        )}
      </div>

      <ErrorSection />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Result</h2>
        <p className="cs-body-text">
          The Modular Sofa configurator gives customers a clearer way to plan, personalise, and validate a sofa before purchase. By making module logic visible and interactive, it reduces uncertainty and turns a complex product system into a confident design decision.
        </p>
      </div>

      <MarqueeSection />
    </CaseStudyOverlay>
  )
}
