import {
  Fragment,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import { useRipple } from '../../useRipple'
import './Rebrand.scss'

const PRIMARY_BUTTON_CODE = `export function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="button button--primary"
      {...props}
    >
      {children}
    </button>
  );
}`

const BUTTON_TOKEN_CSS = `--color-button-primary-background-light: var(--color-primary-500);
--color-button-primary-background-dark: var(--color-indigo-500);`

function HighlightedCode({ code, language = 'javascript' }: { code: string; language?: 'css' | 'javascript' | 'jsx' }) {
  const grammar = Prism.languages[language]
  const highlightedCode = Prism.highlight(code, grammar, language)

  return (
    <pre className={`ads-code__content language-${language}`}>
      <code
        className={`language-${language}`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  )
}

// ── Card face logos ──
const LOGO_STORYBOOK = './src/assets/logos/storybook-logo.svg'
const LOGO_CLAUDE = './src/assets/logos/claude-logo.svg'
const LOGO_FIGMA = './src/assets/logos/figma-logo.svg'

// ── Hero placeholder (solid orange for fly animation) ──
const HERO_SRC = './src/assets/images/agentic-ds/agentic-ds-hero.svg'

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

/* ─────────────────────────────────────────────────────────────
   Interactive Token Layer Demo
   Shows the three-tier token architecture with expandable rows
   ───────────────────────────────────────────────────────────── */
const TOKEN_LAYERS = [
  {
    tier: 'Primitive tokens',
    desc: 'Hex colour values structured as  colour name + scale.',
    tokens: [
      { name: 'primitive/cherry-chocolate-500', value: '#381C12', color: '#381C12' },
       { name: 'primitive/slate-500', value: '#64748B', color: '#64748B' },
    ],
  },
  {
    tier: 'Semantic tokens',
    desc: 'Intent-based aliases. Components reference these - they swap in dark mode.',
    tokens: [
      { name: 'text-color', value: 'primary/500', color: '#381C12', dark: 'Indigo/500', darkColor: '#6366F1' },
      { name: 'text-hover', value: 'primary/700', color: '#27120C', dark: 'Indigo/700', darkColor: '#4338CA' },
      { name: 'text-hover-muted', value: 'surface/500', color: '#64748B', dark: 'slate/500', darkColor: '#64748B' },
      { name: 'text-muted', value: 'surface/500', color: '#64748B', dark: 'slate/700', darkColor: '#334155' },
    ],
  },
  {
    tier: 'Component tokens',
    desc: 'Component specific colours. Only tokens that reference semantic tokens.',
    tokens: [
      { name: 'tooltip-background', value: 'surface/500', color: '#64748B', dark: 'slate/700', darkColor: '#334155' },
      { name: 'tooltip-color', value: 'surface/0', color: '#F8FAFC', dark: 'slate/0', darkColor: '#F8FAFC' },
      { name: 'button/primary', value: 'primary/500', color: '#381C12', dark: 'Indigo/500', darkColor: '#6366F1' },
      { name: 'message/info/background', value: 'blue/200', color: '#BFDBFE', dark: 'blue/200', darkColor: '#BFDBFE'  },
    ],
  },
]


const AGENT_ACTIONS = [
  {
    action: 'Token sync',
    steps: [
      { label: 'Scan', description: 'Read Figma variables and CSS token definitions.' },
      { label: 'Compare', description: 'Identify mismatches, missing tokens and naming differences.' },
      { label: 'Sync', description: 'Update CSS from Figma and generate a report.' },
    ],
  },
  {
    action: 'Component validation',
    steps: [
      { label: 'Scan', description: 'Scan Figma descriptions, properties, variants and states.' },
      { label: 'Match', description: 'Match Figma components to existing coded UI components.' },
      { label: 'Report', description: 'Report missing, duplicated or mismatched components for review.' },
    ],
  },
  {
    action: ' Visual validation',
    steps: [
      { label: '    Render', description: '    Build components and pages inside Storybook.' },
      { label: '    Compare', description: '    Check rendered output against the Figma designs.' },
      { label: '    Flag', description: '    Assess responsiveness and interactions.' },
    ],
  },
  {
    action: 'Quality audit',
    steps: [
      { label: '    Accessibility', description: '    Accessibility, states, responsiveness and component reuse.' },
      { label: 'Flag', description: '    Flag anything outside the design system for approval.' },
      { label: 'Correct', description: '    Summarise issues, fixes and overall system health.' },
    ],
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
                      background: token.color
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
          {active.steps.map((step, index) => {
            const isLastStep = index === active.steps.length - 1
            const stepDelay = index * 160

            return (
              <Fragment key={`${step.label}-${index}`}>
                <div
                  className={[
                    'ads-workflow-step',
                    isLastStep ? 'ads-workflow-step--outcome' : '',
                    'ads-workflow-slide',
                  ].filter(Boolean).join(' ')}
                  style={{ animationDelay: `${stepDelay}ms` }}
                >
                  <span className="ads-workflow-label">{step.label}</span>
                  <p>{step.description}</p>
                </div>
                {!isLastStep ? (
                  <div
                    className="ads-workflow-arrow ads-workflow-slide"
                    style={{ animationDelay: `${stepDelay + 80}ms` }}
                  >
                    →
                  </div>
                ) : null}
              </Fragment>
            )
          })}
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
        <p className="ads-card-title">Rebrand{'\n'}with{'\n'}AI</p>
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
  heroSize: { width: number; height: number }
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
                    width: `${heroSize.width}px`,
                    height: `${heroSize.height}px`,
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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

/* ─────────────────────────────────────────────────────────────
   Main case study component
   ───────────────────────────────────────────────────────────── */
export default function Rebrand() {
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="rebrand"
      imageSrc={HERO_SRC}
      imageClass="ads-hero-img"
      heroWrapClass="ads-hero-wrap"
      tooltip={'Building a design system that\n AI can actually use 🤖'}
      heroSize={{ width: 680, height: 350 }}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">I didn’t use AI to build a design system. I built a design system that AI can use.</h1>
        <p className="cs-body-text" >GlobeWest’s brand refresh created a need to rethink the UI across our digital products. When I joined, there wasn’t an established design system, and much of the previous design work had been created by different agencies over time. Rather than redesigning individual UI elements in isolation, I saw the rebrand as an opportunity to create a design system from the ground up.</p>
        {full(
          <p className="cs-body-text" key="intro-2">Since GlobeWest uses Magento, a template-driven CMS that makes content management easier but offers a limited set of UI elements, the design process is more complex. On top of that, translating designs into code requires manual development, which makes it harder to move a design from Figma to a production-ready page quickly.  </p>,
        )}
        <p className="cs-body-text" key="intro-3">I wanted to create a design system that’s closely connected to the codebase, so each design system component has a corresponding UI component in Magento.

          The goal was to give an AI agent a clear mapping between the designs and the available UI components. This would allow the agent to identify the right components from the designs and use them to build pages in Magento with minimal manual development.</p>

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">As Lead Product Designer, I led the design system from the ground up during GlobeWest’s rebrand.<br></br>

          That meant defining the design language, creating the component library, building the token architecture, writing machine-readable documentation, and making sure the system worked across both design and development.

          The interesting part wasn’t creating components.

          It was designing the system so AI could become another contributor to the team.</p>

        <h2 className="cs-section-title">Stack</h2>
        <p className="cs-body-text">React, Tailwind CSS v4.0, Sass, Figma, Storybook 10.5, Figma MCP, Claude</p>

        {full(
          <h2 className="cs-section-title" key="challenge-heading">The challenge</h2>,
                    <p className="cs-body-text" key="challenge-2">The design system needs to bridge the gap between design and development. Each design component needs a corresponding coded UI component in Magento.

Without this connection, an AI agent can’t reliably identify which Magento component to use when interpreting a design. This means page creation still requires manual development and limits how quickly designs can move from Figma to production.

The development team is also offshore, so even small changes can take time to scope, communicate and implement. This creates an additional dependency on development and slows down the process of turning approved designs into production-ready pages.</p>,

          <p className="cs-body-text" key="challenge-1">Every design system eventually runs into the same problems. Design tokens slowly lose structure,  design documentation becomes outdated, Figma drifts away from code, 
         
          duplicate components begin to appear.Keeping everything aligned becomes a manual job that nobody really owns.</p>,

         
        )}

        <h2 className="cs-section-title">Basics of the design system</h2>

        {full(
          <p className="cs-body-text" key="token-1">I used Tailwind CSS as the foundation because it makes code generation faster and more consistent. Rather than relying on Tailwind’s default token structure, I created a custom token architecture that AI agents can understand and reason about.
          </p>,
                    <p className="cs-body-text" key="token-architecture">The system is built on three layers.
                    Primitive tokens store the raw values, such as colours, spacing and typography. Semantic tokens give those values meaning, using names like color-text-primary or color-surface-card that describe intent instead of appearance. Component tokens sit on top, defining styles that are specific to individual UI patterns, such as Storybook panels or Figma widgets.
          </p>,

          <p className="cs-body-text" key="token-2">
            This layered approach gives both designers and AI a shared language. Instead of interpreting visual styles, agents can follow clear relationships between tokens, making audits, maintenance and code generation far more reliable.
          </p>,
        )}

        <TokenLayerDemo />
        <InteractiveTag hint="Discover how three token layers work." centered />

        {full(
          <p className="cs-body-text" key="token-3">
            The codebase then follows the same Figma naming and hierarchy. This gives AI agents a consistent vocabulary across design and code when an agent encounters button/primary in Figma, it can trace that same intent through to the implementation (--color-button-primary) without having to interpret or translate between two different systems.
          </p>,
        )}
      </div>

            <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/agentic-ds/color-tokens.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-hint">Figma component tokens mapped directly to CSS colour variables, showing how the same semantic naming and light/dark relationships carry consistently from design into code.</p>


      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Light and dark mode</h2>

        {full(
          <p className="cs-body-text" key="dark-1">Dark mode became a useful way to test whether the token architecture was actually working. Because components reference semantic tokens rather than fixed colour values, switching themes simply changes which primitive colours those tokens point to. The components themselves don’t need separate dark mode styling. This website is using the same architecture!</p>,

          <p className="cs-body-text" key="dark-2">I validated this through Storybook, where switching themes updates the components through the same CSS variables defined in Figma. It also gave AI a straightforward way to spot hard-coded colours or components that weren’t following the token structure, turning dark mode into a practical test for the health of the system.</p>,
        )}
      </div>

            <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/agentic-ds/light-dark.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-hint">The same button component responding to light and dark themes in Storybook, validating that semantic tokens handle theme changes without component-level overrides.</p>


      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Describe componenta as instructions</h2>
 <p className="cs-body-text" key="desc-1">Figma MCP gives the AI agent direct access to the context behind each component, creating a clear connection between design and code. I structured component descriptions to explain their purpose, tokens, properties, variants, states and interaction behaviour.</p>
        {full(
          <p className="cs-body-text" key="desc-2">These descriptions are deliberately machine-readable. They give the agent enough context to choose the right component and implement it using the existing design system rather than interpreting the UI or creating something new.</p>,
          <p className="cs-body-text" key="desc-3">For example, I can ask Claude: “Add a primary CTA component to the product tile component. Positioned at the bottom centre.” The agent reads the primary-button description in Figma and knows which component and tokens to use, including how those tokens behave across themes.</p>,
            <div className="ads-code" key="desc-4">
              <p className="ads-code__title">Figma token</p>
              <pre className="ads-code__content"><code>{`button/primary

Light → primary/500
Dark  → indigo/500`}</code></pre>
            </div>,
            <div className="ads-code" key="desc-5">
              <p className="ads-code__title">token.css</p>
              <HighlightedCode code={BUTTON_TOKEN_CSS} language="css" />
            </div>,
            <div className="ads-code" key="desc-6">
              <p className="ads-code__title">React</p>
              <HighlightedCode code={PRIMARY_BUTTON_CODE} language="jsx" />
            </div>,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Four-stage quality check</h2>
          <p className="cs-body-text" key="workflow-1">Giving an AI agent access to the design system doesn’t mean I trust everything it produces. I built a four-stage quality check around the workflow to make sure the system stays consistent as the agent works across Figma and code.</p>
        {full(
<p className="cs-body-text" key="workflow-2">Each stage checks a different part of the system from keeping tokens in sync, to making sure the right components are used, validating the output in Storybook, and auditing the final result before it moves forward. </p>,
<p className="cs-body-text" key="workflow-3"> My aim was to let the agent work independently, while keeping Figma as the source of truth and making quality something the system can continuously check rather than relying on me to catch problems later.</p>,
        )}

        <AgentWorkflowDemo />
        <InteractiveTag hint="Click on each stage to see the details" centered />

        {full(
          <p className="cs-body-text" key="workflow-2">A key insight from the four-stage workflow was that the agent could identify gaps in the design system, not just errors in its output. For example, while generating a product tile, it could find that Figma defines a secondary-button disabled state, but the corresponding React component doesn’t support it.</p>,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Figma is the main source of truth</h2>

        {full(
          <p className="cs-body-text" key="figma-1">Figma sits at the centre of the system and acts as the source of truth for both tokens and components. I separated the system into two Figma files: Design Tokens, which defines the primitive, semantic and component tokens, and Design System, which contains the UI components, variants, states and machine-readable descriptions.</p>,

          <p className="cs-body-text" key="figma-2">This separation gives the agent a clear place to look depending on the task. If it’s validating CSS tokens, it checks the Design Tokens file. </p>,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Details</h2>

        <div className="ads-results">
          <div className="ads-result-card">
            <span className="ads-result-number">2403</span>
            <span className="ads-result-label">Tokens generated</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">73</span>
            <span className="ads-result-label">Components with tokens, example and documentation</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">26</span>
            <span className="ads-result-label">Unused tokens recognised by agent</span>
          </div>
          <div className="ads-result-card">
            <span className="ads-result-number">2</span>
            <span className="ads-result-label">Figma libraries</span>
          </div>
        </div>

        <h2 className="cs-section-title">My learnings</h2>

        <p className="cs-body-text">
          The biggest lesson was that making a design system usable by AI forces you to be <strong>much more deliberate</strong> about its structure. 
        </p>

        <p className="cs-body-text">
          Writing component descriptions for an AI agent is different from writing design specs for another designer or developer. The agent relies on explicit instructions rather than visual context to understand how a component should work. If the purpose, behaviour or token usage is unclear, it has to fill in the gaps itself, which can quickly lead to output that drifts away from the design system.
        </p>

        {full(
          <p className="cs-body-text" key="learned-1">
            As the design lead working with overseas consultants to develop components, this reinforced something I was already seeing in practice. The clearer I make the intent and rules, the less room there is for interpretation, whether the work is being done by a developer or an AI agent.
          </p>,
        )}
      </div>
    </CaseStudyOverlay>
  )
}
