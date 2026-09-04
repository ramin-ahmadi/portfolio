import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import ColourVariables from "../ColourVariables/ColourVariables";
import { useRipple } from "../../useRipple";
import { useScrollReveal } from "../useScrollReveal";

const VIDEO_SRC = "/src/assets/videos/fava-design-system.mp4";
const ICON_EXPAND = "/src/assets/icons/full-screen.svg";
const ICON_SHRINK = "/src/assets/icons/shrink.svg";

function VimeoAutoPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const shouldPlayRef = useRef(false);

  function sendPlayerCommand(method: "play" | "pause") {
    iframeRef.current?.contentWindow?.postMessage(
      { method },
      "https://player.vimeo.com",
    );
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollRoot = container.closest(".cs-expanded-inner");
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        shouldPlayRef.current = shouldPlay;
        sendPlayerCommand(shouldPlay ? "play" : "pause");
      },
      {
        root: scrollRoot,
        threshold: [0, 0.35],
      },
    );

    observer.observe(container);

    return () => {
      shouldPlayRef.current = false;
      sendPlayerCommand("pause");
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="video-autoplayer"
      data-scroll-reveal
    >
      <iframe
        ref={iframeRef}
        src="https://player.vimeo.com/video/1214432519?autoplay=0&muted=1&loop=1&playsinline=1&dnt=1"
        title="Design system video"
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
        allowFullScreen
        onLoad={() => {
          if (shouldPlayRef.current) sendPlayerCommand("play");
        }}
      />
    </div>
  );
}

function TldrToggle({
  modelValue,
  onUpdate,
}: {
  modelValue: boolean;
  onUpdate: (value: boolean) => void;
}) {
  return (
    <div className="tldr-bar">
      <span
        className="tldr-indicator"
        style={{
          transform: modelValue
            ? "translateX(calc(100% + 4px))"
            : "translateX(0)",
        }}
      />
      <button
        className={["tldr-pill", !modelValue ? "tldr-pill--active" : ""]
          .filter(Boolean)
          .join(" ")}
        type="button"
        onClick={() => onUpdate(false)}
      >
        Full
      </button>
      <button
        className={["tldr-pill", modelValue ? "tldr-pill--active" : ""]
          .filter(Boolean)
          .join(" ")}
        type="button"
        onClick={() => onUpdate(true)}
      >
        TL;DR
      </button>
    </div>
  );
}

function CaseStudyOverlay({
  cardClass,
  videoSrc,
  videoClass,
  tooltip,
  heroSize,
  children,
}: {
  cardClass: string;
  videoSrc: string;
  videoClass: string;
  tooltip: string;
  heroSize: { width: number; height: number };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { spawnRipple, renderRipples } = useRipple();

  useScrollReveal(innerRef, open);

  function openOverlay() {
    setWasOpen(true);
    setClosing(false);
    setOpen(true);
  }

  function closeOverlay() {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setShowBackToTop(false);
    }, 450);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOverlay();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="cs-card-wrapper">
      <div
        className={[
          "bento-card",
          cardClass,
          open ? "cs-card--ghost" : "",
          wasOpen ? "cs-card--was-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-tooltip={tooltip}
        onClick={openOverlay}
      >
        {videoClass === "ds-video" ? (
          <iframe
            className="ds-video"
            src="https://player.vimeo.com/video/1214723999?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&dnt=1"
            title="Design system preview"
            allow="autoplay; fullscreen"
            tabIndex={-1}
          />
        ) : (
          <video
            className={videoClass}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        )}
        <span className="action-icon" aria-hidden="true">
          <img src={ICON_EXPAND} alt="" />
        </span>
      </div>

      {open ? (
        <>
          <div
            className={["cs-backdrop", closing ? "cs-backdrop--out" : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={closeOverlay}
          />
          <div
            className={[
              "cs-expanded",
              "cs-expanded--settled",
              closing ? "cs-expanded--closing" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: 0, top: 0, width: "100vw", height: "100vh" }}
            onClick={spawnRipple}
          >
            <div className="cs-header">
              <button
                className="cs-header-close"
                type="button"
                data-tooltip="Press Esc to exit fullscreen"
                aria-label="Close case study"
                onClick={closeOverlay}
              >
                <img src={ICON_SHRINK} alt="" />
              </button>
            </div>

            <div
              ref={innerRef}
              className="cs-expanded-inner"
              onScroll={(event) =>
                setShowBackToTop(event.currentTarget.scrollTop > 600)
              }
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
                  style={{
                    width: `${heroSize.width}px`,
                    height: `${heroSize.height}px`,
                  }}
                />
                {children}
              </div>
            </div>

            <button
              className={[
                "cs-back-to-top",
                showBackToTop ? "cs-back-to-top--visible" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              aria-label="Back to top"
              onClick={() =>
                innerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }
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
  );
}

export default function DesignSystem() {
  const [tldr, setTldr] = useState(false);

  const full = (...nodes: ReactNode[]) => (
    <div
      className={["tldr-collapsible", tldr ? "tldr-collapsible--hidden" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div>{nodes}</div>
    </div>
  );

  return (
    <CaseStudyOverlay
      cardClass="ds-card"
      videoSrc={VIDEO_SRC}
      videoClass="ds-video"
      tooltip={
        "How we transformed a fragmented UI \ninto a scalable design system 🎨"
      }
      heroSize={{ width: 680, height: 382 }}
    >
      <TldrToggle modelValue={tldr} onUpdate={setTldr} />

      <div className="cs-body">
        <h1 className="cs-title">
          How we transformed a fragmented UI into a scalable design system
          called Fava
        </h1>

        {full(
          <p className="cs-body-text" key="intro">
            When I joined Enable as a senior product designer in November 2023,
            I stepped into a product with an incredible purpose but a tangled
            design story. Enable’s rebate management system, launched in 2016,
            is a collaborative platform empowering businesses to manage and
            track complex rebate agreements. However, like many growing
            products, Enable had outgrown its early design processes. For years,
            Enable had been an engineer-led platform, with engineers and product
            managers relying on Miro to stitch together prototypes by cutting
            and pasting UI elements from various parts of the app which Lead to
            inconsistent design across features and the product. The app had
            grown into five major features, each supported by dedicated teams of
            engineers and product managers. But with over 100 engineers working
            in silos, the cracks were evident. The features, despite sharing
            a common brand identity, looked and behaved differently. This
            created a fragmented experience that made the platform harder for
            users to navigate and learn.
          </p>,
        )}

        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">
          My efforts for 15 months revolved around creating a cohesive user
          experience. I focused on aligning the visual and functional language
          across features, creating a single source of truth, Fava design
          system, for the design and development teams.
        </p>

        <h2 className="cs-section-title">Impact</h2>
        <h3 className="cs-subsection-title">1. Increase in Dev adoption </h3>
        <p className="cs-body-text" key="alignment">
          The design system was successfully adopted by engineers, leading to a
          14% increase in component usage.
        </p>
        <h3 className="cs-subsection-title">2. Reduced redundancies</h3>
        <p className="cs-body-text" key="variables">
          The design system streamlined over 100 components into 40
          well-researched, evidence-based components.
        </p>
        <h3 className="cs-subsection-title">3. Evidence-based development</h3>
        <p className="cs-body-text" key="architecture">
          All components were tested before development began to ensure
          reliability and effectiveness.
        </p>
      </div>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="./src/assets/images/design-system/problem.png"
        alt="Design system issues discovered through UI audit"
      />
      <span className="cs-hint">
        Example of inconsistent form controls: dropdowns use different visual
        styles, checkbox sizes vary, toggles are replaced with checkboxes, and
        the autocomplete field is not clearly identifiable.
      </span>
      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Challenges</h2>
        <p className="cs-body-text">
          At Enable, no two features looked the same, even when they shared the
          exact same UI elements. A button in one feature had rounded corners,
          while in another, it was sharp-edged. These inconsistencies weren’t
          just aesthetic; they made the platform harder to use and even harder
          to scale. To tackle this, I conducted a full UI audit, cataloguing
          every variation of components across Enable’s five core features. But
          addressing the inconsistencies wasn’t just about fixing the visuals.
          It was about bringing the engineering team on board with the need for
          a unified design system. This audit became the foundation for our push
          towards a single, cohesive design system. One that would not only
          standardise Enable’s UI but also create a more seamless and intuitive
          experience for our users.
        </p>
        <p className="cs-body-text">
          In addition, an outdated colour token system required manual switching
          between light and dark modes. This increased the number of unnecessary
          variants and introduced a higher risk of human error in
          production-ready designs.
        </p>
      </div>
      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">UI audit</h2>
        
      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="./src/assets/images/design-system/ui-audit.png"
        alt="UI audit image"
      />
            <span className="cs-hint">
       A comprehensive audit of the existing interface revealed inconsistent patterns, duplicated components, and varying interaction behaviours across the product. 
       These findings became the foundation for the new design system and helped with scoping the project.
      </span>
      
      </div>
      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Project roadmap</h2>
        <p className="cs-body-text" key="colour-variables">


          After completing the UI audit, I aligned on project goals and success metrics with the Design Director and outlined a roadmap for the design system, focusing on five key areas:

Building blocks: Grid, colour, icons, motion, spacing, and typography.
Guidelines: Accessibility, AI integration, and content strategy.
Components: Designing and documenting 40 core components.
Patterns: Standardising actions, popups, disabled states, notifications, and status indicators.
Data visualisation: Defining best practices for charts, data flows, and dashboards.
        </p>
      </div>
              
      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="./src/assets/images/design-system/project-roadmap.png"
        alt="project roadmap image"
      />
            <span className="cs-hint">
      Breaking the design system into clear, achievable milestones. 
      </span>

     

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Design team alignment</h2>
         {full(
          <p className="cs-body-text" key="spacing">
            When I joined the company, the design team was still finding its footing. With no established ways of working with engineers, I knew we had to build a strong foundation for collaboration.

I started by bringing both the design and engineering teams together for a series of meetings to establish the best way to work as one. These weren’t just process discussions. they were about fostering trust, aligning expectations, and ensuring everyone had a voice in shaping how we’d move forward.

During my UI audit, I categorised all components using the atomic design methodology. Then, I assigned atoms and molecules to each designer, making sure we tackled the foundational elements first to make the biggest impact.

To build a culture of shared learning, I introduced "UI Party meetings", a weekly session where all designers gathered in a room to work on their assigned components together. 
          </p>
          ,
        )}
      </div>
            <img
        className="cs-cover-img"
        data-scroll-reveal
        src="./src/assets/images/design-system/Design-team-alignment.png"
        alt="Design team alignment"
      />
            <span className="cs-hint">
      One of our first conversations focused on defining our workflow and ways of working as a team.
      </span>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Unified token system</h2>
          <p className="cs-body-text" key="components">
            As I explored ways to create a unified way of working within the design team, I stumbled upon <a href="https://medium.com/eightshapes-llc/team-models-for-scaling-a-design-system-2cf9d03be6a0" title="federated committee"> the federated committee by design</a>    approach used by Google’s Material Design team. It balanced structure with flexibility, ensuring that design decisions were scalable while still allowing for adaptability across different components done by a team of designers.

With this in mind, I led the team in establishing a unified token system. Beyond just global variables, each component was assigned its own subset of variables, ensuring it had the flexibility to define its own parameters while still adhering to shared design foundations like colour and spacing. 
          </p>
      </div>

      <ColourVariables />


      <p className="cs-hint">  <span className="cc-interactive-tag">Interactive</span> Example of tokens used for the button component. Button colour variables are selectable.</p>
        <div
          className="cs-body cs-body--continued"
          key="background-component-copy"
        >
          <p className="cs-body-text">
           Component tokens are organised by component → colour variant → interaction state (for example, button / primary / hover). This follows a component token taxonomy, making tokens easier to find, keeping interaction states grouped together, and allowing colour values to be swapped through semantic tokens without changing the component structure. 
          </p>
        </div>

      <VimeoAutoPlayer />
      <p className="cs-hint">This video demonstrates how the Autocomplete component uses design tokens for size and colour.</p>


  

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Anatomy of component documentation</h2>
        {full(
          <p className="cs-body-text" key="contexts">
            I wanted every component to follow the same documentation structure so that people always know where to find the information they need. 
            Each page starts by explaining what the component is and when it should be used, followed by a live example to show it in context. 
            From there, I break the component down into its available variants, modifiers and behaviour before covering sizing, spacing, content guidance, accessibility and implementation notes. 
            By documenting every component in the same way, the design system becomes easier to navigate, reduces ambiguity, and provides a single source of truth for both designers and developers.
          </p>,
        )}
      </div>
      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/design-system/documentation.png"
        alt="Component documentation"
      />
      <p className="cs-hint">Example of the documentation structure used across every component in the design system.</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Partnership with Engineering</h2>
        {full(
          <p className="cs-body-text" key="architecture-1">
           Building the Fava Design System was a collaborative effort, and it would not have been possible without the <a href="https://blog.enable.engineering/introducing-the-enable-design-system-69b1acc8eaeb" title="Introducing the Enable Design System">Engineering team</a>. 
           They partnered with UX throughout the project, validating component behaviour, shaping technical implementation, and providing continuous feedback as the system evolved. 
           Their willingness to collaborate ensured the design system was more than a Figma library; it became a shared foundation that improved consistency, accelerated development, and made it easier for teams to deliver high-quality product experiences together.
          </p>,
        )}
      </div>
            <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/design-system/component-structure.png"
        alt="Design system ecosystem"
      />
      <p className="cs-hint">Design system ecosystem</p>

      <div className="cs-body cs-body--continued">
        <h2 className="cs-section-title">Key takeaways</h2>
        <p>&nbsp;</p>
        <h3>Advocating for design in an engineering world</h3>
        <p className="cs-body-text">
          The most important aspect of this project was <strong>bridging the gap between engineering and design </strong>to foster a culture of collaboration. 
          This required learning how to advocate for the design team’s goals and concerns in a technical setting by introducing systematic 
          thinking and process-driven workflows.
        </p>

        <h3>The Importance of regression testing</h3>
        <p className="cs-body-text">
          Since we used <strong>centralised variables</strong> for consistency, it was important to perform regression testing 
          with every review request at the branch level before merging to the main design system file. 
        </p>

        <h3>Early collaboration with engineers</h3>
        <p className="cs-body-text">
          Involving engineers from the start ensures that designs are feasible, practical, and technically sound. 
          By addressing feasibility limitations early on, we minimised rework and developed components that adhered 
          to <strong>atomic design standards</strong> and were feasible to be developed whether as native or environment-specific components. 
        </p>

      </div>
    </CaseStudyOverlay>
  );
}
