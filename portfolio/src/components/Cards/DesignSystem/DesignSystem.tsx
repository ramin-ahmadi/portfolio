import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import ColourVariables from '../ColourVariables/ColourVariables'
import { useRipple } from '../../useRipple'

const VIDEO_SRC = '/src/assets/videos/rayo-ds-clip.mp4'
const IMG_DS_POST = '/src/assets/images/design-system/design-system/rayo-ds-post-update.png'
const IMG_DS_PRE = '/src/assets/images/design-system/design-system/rayo-ds-pre-update.png'

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

function BeforeAfterToggle() {
  const [showNew, setShowNew] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [enterClass, setEnterClass] = useState('')
  const [exitClass, setExitClass] = useState('')
  const [exitSrc, setExitSrc] = useState('')

  useEffect(() => {
    ;[IMG_DS_POST, IMG_DS_PRE].forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  function toggle() {
    if (animating) return

    const goingToNew = !showNew
    setExitSrc(showNew ? IMG_DS_POST : IMG_DS_PRE)
    setEnterClass(goingToNew ? 'ba-img--enter-from-right' : 'ba-img--enter-from-left')
    setExitClass(goingToNew ? 'ba-img--exit-to-left' : 'ba-img--exit-to-right')
    setShowNew(goingToNew)
    setAnimating(true)

    window.setTimeout(() => {
      setAnimating(false)
      setExitSrc('')
    }, 1220)
  }

  return (
    <div className="ba-wrap">
      <div className="ba-img-clip">
        {animating && exitSrc ? (
          <img className={['ba-img', 'ba-img--abs', exitClass].join(' ')} src={exitSrc} alt="" />
        ) : null}
        <img
          className={['ba-img', animating ? enterClass : ''].filter(Boolean).join(' ')}
          src={showNew ? IMG_DS_POST : IMG_DS_PRE}
          alt={showNew ? 'Updated system architecture' : 'Previous system architecture'}
        />
      </div>
      <div className="ba-toggle" onClick={toggle} role="button" tabIndex={0} onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggle()
        }
      }}>
        <span className={['ba-label', !showNew ? 'ba-label--active' : ''].filter(Boolean).join(' ')}>Old</span>
        <div className={['ba-track', showNew ? 'ba-track--on' : ''].filter(Boolean).join(' ')}>
          <div className="ba-thumb" />
        </div>
        <span className={['ba-label', showNew ? 'ba-label--active' : ''].filter(Boolean).join(' ')}>New</span>
      </div>
    </div>
  )
}

function FigmaSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="cc-panel-row">
      <label>{label}</label>
      <div className="cc-figma-select">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function EpisodeCard({ index }: { index: number }) {
  return (
    <div className="cc-episode-card">
      <div className="cc-episode-thumb">
        <img className="cc-thumb-tl" src={`/src/assets/images/design-system/design-system/episode-thumb-${index}-tl.png`} alt="" />
        <img className="cc-thumb-tr" src={`/src/assets/images/design-system/design-system/episode-thumb-${index}-tr.png`} alt="" />
        <img className="cc-thumb-bl" src={`/src/assets/images/design-system/design-system/episode-thumb-${index}-bl.png`} alt="" />
        <img className="cc-thumb-br" src={`/src/assets/images/design-system/design-system/episode-thumb-${index}-br.png`} alt="" />
      </div>
      <div className="cc-episode-info">
        <div className="cc-episode-name">{index % 2 ? 'Fresh station picks' : 'Latest show highlights'}</div>
        <div className="cc-episode-footer">
          <div className="cc-episode-meta">
            <span className="cc-station-disc">
              <img src="/src/assets/images/design-system/design-system/station-disc.png" alt="" />
            </span>
            <span className="cc-meta-labels">
              <span className="cc-meta-label">design-system</span>
              <span className="cc-meta-dot" />
              <span className="cc-meta-label">Today</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectionCard() {
  const [size, setSize] = useState('Small')
  const [background, setBackground] = useState('Gradient')
  const [content, setContent] = useState('Cards')

  const isMedium = size === 'Medium'

  return (
    <div className="cc-outer">
      <div className="cc-layout">
        <div className="cc-canvas">
          <div className="cc-scaler" style={{ transform: isMedium ? 'scale(0.46)' : 'scale(0.86)' }}>
            <div className={['cc-card', isMedium ? 'cc-size-medium' : 'cc-size-small'].join(' ')}>
              {background === 'Gradient' ? (
                <div className="cc-card-bg" style={{ background: 'linear-gradient(135deg, #f4f3f5 0%, #ebdaff 45%, #e367c0 100%)' }} />
              ) : (
                <div className="cc-fallback-bg">
                  <img src="/src/assets/images/design-system/design-system/collection-card-bg.png" alt="" />
                </div>
              )}
              <div className="cc-card-content">
                <div className="cc-card-heading">
                  <div className="cc-card-title">Listen your way</div>
                  <div className="cc-icon-button">
                    <svg className="cc-arrow-svg" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
                {content === 'Cards' ? (
                  <div className="cc-episode-carousel">
                    <EpisodeCard index={1} />
                    <EpisodeCard index={2} />
                    <EpisodeCard index={3} />
                  </div>
                ) : (
                  <img className="cc-content-rail" src="/src/assets/images/design-system/design-system/content-rail.png" alt="" />
                )}
              </div>
            </div>
          </div>
        </div>
        <aside className="cc-panel">
          <div className="cc-panel-header">
            <h2>Collection card <span className="cc-variant-tag">variant</span></h2>
          </div>
          <FigmaSelect label="Size" value={size} options={['Small', 'Medium']} onChange={setSize} />
          <FigmaSelect label="Background" value={background} options={['Gradient', 'Image']} onChange={setBackground} />
          <div className="cc-panel-section">
            <span className="cc-section-caret" />
            <span>Nested properties</span>
          </div>
          <FigmaSelect label="Content" value={content} options={['Cards', 'Rail']} onChange={setContent} />
        </aside>
      </div>
      <p className="cs-hint cs-hint--centered">
        <span className="cc-interactive-tag">Interactive</span>
        Change nested properties without adding variants
      </p>
    </div>
  )
}

export default function DesignSystem() {
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="ds-card"
      videoSrc={VIDEO_SRC}
      videoClass="ds-video"
      tooltip={'Maximise efficiency and consistency\nby refactoring the design-system Design System 🎨'}
      heroSize={448}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">Refactoring the design-system Design System for Scalability &amp; Consistency</h1>

        {full(
          <p className="cs-body-text" key="intro">
            A comprehensive overhaul of the design-system Design System, restructuring components, tokens, and documentation to support rapid multi-brand scaling while maintaining visual consistency across all products.
          </p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">Design system lead</p>

        <h2 className="cs-section-title">Impact</h2>

        <h3 className="cs-subsection-title">🧩 Simplified Component Architecture</h3>
        {full(
          <p className="cs-body-text" key="architecture">
            Reduced the overall complexity of the system by minimising the number of variants and introducing nested components. This created a more modular and flexible structure, making components easier to maintain, scale, and reuse without duplication.
          </p>,
        )}

        <h3 className="cs-subsection-title">🤝 Improved Design–Engineering Alignment</h3>
        {full(
          <p className="cs-body-text" key="alignment">
            Streamlined the handoff process by introducing clear documentation, structured usage notes, and leveraging Figma&apos;s Dev Mode. This ensured design intent was communicated more effectively, reducing back-and-forth and increasing implementation accuracy.
          </p>,
        )}

        <h3 className="cs-subsection-title">🎨 Reliable Theming with Colour Variables</h3>
        {full(
          <p className="cs-body-text" key="variables">
            Eliminated light and dark mode inconsistencies by implementing Figma colour variables. This removed manual overrides and significantly reduced the risk of human error, ensuring themes remain consistent and scalable across the system.
          </p>,
        )}

        <h3 className="cs-subsection-title">🚀 Accessible &amp; Easy to Adopt</h3>
        {full(
          <p className="cs-body-text" key="adoption">
            Lowered the barrier to entry for new designers by simplifying the system and improving guidance. Even new joiners can quickly understand and use the design system with confidence, without feeling overwhelmed by complexity.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src="/src/assets/images/design-system/design-system/rayo-ds-cover.png" alt="design-system Design System cover" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Problem</h2>
        <p className="cs-body-text">
          Designers often felt overwhelmed navigating the design system due to the high volume of components and lack of clear structure. Nested instances were frequently overlooked when not visible within master components, leading to duplicated components and inconsistencies.
        </p>
        <p className="cs-body-text">
          In addition, an outdated colour token system required manual switching between light and dark modes. This increased the number of unnecessary variants and introduced a higher risk of human error in production-ready designs.
        </p>
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Colour variables</h2>
        {full(
          <p className="cs-body-text" key="colour-variables">
            Following{' '}
            <a
              href="https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections"
              target="_blank"
              rel="noopener noreferrer"
              className="cs-link"
            >
              Figma&apos;s variable framework
            </a>
            , I collaborated with another designer to establish a scalable colour system. We defined primitive variables based on the brand style guide, and mapped them into semantic tokens for both light and dark modes. This removed the need for manual theme switching and created a more consistent and maintainable foundation for theming.
          </p>,
        )}
      </div>

      <ColourVariables />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Spacing &amp; Responsiveness</h2>
        {full(
          <p className="cs-body-text" key="spacing">
            Working closely with the team, we standardised spacing and radius values to improve visual consistency across components. I also introduced breakpoints as variables, enabling responsive behaviour within components and automating layout adjustments across different screen sizes.
          </p>,
        )}
      </div>

      <video
        className="cs-demo-video"
        src="/src/assets/videos/figma-auto-responsive.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={(event) => event.currentTarget.play().catch(() => {})}
      />
      <p className="cs-hint">Automated responsive and light and dark mode</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Components refactor</h2>
        {full(
          <p className="cs-body-text" key="components">
            The collection card component was a key focus of the refactor. Previously, it contained 48 variants that largely duplicated the same structure, differing only in background styles and spacing adjustments for tablet layouts.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src="/src/assets/images/design-system/design-system/component-optimisation-old.png" alt="Component optimisation — before refactor" />
      <p className="cs-hint">[BEFORE] On-demand card component</p>

      {full(
        <div className="cs-body cs-body--continued" key="background-component-copy">
          <p className="cs-body-text">
            Instead of encoding these differences as variants, I extracted background styles into a separate, reusable background component. This allowed backgrounds to be applied as nested instances, exposed through a simple dropdown selection, making them easier to manage and update.
          </p>
        </div>,
      )}

      <img className="cs-cover-img" src="/src/assets/images/design-system/design-system/component-refactor-gradients.png" alt="New gradient background component" />
      <p className="cs-hint">[NEW] Gradient background component</p>

      {full(
        <div className="cs-body cs-body--continued" key="variant-reduction-copy">
          <p className="cs-body-text">
            As a result, the number of variants was reduced from 48 to just 4, while maintaining the same level of flexibility. This approach also scaled across other components with similar background requirements, significantly reducing duplication and improving overall system efficiency.
          </p>
        </div>,
      )}

      <CollectionCard />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">One Component, Multiple Contexts</h2>
        {full(
          <p className="cs-body-text" key="contexts">
            As part of the design system optimisation, we leveraged auto layout wherever possible. Since most components share the same structure across mobile and tablet (differing primarily in width), this approach allowed us to use a single variant across breakpoints. By simply adjusting width within designs, components can responsively adapt without the need for separate variants, reducing duplication and improving consistency.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src="/src/assets/images/design-system/design-system/component-examples.png" alt="Component examples across breakpoints" />
      <p className="cs-hint">Responsive component structure</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Intuitive System Architecture</h2>
        {full(
          <p className="cs-body-text" key="architecture-1">
            The existing file structure could no longer support the growing complexity of the design system. Components were spread across multiple pages with unclear grouping logic, making them difficult to locate and navigate.
          </p>,
          <p className="cs-body-text" key="architecture-2">
            To address this, I redesigned the system architecture with clarity and usability in mind. This ensures even new or less experienced designers can navigate it with ease. Each component now has its own dedicated page, structured into three clear sections:
          </p>,
          <ul className="cs-body-list" key="architecture-list">
            <li className="cs-body-text">Overview for context and usage guidance</li>
            <li className="cs-body-text">Component for the master variants</li>
            <li className="cs-body-text">Examples to showcase real use cases and expose nested configurations</li>
          </ul>,
          <p className="cs-body-text" key="architecture-3">
            The example section also allows designers to quickly copy and paste production-ready instances directly into their work, streamlining adoption and reducing setup time.
          </p>,
        )}
      </div>

      <BeforeAfterToggle />


      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Outcome</h2>
        <p className="cs-body-text">
          The refactoring of the design-system Design System transformed it into a scalable, intuitive, and production-ready foundation for the team. Component variants were reduced by over 90% in key areas, <strong>significantly lowering complexity</strong> while maintaining full flexibility through modular and nested approaches.
        </p>
        <p className="cs-body-text">
          By introducing colour variables and responsive foundations, manual theming and layout adjustments were largely eliminated, <strong>reducing errors and ensuring consistency</strong> across light and dark modes. Designers can now build responsive layouts using a single component across breakpoints, instead of managing multiple variants.
        </p>
        <p className="cs-body-text">
          The redesigned system architecture and improved documentation also reduced onboarding friction, <strong>enabling new designers to confidently adopt the system faster</strong>. In parallel, clearer specifications and Dev Mode usage improved design–engineering alignment, resulting in smoother handoffs and more accurate implementation.
        </p>
        <p className="cs-body-text">
          Overall, the system reduced duplication, minimised human error, and accelerated design workflows, allowing the team to deliver high-quality, consistent designs more efficiently at scale.
        </p>
      </div>
    </CaseStudyOverlay>
  )
}
