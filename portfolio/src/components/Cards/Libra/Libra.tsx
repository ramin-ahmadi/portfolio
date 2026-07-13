import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRipple } from '../../useRipple'

// ── Assets ──
const LOGO_SRC = '/src/assets/images/layerlint-logo.svg'
const HERO_SRC = '/src/assets/images/layerlint-hero.svg'
const IMG_CLEANUP = '/src/assets/images/layerlint/ll-cleanup.svg'
const IMG_RENAME = '/src/assets/images/layerlint/ll-rename.svg'
const IMG_SETTINGS = '/src/assets/images/layerlint/ll-settings.svg'
const IMG_COVER = '/src/assets/images/layerlint/ll-cover.svg'

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

// SVG paths for eye icons (16×16 viewBox)
const EYE_OPEN = 'M8 3C3.6 3 .5 8 .5 8s3.1 5 7.5 5 7.5-5 7.5-5S12.4 3 8 3Zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'
const EYE_CLOSED = 'M13.36 3.35 2.65 14.06l.7.7 2.2-2.2A7.7 7.7 0 0 0 8 13c4.4 0 7.5-5 7.5-5a13 13 0 0 0-2.84-3.35l2.4-2.4-.7-.7ZM8 4.5c-.47 0-.93.06-1.37.16L8.2 6.24A2 2 0 0 1 9.76 7.8l1.58 1.57A3.5 3.5 0 0 0 8 4.5ZM.5 8s3.1 5 7.5 5c.67 0 1.32-.1 1.94-.3L8.2 10.96A3.5 3.5 0 0 1 4.54 7.3L2.84 5.62A13 13 0 0 0 .5 8Z'

const TYPE_ICONS: Record<string, string> = {
  frame: '#',
  rect: '▬',
  group: '◇',
  vector: '✦',
  ellipse: '○',
  text: 'T',
  line: '—',
}

type Layer = {
  name: string
  semantic: string | null
  type: string
  hidden: boolean
}

type BgRow = Layer & {
  _idx: number
  display: string
  visible: boolean
  wiping: boolean
  gapShift: number
  gapDelay: number
  renamed: boolean
  showCursor: boolean
}

type PanelLayer = {
  name: string
  type: string
  indent: number
  hidden: boolean
}

const BATCHES: Layer[][] = [
  [
    { name: 'Frame 114', semantic: 'product-card', type: 'frame', hidden: false },
    { name: 'Rectangle 47', semantic: 'card-image', type: 'rect', hidden: false },
    { name: 'Group 12', semantic: 'card-content', type: 'group', hidden: false },
    { name: 'Vector 2', semantic: null, type: 'vector', hidden: true },
    { name: 'Ellipse 9', semantic: 'product-icon', type: 'ellipse', hidden: false },
    { name: 'Frame 3', semantic: 'info-row', type: 'frame', hidden: false },
    { name: 'Rectangle 8', semantic: null, type: 'rect', hidden: true },
    { name: 'Text', semantic: 'product-label', type: 'text', hidden: false },
    { name: 'Group 5', semantic: null, type: 'group', hidden: true },
    { name: 'Line 4', semantic: 'divider', type: 'line', hidden: false },
  ],
  [
    { name: 'Frame 22', semantic: 'nav-header', type: 'frame', hidden: false },
    { name: 'Rectangle 19', semantic: 'search-input', type: 'rect', hidden: false },
    { name: 'Ellipse 1', semantic: null, type: 'ellipse', hidden: true },
    { name: 'Group 88', semantic: 'menu-list', type: 'group', hidden: false },
    { name: 'Frame 7', semantic: 'menu-item', type: 'frame', hidden: false },
    { name: 'Vector', semantic: null, type: 'vector', hidden: true },
    { name: 'Rectangle 3', semantic: 'avatar-circle', type: 'rect', hidden: false },
    { name: 'Text', semantic: 'username-label', type: 'text', hidden: false },
    { name: 'Line 9', semantic: null, type: 'line', hidden: true },
    { name: 'Component 3', semantic: 'logout-button', type: 'frame', hidden: false },
  ],
  [
    { name: 'Frame 51', semantic: 'hero-section', type: 'frame', hidden: false },
    { name: 'Rectangle 2', semantic: 'hero-image', type: 'rect', hidden: false },
    { name: 'Group 4', semantic: 'cta-group', type: 'group', hidden: false },
    { name: 'Frame 88', semantic: null, type: 'frame', hidden: true },
    { name: 'Text', semantic: 'headline-text', type: 'text', hidden: false },
    { name: 'Ellipse 5', semantic: 'play-button', type: 'ellipse', hidden: false },
    { name: 'Vector 7', semantic: null, type: 'vector', hidden: true },
    { name: 'Rectangle 31', semantic: 'overlay-bg', type: 'rect', hidden: false },
    { name: 'Frame 9', semantic: 'badge-row', type: 'frame', hidden: false },
    { name: 'Group 14', semantic: null, type: 'group', hidden: true },
  ],
]

const ROW_SLOT = 29
const T_REVEAL_STAGGER = 40
const T_PAUSE_AFTER_REVEAL = 1800
const T_REMOVE_STAGGER = 100
const T_PAUSE_AFTER_REMOVE = 600
const T_ERASE_PER_CHAR = 32
const T_ERASE_STAGGER = 120
const T_PAUSE_AFTER_ERASE = 300
const T_WRITE_PER_CHAR = 28
const T_WRITE_STAGGER = 80
const T_PAUSE_AFTER_WRITE = 2000
const T_SCROLL_DURATION = 800

function fillHeight(batch: Layer[], height: number) {
  const visibleInBatch = batch.filter((layer) => !layer.hidden).length
  const totalInBatch = batch.length
  const visibleNeeded = Math.ceil(height / ROW_SLOT) + 2
  const totalNeeded = Math.ceil(visibleNeeded * totalInBatch / visibleInBatch)

  return Array.from({ length: totalNeeded }, (_, i) => ({
    ...batch[i % batch.length],
    _idx: i,
  }))
}

function FloatingLayersBg() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const curPanelRef = useRef<HTMLDivElement | null>(null)
  const currentRowsRef = useRef<BgRow[]>([])
  const nextRowsRef = useRef<BgRow[]>([])
  const batchIdxRef = useRef(0)
  const containerHRef = useRef(500)
  const timersRef = useRef<number[]>([])
  const destroyedRef = useRef(false)

  const [currentRows, setCurrentRows] = useState<BgRow[]>([])
  const [nextRows, setNextRows] = useState<BgRow[]>([])
  const [scrollOffset, setScrollOffset] = useState(0)
  const [scrollTransition, setScrollTransition] = useState(false)

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      if (!destroyedRef.current) fn()
    }, ms)
    timersRef.current.push(id)
    return id
  }

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  function getBatch(idx: number) {
    return BATCHES[idx % BATCHES.length]
  }

  function buildRows(batch: Layer[]) {
    return fillHeight(batch, containerHRef.current).map((layer) => ({
      ...layer,
      display: layer.name,
      visible: false,
      wiping: false,
      gapShift: 0,
      gapDelay: 0,
      renamed: false,
      showCursor: false,
    }))
  }

  function commitCurrent(rows = currentRowsRef.current) {
    currentRowsRef.current = rows
    setCurrentRows([...rows])
  }

  function commitNext(rows = nextRowsRef.current) {
    nextRowsRef.current = rows
    setNextRows([...rows])
  }

  function mutateCurrent(index: number, patch: Partial<BgRow>) {
    const rows = currentRowsRef.current
    rows[index] = { ...rows[index], ...patch }
    commitCurrent(rows)
  }

  function startScroll() {
    const nextRowsVisible = nextRowsRef.current.map((row) => ({ ...row, visible: true }))
    commitNext(nextRowsVisible)

    const panelH = curPanelRef.current ? curPanelRef.current.offsetHeight : containerHRef.current
    setScrollTransition(true)
    setScrollOffset(panelH)

    schedule(() => {
      batchIdxRef.current += 1
      setScrollTransition(false)
      setScrollOffset(0)

      commitCurrent(nextRowsRef.current)
      const upcomingBatch = getBatch(batchIdxRef.current + 1)
      commitNext(buildRows(upcomingBatch).map((row) => ({ ...row, visible: true })))
      schedule(startCleanup, T_PAUSE_AFTER_REVEAL)
    }, T_SCROLL_DURATION + 50)
  }

  function startWrite() {
    const visible = currentRowsRef.current
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !row.hidden && row.semantic)

    visible.forEach(({ row, index }, i) => {
      const target = row.semantic || ''
      const len = target.length

      schedule(() => {
        mutateCurrent(index, { renamed: true })
        for (let c = 0; c <= len; c += 1) {
          schedule(() => mutateCurrent(index, { display: target.slice(0, c) }), c * T_WRITE_PER_CHAR)
        }
        schedule(() => mutateCurrent(index, { showCursor: false }), len * T_WRITE_PER_CHAR)
      }, i * T_WRITE_STAGGER)
    })

    const longestSemantic = Math.max(...visible.map(({ row }) => (row.semantic || '').length))
    const totalWrite = (visible.length - 1) * T_WRITE_STAGGER + longestSemantic * T_WRITE_PER_CHAR
    schedule(startScroll, totalWrite + T_PAUSE_AFTER_WRITE)
  }

  function startErase() {
    const visible = currentRowsRef.current
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !row.hidden && row.semantic)

    visible.forEach(({ row, index }, i) => {
      const fullName = row.name
      const len = fullName.length

      schedule(() => {
        mutateCurrent(index, { showCursor: true })
        for (let c = 0; c < len; c += 1) {
          schedule(() => mutateCurrent(index, { display: fullName.slice(0, len - 1 - c) }), c * T_ERASE_PER_CHAR)
        }
        schedule(() => mutateCurrent(index, { display: '' }), len * T_ERASE_PER_CHAR)
      }, i * T_ERASE_STAGGER)
    })

    const longestName = Math.max(...visible.map(({ row }) => row.name.length))
    const totalErase = (visible.length - 1) * T_ERASE_STAGGER + longestName * T_ERASE_PER_CHAR
    schedule(startWrite, totalErase + T_PAUSE_AFTER_ERASE)
  }

  function startCleanup() {
    const rows = currentRowsRef.current
    const hidden = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.hidden)

    if (hidden.length === 0) {
      schedule(startErase, T_PAUSE_AFTER_REMOVE)
      return
    }

    hidden.forEach(({ index }, i) => {
      schedule(() => mutateCurrent(index, { wiping: true }), i * T_REMOVE_STAGGER)
    })

    const allWipesDone = (hidden.length - 1) * T_REMOVE_STAGGER + 450

    schedule(() => {
      const hiddenSet = new Set(hidden.map(({ index }) => index))
      let gapsAbove = 0
      let lastGapIdx = -Infinity

      const shiftedRows = currentRowsRef.current.map((row, i) => {
        if (hiddenSet.has(i)) {
          gapsAbove += 1
          lastGapIdx = i
          return row
        }

        if (gapsAbove > 0) {
          const distFromGap = i - lastGapIdx
          return {
            ...row,
            gapShift: gapsAbove * ROW_SLOT,
            gapDelay: Math.min((distFromGap - 1) * 30, 200),
          }
        }

        return row
      })

      commitCurrent(shiftedRows)
    }, allWipesDone + 150)

    const gapCloseTime = allWipesDone + 150 + 200 + 700
    schedule(startErase, gapCloseTime + T_PAUSE_AFTER_REMOVE)
  }

  function startCycle() {
    if (wrapRef.current) {
      containerHRef.current = wrapRef.current.getBoundingClientRect().height
    }

    const batch = getBatch(batchIdxRef.current)
    const current = buildRows(batch)
    commitCurrent(current)
    setScrollOffset(0)
    setScrollTransition(false)

    const nextBatch = getBatch(batchIdxRef.current + 1)
    commitNext(buildRows(nextBatch))

    current.forEach((_, i) => {
      schedule(() => mutateCurrent(i, { visible: true }), i * T_REVEAL_STAGGER)
    })

    const totalReveal = current.length * T_REVEAL_STAGGER
    schedule(startCleanup, totalReveal + T_PAUSE_AFTER_REVEAL)
  }

  useEffect(() => {
    startCycle()

    return () => {
      destroyedRef.current = true
      clearTimers()
    }
  }, [])

  function renderPanel(panelRows: BgRow[], keyPrefix: string, panelRef?: React.RefObject<HTMLDivElement | null>) {
    return (
      <div className="ll-bg-panel" ref={panelRef || null}>
        {panelRows.map((row) => {
          const style: CSSProperties = {}
          if (row.gapShift > 0) {
            style.transform = `translateY(-${row.gapShift}px)`
            style.transition = 'transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)'
            style.transitionDelay = `${row.gapDelay}ms`
          }

          return (
            <div
              key={`${keyPrefix}-${row._idx}-${row.name}`}
              className={[
                'll-bg-row',
                row.visible ? 'll-bg-row--visible' : '',
                row.hidden ? 'll-bg-row--hidden' : '',
                row.wiping ? 'll-bg-row--wiping' : '',
                row.renamed ? 'll-bg-row--renamed' : '',
              ].filter(Boolean).join(' ')}
              style={style}
            >
              <span className="ll-bg-icon">{TYPE_ICONS[row.type] || '#'}</span>
              <span className="ll-bg-name">
                {row.display}
                {row.showCursor ? <span className="ll-bg-cursor" /> : null}
              </span>
              <span className="ll-bg-eye">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className={row.hidden ? 'll-bg-eye--closed' : ''}
                >
                  <path d={row.hidden ? EYE_CLOSED : EYE_OPEN} />
                </svg>
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="ll-bg-wrap" ref={wrapRef} aria-hidden="true">
      <div
        className="ll-bg-track"
        style={{
          transform: `translateY(-${scrollOffset}px)`,
          transition: scrollTransition
            ? `transform ${T_SCROLL_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none',
        }}
      >
        {renderPanel(currentRows, `cur-${batchIdxRef.current}`, curPanelRef)}
        {renderPanel(nextRows, `nxt-${batchIdxRef.current + 1}`)}
      </div>
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
      <p className="ll-card-title">Libra{'\n'}Project</p>
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
        <FloatingLayersBg />
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
                    <FloatingLayersBg />
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
              ↑
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
      tooltip={'Clean your Figma layers\nso AI agents can read them 🧹'}
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
