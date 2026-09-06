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
const HIFI_GALLERY_IMAGES = Array.from(
  { length: 12 },
  (_, index) => `/src/assets/images/libra/Libra-hifi-${index + 1}.png`,
)


const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'

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
  heroWrapClass,
  tooltip,
  heroSize = { width: 680, height: 350 },
  children,
}: {
  cardClass: string
  heroWrapClass: string
  tooltip: string
  heroSize?: { width: number; height: number }
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
                    width: `${heroSize.width}px`,
                    height: `${heroSize.height}px`,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
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
      heroWrapClass="ll-hero-wrap"
      tooltip={"Behind the Scenes of LoveLibra's\nUser-Centric Makeover🖌️"}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">Behind the scenes of Libra's user-centric makeover</h1>

        {full(
          <p className="cs-body-text" key="intro-1">
            Libra, a female care brand in Australia, was the leading brand in 2021 but faced a challenge: only a small percentage of their sales came from their online store. To address this, we embarked on a comprehensive UX design and discovery project focused on engaging a younger female audience.
          </p>,
          <p className="cs-body-text" key="intro-2">
            As the lead UI/UX designer (2021), I led the project based on a design thinking approach, which involved conducting comprehensive user research and analysis, creating wireframes and prototypes, performing user testing and usability evaluations, and continuously incorporating feedback to update design resources, ensuring high levels of usability and optimal user engagement.
          </p>,
          <p className="cs-body-text" key="intro-3">
            It’s live on  {' '}
            <a
              className="cs-link"
              role="link"
              tabIndex={0}
              onClick={() => window.open('https://lovelibra.com/au/', '_blank')}
            >
              https://lovelibra.com/au/
            </a>
            .
          </p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">Lead UI/UX designer</p>

        <h2 className="cs-section-title">Impact</h2>

        <h3 className="cs-subsection-title">Optimised ordering process </h3>
        {full(
          <p className="cs-body-text" key="impact-1">
            Subscriptions, custom bundles and easier reordering reduced the work required to replenish essential products, supporting stronger retention and more predictable revenue.
          </p>,
        )}

        <h3 className="cs-subsection-title">Better product discovery</h3>
        {full(
          <p className="cs-body-text" key="impact-2">
            Clearer product information helped new customers understand product suitability and benefits, reducing uncertainty before adding an item to their cart.
          </p>,
        )}

        <h3 className="cs-subsection-title">Improved awareness of Libra’s free product program</h3>
        {full(
          <p className="cs-body-text" key="impact-3">
            Prominent navigation and clearer program content made it easier for students and schools to discover the initiative and understand how to participate.
          </p>,
        )}
        <h3 className="cs-subsection-title">Faster mobile shopping experience</h3>
        {full(
          <p className="cs-body-text" key="impact-4">
            A mobile-first interface made browsing, purchasing and managing orders easier for the more than 80% of Libra customers accessing the website by phone.
          </p>,
        )}
      </div>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="./src/assets/images/libra/stats.png"
        alt="Page speed test recorded using https://tools.pingdom.com/."
      />
      <span className="cs-body cs-hint">
        Page speed test recorded using https://tools.pingdom.com/.
      </span>


      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Challenges</h2>
        <p className="cs-body-text">
          Online shopping is about convenience and speed, but for many of Libra’s users, that experience was falling short. Websites need to be fast and engaging, yet Libra's site was plagued by long loading times that caused user frustration and drop-offs.

        </p>
        <p className="cs-body-text">
          And while a seamless checkout process is crucial for securing sales, Libra’s slow and cumbersome checkout experience led to frequent cart abandonment. These issues collectively hindered the brand’s ability to convert website visits into sales.
        </p>

        <p className="cs-body-text">
          Many critical aspects of user needs remained undiscovered, highlighting the challenges of fully understanding the target audience of Libra.

        </p>
      </div>

      <div className="cs-body cs-body--continued">
        <h4 className="cs-section-title">Key drivers</h4>
        {full(
          <p>&nbsp;</p>,
          <h3>Repetitive ordering process</h3>,
          <p className="cs-body-text">
            Users are required to manually create orders with multiple products each time, despite frequently purchasing the same items.
          </p>,
          <p>&nbsp;</p>,
          <h3>Insufficient product information</h3>,
          <p className="cs-body-text">
            Product descriptions are brief and confined to what’s listed on the product label, leaving new users unable to fully understand the suitability or benefits of the products.
          </p>,
          <p>&nbsp;</p>,
          <h3>Lack of product awareness</h3>,
          <p className="cs-body-text">
            There was no visibility of the free product distribution program in schools. Libra's free product program was unknown to students and schools, with schools unsure how to place orders.
          </p>,
          <p>&nbsp;</p>,
          <h3>Poor mobile experience</h3>,
          <p className="cs-body-text">
            Over 80% of users access the website via their phones, but its lack of mobile optimisation discourages browsing and ultimately leads to fewer product orders.
          </p>,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Journey mapping</h2>
        {full(
          <p className="cs-body-text" key="rename-1">
            Drawing from rich data collected through in-person interviews, surveys, and user reviews, I began organising my observations and insights into a customer journey map. This journey map became an integral tool, revealing pain points and highlighting opportunities for improvement across every stage of the user experience.
          </p>,
          <p className="cs-body-text" key="rename-2">
            It didn’t just identify where the website needed improvements, but it also initiated meaningful discussions, helping bridge knowledge gaps and igniting idea generation among the team and stakeholders.
          </p>,
          <p className="cs-body-text" key="rename-3">
            Mapping the journey also allowed me to identify key touchpoints, delving into user intent and tasks while considering the emotions and expectations users had along the way.
          </p>,
        )}
      </div>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/libra/journey-map.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-body cs-hint">A five-stage journey map following the persona from recognising a need to receiving her order, highlighting actions, emotions, pain points, touchpoints and opportunities.</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Ideation: Balancing user needs with business priorities</h2>
        {full(
          <p className="cs-body-text" key="model-1">
            Facilitating UX ideation workshops for the Libra website was a pivotal step in introducing the client to design thinking. I brought together stakeholders from marketing, commercial, and product management for the workshops, which aimed to align diverse perspectives around user needs and business objectives.
          </p>,
          <p className="cs-body-text" key="model-2">
            Balancing user needs with business priorities was a recurring theme. I presented direct quotes from interviews and user feedback that underscored the value of some features such as subscription products. These insights shifted the conversation and helped me to add those features into the product roadmap.
          </p>,
        )}
      </div>

      <img className="cs-cover-img" data-scroll-reveal src="/src/assets/images/libra/ideation.png" alt="Layer Lint settings panel showing model selector and API key management" />
      <p className="cs-body cs-hint">Using customer insights to introduce design thinking, align user and business needs, and secure features such as subscriptions on the product roadmap.</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Ideas to sketches</h2>
        {full(
          <p className="cs-body-text" key="ideas-1">
            I translated initial ideas into low-fidelity sketches and collaborated closely with my team to refine concepts. These sketches formed the basis for user testing, allowing us to quickly gather feedback and identify areas for improvement. Through iterative cycles, we updated the designs, moving step-by-step towards a solution for new concepts such as subscription and ordering product samples online. The process helped me make sure each iteration brought us closer to a better user experience.
          </p>,

        )}

        <div className="video-autoplayer libra-ideas-video">
          <iframe
            src="https://player.vimeo.com/video/1216622779?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1"
            title="Ideas to sketches"
            allow="autoplay; fullscreen; picture-in-picture"
            tabIndex={-1}
          />
        </div>

        <h2 className="cs-section-title">User testing</h2>

        <p className="cs-body-text">
          I conducted moderated user testing to assess the usability and effectiveness of the design. I selected a group of five participants that reflected the target audience (young women) and facilitated the testing sessions, where users were guided through key tasks such as making a purchase, subscribing to a kit, and navigating the website’s promotions and content.
        </p>

        {full(
          <p className="cs-body-text" key="closing-1">
            As users completed these tasks, I observed their behaviour, identified pain points, and encouraged them to think out loud to capture their thoughts and feelings about the interface.
            The session results provided valuable insights that led to design improvement primarily in checkout and shopping cart features.
          </p>,
        )}
        <img
          className="cs-cover-img"
          data-scroll-reveal
          src="/src/assets/images/libra/user-testing.png"
          alt="User testing session"
        />
        <p className="cs-body cs-hint">I tested the design with five participants, watching how they shopped and subscribed, and used what I learnt to refine the cart and checkout experience.</p>
      </div>
      <div className="cs-body cs-body--continued">

        <h2 className="cs-section-title">High-fidelity designs</h2>

        <p className="cs-body-text">
          Following the review of low-fidelity designs, I was tasked with creating high-fidelity designs in Figma that aligned with Libra's established brand guidelines. One of the biggest challenges was incorporating Libra Girl, a new section of the website with a completely different brand identity. To maintain consistency between the two brand identities, I used design tokens and shared styles. 
        </p>

        {full(
          <p className="cs-body-text" key="closing-1">
By defining colours, typography, and spacing as variables, I was able to create a flexible yet consistent design system that could seamlessly blend both Libra and Libra Girl’s aesthetics.
          </p>,
          <p className="cs-body-text" key="closing-2">
Changing these variables allowed me to adapt the designs quickly while ensuring that both brands felt cohesive and true to their individual identities, without redundancy in assets. This approach not only streamlined the design process but also ensured a scalable and adaptable system moving forward.
          </p>,

        )}

        <div className="libra-hifi-gallery" aria-label="Libra high-fidelity designs">
          {HIFI_GALLERY_IMAGES.map((src, index) => (
            <img
              className="cs-cover-img libra-hifi-gallery__image"
              data-scroll-reveal
              src={src}
              alt={`Libra high-fidelity design ${index + 1}`}
              loading="lazy"
              decoding="async"
              key={src}
            />
          ))}
        </div>
      </div>

    </CaseStudyOverlay>
  )
}
