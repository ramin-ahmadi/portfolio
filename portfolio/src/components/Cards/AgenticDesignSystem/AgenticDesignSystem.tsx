import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRipple } from '../../useRipple'

// ── Card face logos ──
const LOGO_STORYBOOK = './src/assets/logos/storybook-logo.svg'
const LOGO_CLAUDE = './src/assets/logos/claude-logo.svg'
const LOGO_FIGMA = './src/assets/logos/figma-logo.svg'

// ── Hero placeholder (solid orange for fly animation) ──
const HERO_SRC = './src/assets/images/agentic-ds/agentic-ds-hero.svg'

// ── Image assets (add screenshots as you take them) ──
const IMG_TOKEN_ARCH = '/src/assets/images/agentic-ds/token-architecture.png'
const IMG_FIGMA_TOKENS = '/src/assets/images/agentic-ds/figma-tokens.png'
const IMG_STORYBOOK_DARK = '/src/assets/images/agentic-ds/storybook-dark-mode.png'
const IMG_DRIFT_AUDIT = '/src/assets/images/agentic-ds/drift-audit.png'
const IMG_CONSOLIDATION = '/src/assets/images/agentic-ds/token-consolidation.png'
const IMG_DESCRIPTIONS = '/src/assets/images/agentic-ds/component-descriptions.png'
const IMG_SECTIONS_FIGMA = '/src/assets/images/agentic-ds/figma-sections.png'
const IMG_STORYBOOK_SHOT = '/src/assets/images/agentic-ds/storybook-screenshot.png'
const STORYBOOK_URL = 'https://main--69d91a00abeffaea79b942f8.chromatic.com/?path=/story/design-tokens-colours--semantic-colours'
const PRELOAD_ONLY_ASSETS = [IMG_FIGMA_TOKENS, IMG_CONSOLIDATION]

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

/* ─────────────────────────────────────────────────────────────
   Interactive Token Layer Demo
   Shows the three-tier token architecture with expandable rows
   ───────────────────────────────────────────────────────────── */
const TOKEN_LAYERS = [
  {
    tier: 'Primitive',
    desc: 'Raw values named by hue + scale. Never used directly in components.',
    tokens: [
      { name: '--color-primitive-teal-500', value: '#008B8B', color: '#008B8B' },
      { name: '--color-primitive-purple-600', value: '#7c5cfc', color: '#7c5cfc' },
      { name: '--color-primitive-neutral-750', value: '#2c2c2c', color: '#2c2c2c' },
      { name: '--color-primitive-neutral-50', value: '#faf9f7', color: '#faf9f7' },
      { name: '--color-primitive-indigo-100', value: '#e0e0ea', color: '#e0e0ea' },
      { name: '--color-primitive-indigo-800', value: '#1a1a2e', color: '#1a1a2e' },
    ],
  },
  {
    tier: 'Semantic',
    desc: 'Intent-based aliases. Components reference these - they swap in dark mode.',
    tokens: [
      { name: '--color-text-primary', value: '→ Neutral/750', color: '#2c2c2c', dark: '→ Indigo/100', darkColor: '#e0e0ea' },
      { name: '--color-surface-card', value: '→ Neutral/50', color: '#faf9f7', dark: '→ Indigo/800', darkColor: '#1a1a2e' },
      { name: '--color-primary', value: '→ Teal/500', color: '#008B8B' },
      { name: '--gradient-brand', value: 'Teal/500 → Purple/600', color: 'linear-gradient(135deg, #008B8B, #7c5cfc)' },
    ],
  },
  {
    tier: 'Component',
    desc: 'Scoped to specific UI patterns like widgets and panels.',
    tokens: [
      { name: '--color-widget-bg', value: '→ Neutral/880', color: '#1e1e1e' },
      { name: '--color-widget-accent', value: '→ Purple/Widget', color: '#9945ff' },
      { name: '--color-panel-bg', value: '→ Neutral/0', color: '#ffffff' },
      { name: '--color-panel-focus', value: '→ Blue/Focus', color: '#589df6' },
    ],
  },
]

/* ─────────────────────────────────────────────────────────────
   Agent Workflow Demo
   Shows before/after of an agent audit with animated reveal
   ───────────────────────────────────────────────────────────── */
const AGENT_ACTIONS = [
  {
    action: 'Drift audit',
    input: 'Agent scans every CSS token against Figma variables',
    output: 'Found 35 semantic tokens in code missing from Figma',
    outcome: 'Synced - all tokens now in both files',
  },
  {
    action: 'Token consolidation',
    input: 'Text/Primary (#2c2c2c) vs Text/Body (#181818) - two near-black text tokens',
    output: 'Agent identified they served the same purpose',
    outcome: 'Text/Body aliased to Text/Primary in both code and Figma',
  },
  {
    action: 'Unused token cleanup',
    input: 'Agent grepped all 468 tokens against every component file',
    output: 'Found 9 dead tokens: Surface/Bulb On, Surface/Ceiling Mount, Gradient Start/Mid/End, plus 4 overlay tokens',
    outcome: 'Removed from tokens.css - Figma checklist generated',
  },
  {
    action: 'Font mismatch',
    input: 'Agent inspected Data/Streak text style via Figma MCP',
    output: 'Flagged: using Inter instead of Fredoka for streak counter',
    outcome: 'Corrected in Figma to match code\'s --font-family-display',
  },
]

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

function InteractiveTag({ hint, centered = false }: { hint: string; centered?: boolean }) {
  return (
    <p className={['cs-hint', centered ? 'cs-hint--centered' : ''].filter(Boolean).join(' ')}>
      <span className="cc-interactive-tag">Interactive</span>
      {hint}
    </p>
  )
}

function MagneticTokensBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const canvasEl = canvas
    const context = ctx

    let frame = 0
    let raf = 0

    function render() {
      const width = canvasEl.clientWidth || 448
      const height = canvasEl.clientHeight || 448
      const dpr = window.devicePixelRatio || 1

      if (canvasEl.width !== Math.floor(width * dpr) || canvasEl.height !== Math.floor(height * dpr)) {
        canvasEl.width = Math.floor(width * dpr)
        canvasEl.height = Math.floor(height * dpr)
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = '#d97757'
      context.fillRect(0, 0, width, height)

      const colors = ['#008B8B', '#7c5cfc', '#faf9f7', '#2c2c2c', '#e0e0ea']
      for (let i = 0; i < 38; i += 1) {
        const angle = frame * 0.008 + i * 0.72
        const radius = 38 + (i % 7) * 17
        const x = width / 2 + Math.cos(angle) * radius + Math.sin(i * 2.1) * 38
        const y = height / 2 + Math.sin(angle * 0.84) * radius + Math.cos(i * 1.7) * 34
        context.globalAlpha = 0.2 + (i % 4) * 0.07
        context.fillStyle = colors[i % colors.length]
        context.beginPath()
        context.roundRect(x - 22, y - 8, 44, 16, 8)
        context.fill()
      }

      context.globalAlpha = 1
      frame += 1
      raf = window.requestAnimationFrame(render)
    }

    render()
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="ads-card-canvas" aria-hidden="true" />
}

function TokenLayerDemo() {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(tier: string) {
    setExpanded((current) => current === tier ? null : tier)
  }

  // aria-hidden: decorative interactive demo of the token-layer system.
  // The case-study prose elsewhere describes the three-layer architecture;
  // this widget's expand/collapse rows would otherwise leak token names
  // and hex values into Safari Reader Mode and screen readers.
  return (
    <div className="ads-token-demo" aria-hidden="true">
      {TOKEN_LAYERS.map((layer) => (
        <div
          className={['ads-token-layer', expanded === layer.tier ? 'ads-token-layer--open' : ''].filter(Boolean).join(' ')}
          key={layer.tier}
        >
          <div className="ads-token-header" onClick={() => toggle(layer.tier)}>
            <div className="ads-token-tier">
              <span className="ads-token-tier-badge">{layer.tier}</span>
              <span className="ads-token-tier-desc">{layer.desc}</span>
            </div>
            <span className="ads-token-chevron">{expanded === layer.tier ? '−' : '+'}</span>
          </div>
          <div className="ads-token-rows-wrap">
            <div className="ads-token-rows">
              {layer.tokens.map((token) => (
                <div className="ads-token-row" key={token.name}>
                  <span
                    className="ads-token-swatch"
                    style={{
                      background: token.color,
                      border: token.color === '#ffffff' || token.color === '#faf9f7' ? '1px solid #e0e0e0' : 'none',
                    }}
                  />
                  <code className="ads-token-name">{token.name}</code>
                  <span className="ads-token-value">{token.value}</span>
                  {'dark' in token && token.dark ? (
                    <span className="ads-token-dark">
                      <span
                        className="ads-token-swatch ads-token-swatch--sm"
                        style={{ background: token.darkColor }}
                      />
                      {'Dark: ' + token.dark}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AgentWorkflowDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = AGENT_ACTIONS[activeIdx]

  // aria-hidden: decorative interactive demo of agent workflows. The four
  // workflow examples are summarised in the surrounding case-study prose.
  return (
    <div className="ads-workflow-demo" aria-hidden="true">
      <div className="ads-workflow-tabs">
        {AGENT_ACTIONS.map((action, index) => (
          <button
            className={['ads-workflow-tab', activeIdx === index ? 'ads-workflow-tab--active' : ''].filter(Boolean).join(' ')}
            key={action.action}
            type="button"
            onClick={() => setActiveIdx(index)}
          >
            {action.action}
          </button>
        ))}
      </div>
      <div className="ads-workflow-card-wrap">
        <div className="ads-workflow-card" key={activeIdx}>
          <div className="ads-workflow-step ads-workflow-slide" style={{ animationDelay: '0ms' }}>
            <span className="ads-workflow-label">Input</span>
            <p>{active.input}</p>
          </div>
          <div className="ads-workflow-arrow ads-workflow-slide" style={{ animationDelay: '80ms' }}>→</div>
          <div className="ads-workflow-step ads-workflow-slide" style={{ animationDelay: '160ms' }}>
            <span className="ads-workflow-label">Finding</span>
            <p>{active.output}</p>
          </div>
          <div className="ads-workflow-arrow ads-workflow-slide" style={{ animationDelay: '240ms' }}>→</div>
          <div className="ads-workflow-step ads-workflow-step--outcome ads-workflow-slide" style={{ animationDelay: '320ms' }}>
            <span className="ads-workflow-label">Outcome</span>
            <p>{active.outcome}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardFace({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <MagneticTokensBg />
      <div className="ads-card-face">
        <div className="ads-card-logos">
          <div className="ads-card-logo-wrap">
            <img src={LOGO_FIGMA} alt="Figma" className="ads-card-logo" />
          </div>
          <div className="ads-card-logo-wrap">
            <img src={LOGO_CLAUDE} alt="Claude" className="ads-card-logo ads-card-logo--claude" />
          </div>
          <div className="ads-card-logo-wrap">
            <img src={LOGO_STORYBOOK} alt="Storybook" className="ads-card-logo" />
          </div>
        </div>
        <p className="ads-card-title">Agentic{'\n'}Design{'\n'}System</p>
      </div>
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
                  <CardFace className="ads-hero-overlay" />
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

/* ─────────────────────────────────────────────────────────────
   Main case study component
   ───────────────────────────────────────────────────────────── */
export default function AgenticDesignSystem() {
  const [tldr, setTldr] = useState(false)

  useEffect(() => {
    PRELOAD_ONLY_ASSETS.forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="agentic-ds-card"
      imageSrc={HERO_SRC}
      imageClass="ads-hero-img"
      heroWrapClass="ads-hero-wrap"
      tooltip={'Building a design system\nthat AI can operate within 🤖'}
      heroSize={448}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">I didn’t use AI to build a design system. I built a design system that AI can use.</h1>

        {full(
          <p className="cs-body-text" key="intro-1">Most AI-assisted design system work follows the same pattern: a designer prompts an AI to scaffold components, generate tokens, or write documentation. The AI builds things for you. But the output is static - once generated, the system can’t maintain itself.</p>,

          <p className="cs-body-text" key="intro-2">This experiment asks a different question: what if the design system was structured so an AI agent could operate within it autonomously - auditing tokens, catching drift between Figma and code, consolidating redundancy, and keeping both sides in sync?</p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">As Design System Champion at Bauer Media Group, I’m always looking for ways to make our system more maintainable. Rather than experimenting directly in a production codebase, I used my portfolio’s design system as a proving ground - a real system with real complexity, where I could validate the approach before bringing it into my workflow at work.</p>

        <h2 className="cs-section-title">Stack</h2>
        <p className="cs-body-text">Vue 3, CSS Custom Properties, Figma, Storybook 10, Figma MCP</p>

        {full(
          <h2 className="cs-section-title" key="hypothesis-heading">The hypothesis</h2>,

          <p className="cs-body-text" key="hypothesis-1">Vallaure’s framework for agentic design systems identifies six structural requirements: a variables architecture, property alignment, complete state design, slots, auto-layout with semantic naming, and Code Connect. The core insight is that a design system is no longer documentation for developers - it’s instructions for a machine.</p>,

          <p className="cs-body-text" key="hypothesis-2">I wanted to test this with a real system. Not a demo with two buttons and a colour palette, but the actual design system powering this portfolio - with 468 tokens, 23 components, dark mode theming, and two canonical Figma files that needed to stay in sync with the codebase.</p>,

          <p className="cs-body-text" key="hypothesis-3">The hypothesis: if the token architecture is semantically layered, the component descriptions are machine-readable, and the Figma structure mirrors the code structure, then an agent should be able to perform design system maintenance tasks that currently require a human designer.</p>,
        )}

        <h2 className="cs-section-title">Token architecture</h2>

        {full(
          <p className="cs-body-text" key="token-1">The foundation is a three-layer token system. Primitive tokens hold raw values - hex colours, pixel sizes, font stacks. Semantic tokens alias primitives by intent: --color-text-primary, --color-surface-card. Component tokens scope to specific UI patterns like the Figma-style widget chrome or Storybook panel.</p>,

          <p className="cs-body-text" key="token-2">This layering is what makes the system machine-readable. When an agent encounters --color-text-primary, it doesn’t need to understand colour theory - it just needs to follow the chain: semantic → primitive → raw value. Dark mode works the same way: the semantic layer swaps which primitives it points to, and every component updates automatically.</p>,
        )}

        <TokenLayerDemo />
        <InteractiveTag hint="Explore the three token layers" centered />

        {full(
          <p className="cs-body-text" key="token-3">Every token in code has a corresponding entry in the Figma Design Tokens file. The primitives are documented as raw swatches. The semantic aliases show which primitive they reference with an arrow notation (→ Neutral/750). This means an agent reading the Figma file via MCP gets the same information as an agent reading tokens.css - the mapping is explicit, not implicit.</p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_TOKEN_ARCH} alt="Three-layer token architecture diagram" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Dark mode as proof</h2>

        {full(
          <p className="cs-body-text" key="dark-1">Dark mode isn’t just a feature - it’s the simplest proof that the token architecture works. If every component references semantic tokens, and the semantic layer swaps its primitive bindings under [data-theme=&quot;dark&quot;], then dark mode is automatic. No component needs to know it’s in dark mode.</p>,

          <p className="cs-body-text" key="dark-2">This was validated in Storybook 10, where a background toggle sets the data-theme attribute and every component responds through CSS custom properties. The agent was able to identify components that weren’t responding (BentoCard labels and Icon names had hardcoded text colours) and fix them by adding var(--color-text-primary) references.</p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_STORYBOOK_DARK} alt="Storybook showing light and dark mode toggle" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Component descriptions</h2>

        {full(
          <p className="cs-body-text" key="desc-1">The Figma MCP reads component descriptions and passes them to the agent as context. This is the bridge between design and code. Each of the 23 components has a description that documents: what it renders, which tokens it uses, what props it accepts, what states it has, and how it behaves on interaction.</p>,

          <p className="cs-body-text" key="desc-2">These descriptions aren’t written for humans browsing Figma - they’re written for an agent that needs to decide which component to use, what tokens to reference, and how the component will behave. It’s the difference between “A card component” and “Base card wrapper. Uses --color-surface-card background, --color-border-card border, --color-shadow-card-* elevation. Click spawns a ripple at --color-card-ripple. Accepts dark boolean prop for --color-surface-card-dark variant.”</p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_DESCRIPTIONS} alt="Component descriptions in Figma" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Agent workflows</h2>

        {full(
          <p className="cs-body-text" key="workflow-1">With the system structured, I tested four autonomous agent workflows - tasks a human designer would normally do manually. Each one succeeded because the agent could read the token architecture, cross-reference Figma and code, and make decisions based on semantic naming.</p>,
        )}

        <AgentWorkflowDemo />
        <InteractiveTag hint="Click each workflow to see the full loop" centered />

        {full(
          <p className="cs-body-text" key="workflow-2">The critical insight from these workflows: the agent wasn’t following a script. For the drift audit, it decided to grep every token against every component, identified which ones were unused, cross-referenced the Figma file, and produced a Figma cleanup checklist - all from a single prompt asking it to “check if code and Figma are in sync.” The system’s structure gave the agent enough context to make judgment calls.</p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_DRIFT_AUDIT} alt="Agent drift audit output showing code vs Figma comparison" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Figma as source of truth</h2>

        {full(
          <p className="cs-body-text" key="figma-1">The system uses two canonical Figma files. The Design Tokens file holds every variable, text style, and colour swatch - organised into Primitive and Semantic sections that mirror the CSS custom property structure. The Design System file holds all 23 components organised in Figma sections, each with descriptions the MCP can read.</p>,

          <p className="cs-body-text" key="figma-2">This separation matters for agents. When the agent needs to audit token coverage, it reads the Tokens file. When it needs to understand a component’s API, it reads the Design System file. The agent knows which file to query because the architecture is explicit - not a single monolithic file where everything is mixed together.</p>,
        )}
      </div>

      <img className="cs-cover-img" src={IMG_SECTIONS_FIGMA} alt="Figma sections layout showing organised components" />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Results</h2>

        <div className="ads-results">
          <div className="ads-result-card">
            <span className="ads-result-number">468</span>
            <span className="ads-result-label">Tokens synced between code and Figma</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">23</span>
            <span className="ads-result-label">Components with machine-readable descriptions</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">9</span>
            <span className="ads-result-label">Unused tokens found and removed by agent</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">4</span>
            <span className="ads-result-label">Autonomous agent workflows validated</span>
          </div>
        </div>

        <h2 className="cs-section-title">What I learned</h2>

        <p className="cs-body-text">
          The biggest lesson: <strong>quality becomes measurable</strong>. When every token has a semantic name, every component has a description, and every Figma variable maps to a CSS custom property, an agent can audit the entire system and tell you exactly where the gaps are. “Design system health” stops being a feeling and starts being a number.
        </p>

        <p className="cs-body-text">
          The limitation I hit was Code Connect - Figma’s official mapping between components and code files requires an Organisation plan. But the <strong>component descriptions</strong> effectively serve the same purpose for an agent: they document the file path, props, tokens, and behaviour. The system works without the enterprise tooling.
        </p>

        {full(
          <p className="cs-body-text" key="learned-1">
            The risk Vallaure warns about is real: fast generic systems produce forgettable output. An agent assembling from a poorly crafted design system will produce bland interfaces. But an agent operating within a system that has visual intentionality - deliberate colour choices, considered typography scales, opinionated spacing - produces output that looks designed. The craft isn’t in the assembly. It’s in the <strong>vocabulary the agent assembles from</strong>.
          </p>,

          <p className="cs-closing" key="closing">The design system is no longer just documentation for developers. It’s instructions for a machine. And the designer’s job is to make those instructions worth following.</p>,
        )}
      </div>

      <a
        className="ads-browser-window cs-cover-img cs-cover-img--full"
        href={STORYBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="ads-browser-bar">
          <div className="ads-browser-dots">
            <span className="ads-browser-dot ads-browser-dot--red" />
            <span className="ads-browser-dot ads-browser-dot--yellow" />
            <span className="ads-browser-dot ads-browser-dot--green" />
          </div>
          <div className="ads-browser-address">chromatic.com</div>
        </div>
        <div className="ads-browser-viewport">
          <img src={IMG_STORYBOOK_SHOT} alt="Storybook design tokens page" className="ads-browser-img" />
          <div className="ads-browser-overlay">
            <span className="ads-browser-cta">
              View in Storybook
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ads-browser-icon">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </CaseStudyOverlay>
  )
}
