import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRipple } from '../../useRipple'
import './ModularSofa.scss'

const ICON_EXPAND = '/src/assets/icons/full-screen.svg'
const ICON_SHRINK = '/src/assets/icons/shrink.svg'
const IDEATION_IMAGES = [
  '/src/assets/images/modular/ideation1.png',
  '/src/assets/images/modular/Ideation2.png',
  '/src/assets/images/modular/Ideation3.png',
  '/src/assets/images/modular/Ideation4.png',
]
const RENDER_IMAGES = [
  '/src/assets/images/modular/3D1.png',
  '/src/assets/images/modular/3D2.png',
  '/src/assets/images/modular/3D3.jpg',
  '/src/assets/images/modular/3D4.jpg',
]
const DATA_IMAGES = [
  '/src/assets/images/modular/data-1.png',
  '/src/assets/images/modular/data-2.png',
  '/src/assets/images/modular/data-3.png',
  '/src/assets/images/modular/data-4.png',
]

// ── Marquee background rows ──
const MARQUEE_IMAGES = Array.from(
  { length: 15 },
  (_, index) => `/src/assets/images/modular/modular-sofa-V${index + 1}.png`,
)

function shuffleImages(images: string[]) {
  const shuffled = [...images]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = current
  }

  return shuffled
}

const MARQUEE_ROWS = [
  { imgs: shuffleImages(MARQUEE_IMAGES), dir: 'left' },
  { imgs: shuffleImages(MARQUEE_IMAGES), dir: 'right' },
  { imgs: shuffleImages(MARQUEE_IMAGES), dir: 'left' },
  { imgs: shuffleImages(MARQUEE_IMAGES), dir: 'right' },
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

function ModularImageGallery({
  images,
  label,
  altPrefix,
}: {
  images: string[]
  label: string
  altPrefix: string
}) {
  return (
    <div className="modular-ideation-gallery" aria-label={label}>
      {images.map((src, index) => (
        <img
          className="cs-cover-img modular-ideation-gallery__image"
          data-scroll-reveal
          src={src}
          alt={`${altPrefix} ${index + 1}`}
          loading="lazy"
          decoding="async"
          key={src}
        />
      ))}
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
      <div className="cs-marquee-hero cs-marquee-hero--video">
        <iframe
          src="https://player.vimeo.com/video/1221363437?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1"
          title="Modular sofa experience"
          allow="autoplay; fullscreen; picture-in-picture"
          tabIndex={-1}
        />
      </div>
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
  heroSize: {
    width: number
    height: number
  }
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
        <img
          className={videoClass}
          src={videoSrc}
          alt="Modular sofa banner"
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
                <img
                  className="cs-hero-video"
                  src={videoSrc}
                  alt="Modular sofa banner"
                  style={{
                    width: `${heroSize.width}px`,
                    height: `${heroSize.height}px`,
                    objectFit: 'cover',
                  }}
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

export default function ModularSofa() {
  const [tldr, setTldr] = useState(false)

  const full = (...nodes: ReactNode[]) => (
    <div className={['tldr-collapsible', tldr ? 'tldr-collapsible--hidden' : ''].filter(Boolean).join(' ')}>
      <div>{nodes}</div>
    </div>
  )

  return (
    <CaseStudyOverlay
      cardClass="plugin-card"
      videoSrc="/src/assets/images/modular/modular-banner.png"
      videoClass="plugin-video"
      tooltip={'Design a flexible sofa system\nwith modular components 🛋️'}
      heroSize={{ width: 680, height: 382 }}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">A new modular sofa user experience</h1>

        {full(
          <p className="cs-body-text" key="intro">
            A modular sofa is made from separate pieces that can be combined into different shapes and sizes. This gives customers more flexibility, but it can also make choosing the right sofa feel like solving a puzzle.
          </p>,
          <p className="cs-body-text" >
            Previous modular sofa purchase exprience made it difficult for customers to understand their options and make a confident purchase decision. The information was fragmented and the experience offered little guidance through the purchase.
          </p>,
          <p className="cs-body-text" >
            I led the redesign of GlobeWest’s modular sofa experience, changing how the products were organised and presented online. The new modular sofa purchase journey introduced complete options that the customers could easily understand, compare and buy.
          </p>
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">As Lead product designer, I guided the project from discovery through launch and post-launch activities.

          My work included customer research, journey mapping, workshop facilitation, experience strategy, interaction design, prototype testing, analytics planning and user acceptance testing.

          I also worked closely with product, engineering, and sales teams to understand how modular sofas are created and maintained behind the scenes.

          This meant my role went beyond just designing screens. I helped establish the product rules and internal processes needed to support the experience over time.</p>

        <h2 className="cs-section-title">Impact</h2>

        <h3 className="cs-subsection-title">Increase in modular sofa sales</h3>
        {full(
          <p className="cs-body-text" key="faster">
            Post-launch results showed growth in both modular sofa sales and order volume that indicates stronger customer engagement with the new experience.
          </p>,
        )}

        <h3 className="cs-subsection-title">Reduced the risk of incorrect orders</h3>
        {full(
          <p className="cs-body-text" key="latest">
            Clear product information such as dimensions and component details helped customers understand what they were buying, reducing the likelihood of ordering mistakes and avoidable returns.
          </p>,
        )}

        <h3 className="cs-subsection-title">Easier product management</h3>
        {full(
          <p className="cs-body-text" key="regions">
            The project created a repeatable process for adding, updating and removing modular sofas which makes the range easier for internal teams to manage over time. It also created a scalable solution for product imagery needs.
          </p>,
        )}
      </div>
      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Project plan</h2>
        <p className="cs-body-text">
          Before moving into design, I worked with the product owner to create a shared project plan in FigJam to break the work into clear stages. The plan covered research, journey mapping, feature definition, design, validation, development handover and post-launch analysis.
        </p>

        {full(
          <p className="cs-body-text" key="solution">
            It became a shared reference for product, sales and engineering. It helped us agree on what we needed to learn, what success looked like and which Magento and NetSuite constraints needed to be considered early. As we learned more through interviews, audits and testing, I updated the plan to reflect changes in scope and direction.
          </p>,
        )}
      </div>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/modular/project-plan.png"
        alt="Modular sofa project plan"
      />
      <p className="cs-hint">Modular sofa project plan.</p>


      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Understanding the pain points</h2>
        <p className="cs-body-text">
          I used semi-structured interviews to understand the experience from both sides. I spoke with eight internal stakeholders across sales, customer service, showrooms and product to learn about business rules and technical constraints. I then interviewed eight customers and asked them to walk through the existing modulae sofa purchase journey togetehr. This helped me compare what internal teams believed was happening with what customers experienced.
        </p>

        {full(
          <p className="cs-body-text" key="solution">
            Between interviews, I conducted a detailed UX audit of the existing modular sofa experience and reviewed ten major Australian sofa brands to understand how they approached similar challenges.
          </p>,
        )}

      </div>



      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Pain points</h2>

        <h3 className="cs-subsection-title">Customers couldn't visualise different sofa layouts </h3>
        {full(
          <p className="cs-body-text" key="faster">
            The existing product structure only allowed the website to present modular sofas as individual pieces rather than complete options, such as a four-seater L-shaped sofa. Without a clear view of the finished result, customers and designers struggled to understand how the pieces would come together and often created their own drawings or mock-ups.
          </p>,
        )}
        <img
          className="cs-cover-img"
          data-scroll-reveal
          src="/src/assets/images/modular/pain-point1.png"
          alt="Customers couldn't visualise different sofa layouts."
        />
        <p className="cs-hint">During an interview, a customer explained how difficult it was to visualise different sofa layouts since they could only purchase individual pieces.</p>

        <h3 className="cs-subsection-title">Customers had difficulty understanding dimensions </h3>
        {full(
          <p className="cs-body-text" key="faster">
            The website showed the dimensions of each piece separately, leaving customers to calculate the sofa’s total size themselves. This made it difficult to know whether a configuration would fit their space and increased the risk of mistakes.
          </p>,
        )}
        <img
          className="cs-cover-img"
          data-scroll-reveal
          src="/src/assets/images/modular/pain-point2.png"
          alt="Customers had difficulty understanding dimensions"
        />
        <p className="cs-hint">Microsoft Clarity heatmap showed customers opening every individual piece to find basic information such as dimensions. This turned a simple size check into a repetitive and frustrating part of the purchase journey.</p>


        <h3 className="cs-subsection-title">It was unclear how the pieces worked together </h3>
        {full(
          <p className="cs-body-text" key="faster">
            Customers struggled to understand what was included, which pieces connected and what left or right orientation meant. This increased the risk of incorrect orders.
          </p>,
        )}

      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Ideation</h2>
        {full(
          <p className="cs-body-text" key="iteration-1">
            Once the research themes became clear, I ran several ideation workshops with the product manager to turn the findings into practical ideas. We reviewed the affinity map, reframed the main pain points as “How might we” questions, and used reverse brainstorming to challenge our assumptions. We then considered technical and business constraints alongside useful patterns from the competitor review. This helped us prioritise features that addressed the strongest customer needs while remaining realistic to design and build.
          </p>,
        )}
      </div>

      <ModularImageGallery
        images={IDEATION_IMAGES}
        label="Modular sofa ideation workshop"
        altPrefix="Modular sofa ideation workshop"
      />

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Solution</h2>
        {full(
          <p className="cs-body-text" key="iteration-1">
            The solution introduced complete, pre-configured sofas that customers could browse by familiar shapes such as L-shaped, curved and chaise. Each option showed the finished sofa, total dimensions, price, fabric, availability and the individual pieces included. Customers who wanted more flexibility could still explore separate pieces or extend an existing configuration. </p>,
          <p className="cs-body-text" key="iteration-2">
            During a workshop, the product owner and I grouped the features into different release versions. We agreed on a minimum marketable product for the first launch, then created a roadmap for additional features such as improved component browsing, configuration extensions and richer visualisation tools.
          </p>,
        )}

        <img
          style={{ maxWidth: '632px' }}
          className="cs-cover-img"
          data-scroll-reveal
          src="/src/assets/images/modular/feature-map.png"
          alt="product feature map"
        />
        <p className="cs-hint">A product feature map showing how ideas were grouped and prioritised across the first release and future versions, balancing customer value, business needs and technical feasibility.</p>

      </div>




      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Solving product imagery</h2>
        {full(
          <p className="cs-body-text" key="error-1">
            Photographing every modular sofa configuration was not practical. Each setup required the physical pieces to be assembled, styled and photographed, making the process costly and difficult to scale.
          </p>,
          <p className="cs-body-text" key="error-2">
            I worked with an overseas visualisation vendor to create accurate 3D models and rendered images instead. We reviewed the models with interior designers before producing the final assets, giving the website and sales team a consistent way to present complete configurations without relying on a physical photoshoot for every option.
          </p>,
          <ModularImageGallery
            images={RENDER_IMAGES}
            label="Modular sofa 3D renders"
            altPrefix="Modular sofa 3D render"
            key="render-gallery"
          />,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Solving product data</h2>
        {full(
          <p className="cs-body-text" key="error-1">
            The new experience depended on product data that did not yet exist in a consistent or centralised format. With limited IT resources, I worked through the range configuration by configuration, defining which pieces connected, their quantities, layout and total dimensions. I first cleansed and standardised the raw NetSuite data, then used GPT to convert it into the structure required by the website. This process produced the data for more than 380 configuration products.
          </p>,
          <p className="cs-body-text" key="error-2">
            I also onboarded the product team to Notion and created a shared knowledge base for maintaining the information. Connecting Notion with GPT reduced the manual work involved in reformatting raw data and made the process easier to repeat. The same dataset guided the 3D vendor by defining the exact layout of each configuration, keeping the rendered imagery aligned with the products shown on the website.
          </p>,
          <ModularImageGallery
            images={DATA_IMAGES}
            label="Modular sofa product data workflow"
            altPrefix="Modular sofa product data"
            key="data-gallery"
          />,
        )}
      </div>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Key takeaways</h2>
        <h3 className="cs-subsection-title">Consider the wider customer journey </h3>
        {full(
          <p className="cs-body-text" key="faster">
            The strongest insight came from seeing how customers and sales teams made modular sofas easier to understand. In showrooms, sales teams used small wooden models to demonstrate different layouts. Online, Microsoft Clarity showed customers opening multiple product pages to find dimensions and understand how the pieces connected.
            This inspired me to provide a solution that not only makes the modular product purchase easier but also compliments existing sales tools.
          </p>,
          <div className="modular-sales-gallery" key="sales-gallery">
            <img
              className="cs-cover-img modular-sales-gallery__image"
              data-scroll-reveal
              src="/src/assets/images/modular/sales1.png"
              alt="Sales team using wooden models to demonstrate different sofa layouts"
            />
            <img
              className="cs-cover-img modular-sales-gallery__image"
              data-scroll-reveal
              src="/src/assets/images/modular/sales2.png"
              alt="How modular components are connected to each other using metal connectors"
            />
          </div>,
          <p className="cs-hint">Physical modular models used by showroom teams to help customers explore and compare different sofa layouts.</p>
        )}

        <h3 className="cs-subsection-title">A good UX needs reliable data behind it</h3>
        {full(
          <p className="cs-body-text" key="faster">
            Presenting a complete sofa looked simple on the website, but it required accurate relationships between hundreds of individual products. It involved cleansing the raw NetSuite data, using GPT and Notion to create a workflow.
            <br /> A repeatable workflow is essential for success since GlobeWest introduces new product ranges each year. The modular process proved its value when the collection 2027 launched with 6 new modular sofa families successfully using the same approach.
          </p>,
        )}

        <h3 className="cs-subsection-title">Prioritisation of features</h3>
        {full(
          <p className="cs-body-text" key="faster">
            We had ideas for advanced visualisation and configuration tools, but delivering everything in the first release was not realistic. The product owner and I divided the features into different versions, focusing the first release on complete configurations, dimensions, imagery and included pieces.
          </p>,
        )}
      </div>
      <MarqueeSection />
    </CaseStudyOverlay>
  )
}
