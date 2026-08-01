import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRipple } from '../../useRipple'
import './Libra.scss'

// ── Assets ──
const LOGO_SRC = '/src/assets/images/libra/libra-logo.avif'
const HERO_SRC = '/src/assets/images/layerlint-hero.svg'
const IMG_CLEANUP = '/src/assets/images/layerlint/ll-cleanup.svg'
const IMG_RENAME = '/src/assets/images/layerlint/ll-rename.svg'
const IMG_SETTINGS = '/src/assets/images/layerlint/ll-settings.svg'
const IMG_COVER = '/src/assets/images/layerlint/ll-cover.svg'

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

const TYPE_ICONS: Record<string, string> = {
  frame: '#',
  rect: '▬',
  group: '◇',
  vector: '✦',
  ellipse: '○',
  text: 'T',
  line: '—',
}

type PanelLayer = {
  name: string
  type: string
  indent: number
  hidden: boolean
}

function LayerLintBackgroundVideo() {
  return (
    <div className="ll-bg-wrap" aria-hidden="true">
      <iframe
        className="ll-bg-video"
        src="https://player.vimeo.com/video/1214782978?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&dnt=1"
        title=""
        allow="autoplay; fullscreen"
        tabIndex={-1}
      />
    </div>
  )
}

const BEFORE_LAYERS: PanelLayer[] = [
  { name: 'Frame 114', type: 'frame', indent: 0, hidden: false },
  { name: 'Rectangle 47', type: 'rect', indent: 1, hidden: false },
  { name: 'Group 12', type: 'group', indent: 1, hidden: false },
  { name: 'Vector 2', type: 'vector', indent: 2, hidden: true },
  { name: 'Ellipse 9', type: 'ellipse', indent: 2, hidden: false },
  { name: 'Frame 3', type: 'frame', indent: 2, hidden: false },
  { name: 'Rectangle 8', type: 'rect', indent: 3, hidden: true },
  { name: 'Text', type: 'text', indent: 3, hidden: false },
  { name: 'Group 5', type: 'group', indent: 1, hidden: true },
  { name: 'Line 4', type: 'line', indent: 1, hidden: false },
  { name: 'Rectangle 19', type: 'rect', indent: 1, hidden: false },
]

const AFTER_LAYERS: PanelLayer[] = [
  { name: 'product-card', type: 'frame', indent: 0, hidden: false },
  { name: 'card-image', type: 'rect', indent: 1, hidden: false },
  { name: 'card-content', type: 'group', indent: 1, hidden: false },
  { name: 'product-icon', type: 'ellipse', indent: 2, hidden: false },
  { name: 'info-row', type: 'frame', indent: 2, hidden: false },
  { name: 'product-label', type: 'text', indent: 3, hidden: false },
  { name: 'divider', type: 'line', indent: 1, hidden: false },
  { name: 'price-tag', type: 'rect', indent: 1, hidden: false },
]

function BeforeAfterToggle() {
  const [showAfter, setShowAfter] = useState(false)

  function renderPanel(layers: PanelLayer[], label: string) {
    return (
      <div className="ll-panel">
        <div className="ll-panel-bar">
          <span className="ll-panel-title">Layers</span>
          <span className="ll-panel-badge">{label}</span>
        </div>
        <div className="ll-panel-list">
          {layers.map((layer, i) => (
            <div
              key={`${layer.name}-${i}`}
              className={['ll-panel-row', layer.hidden ? 'll-panel-row--hidden' : ''].filter(Boolean).join(' ')}
              style={{ paddingLeft: `${12 + layer.indent * 16}px` }}
            >
              <span className="ll-panel-icon">{TYPE_ICONS[layer.type] || '#'}</span>
              <span className="ll-panel-name">{layer.name}</span>
              {layer.hidden ? <span className="ll-panel-hidden-tag">👁</span> : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="ll-before-after">
      <div className="ll-toggle-bar">
        <button
          className={['ll-toggle-btn', !showAfter ? 'll-toggle-btn--active' : ''].filter(Boolean).join(' ')}
          type="button"
          onClick={() => setShowAfter(false)}
        >
          Before
        </button>
        <button
          className={['ll-toggle-btn', showAfter ? 'll-toggle-btn--active' : ''].filter(Boolean).join(' ')}
          type="button"
          onClick={() => setShowAfter(true)}
        >
          After
        </button>
      </div>
      <div className="ll-panels-wrap" aria-hidden="true">
        <div className={['ll-panels-track', showAfter ? 'll-panels-track--after' : ''].filter(Boolean).join(' ')}>
          {renderPanel(BEFORE_LAYERS, 'Raw Figma')}
          {renderPanel(AFTER_LAYERS, 'After Layer Lint')}
        </div>
      </div>
    </div>
  )
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
  return (
    <p className="cs-hint">
      <span className="cc-interactive-tag">Interactive</span>
      {hint}
    </p>
  )
}

function CardFace({ className = '' }: { className?: string }) {
  return (
    <div className={['ll-card-face', className].filter(Boolean).join(' ')}>
      <img src={LOGO_SRC} alt="Layer Lint" className="ll-card-logo" />
      <p className="ll-card-title">Libra{'\n'}Website Redesign</p>
    </div>
  )
}

function CaseStudyOverlay({
  cardClass,
  imageSrc,
  imageClass,
  heroWrapClass,
  tooltip,
  heroSize,
  children,
}: {
  cardClass: string
  imageSrc: string
  imageClass: string
  heroWrapClass: string
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
        <img src={imageSrc} className={imageClass} alt="" aria-hidden="true" />
        <LayerLintBackgroundVideo />
        <CardFace />
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
                <div
                  className={heroWrapClass}
                  style={{
                    width: `${heroSize}px`,
                    height: `${heroSize}px`,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <img src={imageSrc} className={imageClass} alt="" aria-hidden="true" />
                  <div className="ll-hero-overlay">
                    <LayerLintBackgroundVideo />
                    <CardFace />
                  </div>
                </div>
                {children}
              </div>
            </div>

            <button
              className={['cs-back-to-top', showBackToTop ? 'cs-back-to-top--visible' : ''].filter(Boolean).join(' ')}
              type="button"
              aria-label="Back to top"
              onClick={() => innerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
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

            {renderRipples()}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function Libra() {
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="ll-card"
      imageSrc={HERO_SRC}
      imageClass="ll-hero-img"
      heroWrapClass="ll-hero-wrap"
      tooltip={"Behind the Scenes of LoveLibra's\nUser-Centric Makeover🖌️"}
      heroSize={448}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">Your layers are the prompt. Make sure they’re worth reading.</h1>

        {full(
          <p className="cs-body-text" key="intro-1">
            Every time an AI coding agent reads a Figma file, it encounters your layer names. "Rectangle 47" tells it nothing. "product-card" gives it meaningful context. The gap between those two names is the gap between an agent that guesses and one that builds closer to what you designed.
          </p>,
          <p className="cs-body-text" key="intro-2">
            Layer Lint is a Figma plugin I built to close that gap between design files and AI agents. It scans your files for hidden and empty layers cluttering the panel, then uses Claude to batch-rename auto-generated names into semantic, developer-friendly ones - optimised for both AI agents and the humans who review their output.
          </p>,
          <p className="cs-body-text" key="intro-3">
            It’s live on the Figma Community -{' '}
            <a
              className="cs-link"
              role="link"
              tabIndex={0}
              onClick={() => window.open('https://www.figma.com/community/plugin/1626564985947649735/layer-lint', '_blank')}
            >
              install Layer Lint
            </a>
            .
          </p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">Side project - design & development</p>

        <h2 className="cs-section-title">Impact</h2>

        <h3 className="cs-subsection-title">🧹 One-Click Layer Cleanup</h3>
        {full(
          <p className="cs-body-text" key="impact-1">
            Scans the current page and flags every hidden subtree and invisible shape - the forgotten artifacts that accumulate in any working Figma file. Select all or pick individually, then remove them in a single action.
          </p>,
        )}

        <h3 className="cs-subsection-title">🤖 AI-Powered Semantic Renaming</h3>
        {full(
          <p className="cs-body-text" key="impact-2">
            Claude reads each layer’s type, text content, layout direction, children, and - for visually complex nodes - an exported PNG. It proposes kebab-case names that describe purpose, not appearance. Every suggestion is reviewable: edit, accept, or skip individually before applying.
          </p>,
        )}

        <h3 className="cs-subsection-title">🛡️ Instance-Safe by Design</h3>
        {full(
          <p className="cs-body-text" key="impact-3">
            The plugin never walks into or modifies content inside component instances. Instance contents belong to their main component - renaming them locally would create overrides that break on the next component update. Layer Lint respects that boundary automatically.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_COVER} alt="Layer Lint plugin interface showing cleanup and rename tabs" />
      <p className="cs-hint">Cleanup and rename - the two tabs of Layer Lint</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Problem</h2>
        <p className="cs-body-text">
          Figma auto-generates layer names like "Rectangle 47", "Frame 3", and "Group 12". For a designer working visually, these names are harmless - you can see what each layer is on the canvas. But for anything reading the file programmatically - an AI coding agent, a design-to-code tool, a developer in Dev Mode - those names are noise. They carry zero semantic information.
        </p>

        <p className="cs-body-text">
          On top of that, working Figma files accumulate hidden layers, empty shapes, and forgotten artifacts. These don’t affect the visual output, but they bloat the layer panel, slow down file loading, and confuse any tool or agent trying to parse the file’s structure. The problem compounds at scale: the more complex the file, the harder it is to maintain manually.
        </p>
      </div>

      <BeforeAfterToggle />
      <InteractiveTag hint="Toggle between the raw and cleaned layer panel" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Cleanup: finding what’s invisible</h2>
        {full(
          <p className="cs-body-text" key="cleanup-1">
            The cleanup scan walks the page tree and flags two types of node: hidden subtrees (where only the root needs removing) and leaf shapes with no visible fill, stroke, or effect - visually indistinguishable from hidden layers but technically still "visible" in Figma’s model. Mixed fills are treated as intentional. The scan never enters component instances.
          </p>,
          <p className="cs-body-text" key="cleanup-2">
            Results appear as a checklist with each layer’s name, type, and reason (hidden or empty). Clicking a row zooms to the node on the canvas. Select all or cherry-pick, then remove.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_CLEANUP} alt="Layer Lint cleanup tab showing flagged hidden and empty layers" />
      <p className="cs-hint">Cleanup results with hidden and empty layer badges</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Rename: giving layers meaning</h2>
        {full(
          <p className="cs-body-text" key="rename-1">
            The rename flow collects context for each candidate layer: its type, dimensions, parent path, up to 10 children, layout direction, fill classification, and for text nodes (the first 200 characters of content.) For visually complex nodes (vectors, images) above a minimum size, it also exports a 1x PNG so Claude can see what the layer actually looks like.
          </p>,
          <p className="cs-body-text" key="rename-2">
            Candidates are batched to stay within API limits - 50 text-only layers per request, 10 visual layers. Claude is instructed via a constrained tool-use pattern: it must call a submit_names tool with exactly one kebab-case name per layer ID. The plugin deduplicates sibling names automatically (appending -2, -3 if needed) and sanitises every response to enforce the naming convention.
          </p>,
          <p className="cs-body-text" key="rename-3">
            Two scope modes let the designer choose: rename only default-named layers (the "Rectangle 47" pattern) or all layers including manually named ones. The results appear in a side-by-side list where every proposal is editable before applying.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_RENAME} alt="Layer Lint rename tab showing AI-proposed names alongside originals" />
      <p className="cs-hint">Side-by-side rename review - edit any suggestion before applying</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Model selection and cost transparency</h2>
        {full(
          <p className="cs-body-text" key="model-1">
            The settings panel lets designers choose between Haiku (fast and cheap - the default), Sonnet (balanced), or Opus (highest quality). Haiku handles most files well. Sonnet or Opus are worth switching to for dense layouts or when Haiku is overloaded. The plugin tracks input and output token usage per session and displays it after each rename run, so designers always know what a batch cost.
          </p>,
          <p className="cs-body-text" key="model-2">
            Transient errors (rate limits, overload, server errors) are retried automatically with exponential backoff - up to three attempts with clear status messages between each retry so the designer knows the plugin isn’t stuck.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_SETTINGS} alt="Layer Lint settings panel showing model selector and API key management" />
      <p className="cs-hint">BYOK settings with model selection and cost tracking</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">The other side of the agentic equation</h2>
        {full(
          <p className="cs-body-text" key="agentic-1">
            In the{' '}
            <a
              className="cs-link"
              role="link"
              tabIndex={0}
              onClick={() => window.open('#agenticds', '_blank')}
            >
              Agentic Design System
            </a>{' '}
            case study, I structured a design system so AI agents could operate within it - auditing tokens, catching drift, keeping Figma and code in sync. That work assumed the Figma files were already well-structured. Layer Lint tackles the prerequisite: making sure the raw design files are readable by machines in the first place.
          </p>,
          <p className="cs-body-text" key="agentic-2">
            Together they form two halves of the same thesis. A semantically named layer tree means an AI agent reading the file via Figma MCP gets meaningful context instead of "Frame 3 contains Rectangle 47". And a well-structured design system means the agent knows what those layers should be called, what tokens they should reference, and how they relate to code. Layer Lint is the cleanup. The agentic DS is the vocabulary.
          </p>,
        )}

        <h2 className="cs-section-title">What I took away</h2>

        <p className="cs-body-text">
          The biggest insight was that <strong>layer names are an interface</strong>. Not only for humans to navigate visually. But for every machine that reads the file: AI coding agents, design-to-code tools, accessibility audits, automated testing. A layer called "user-avatar" is a contract. A layer called "Ellipse 9" is a guessing game.
        </p>

        {full(
          <p className="cs-body-text" key="closing-1">
            Layer Lint came out of preparing our production Figma files at work for an agentic design system. As I started cleaning up, I discovered just how many dead layers and default names had accumulated. Hidden groups, unnamed rectangles, orphaned vectors everywhere. Renaming them one by one was <strong>time-consuming and mentally draining</strong>. I needed a way to semi-automate the process, so I built one. What started as solving my own frustration became something broader: as AI agents become a bigger part of the design-to-code pipeline, the quality of what they build depends on the quality of what they read. Clean layers aren’t housekeeping - they’re infrastructure.
          </p>,
        )}
      </div>
    </CaseStudyOverlay>
  )
}
