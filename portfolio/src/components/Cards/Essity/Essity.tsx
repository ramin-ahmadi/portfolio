import {
  Children,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRipple } from "../../useRipple";
import "./Essity.scss";

const HERO_VIDEO_SRC =
  "https://player.vimeo.com/video/1219392750?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1";
const asset = (name: string) => `/src/assets/images/rayo/schedule/${name}`;
const IMG = {
  mockup: asset("schedule-iphone-mockup.png"),
  epic: asset("station-page-epic.png"),
  ia: asset("IA-Explorations.jpg"),
  tree: asset("tree-test-IA.jpg"),
  journey: asset("user-journey-mapping.jpg"),
  know: asset("workshop-what-we-know.png"),
  hub: asset("workshop-station-hub.jpg"),
  needs: asset("user story.jpg"),
  radioA: asset("radio-page-a.png"),
  radioB: asset("radio-page-b.png"),
  radioC: asset("radio-page-c.png"),
  header: asset("prototype-header.png"),
  magicHeader: asset("prototype-header-magic.png"),
  nav: asset("prototype-nav.png"),
  home: asset("station-page-home.png"),
  tracklist: asset("station-page-tracklist.png"),
  shows: asset("station-page-shows.png"),
  schedule: asset("schedule-page.png"),
};
const ICON_EXPAND = "/src/assets/icons/full-screen.svg";
const ICON_SHRINK = "/src/assets/icons/shrink.svg";
const ESSITY_GALLERY_IMAGES = [
  "CreditClaimDetail.jpg",
  "CreateAgreement.jpg",
  "CreatePriceSupportList.jpg",
  "CreateRebateClaim.jpg",
].map((name) => `/src/assets/images/essity/${name}`);

function useResponsiveScale(baseWidth: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState(baseWidth);
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const query = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setContainerW(
        Math.min(baseWidth, Math.max(280, entry.contentRect.width)),
      ),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth]);
  return { ref, containerW, scale: containerW / baseWidth, canHover };
}

function TldrToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="tldr-bar">
      <span
        className="tldr-indicator"
        style={{
          transform: value ? "translateX(calc(100% + 4px))" : "translateX(0)",
        }}
      />
      <button
        className={`tldr-pill ${!value ? "tldr-pill--active" : ""}`}
        type="button"
        onClick={() => onChange(false)}
      >
        Full
      </button>
      <button
        className={`tldr-pill ${value ? "tldr-pill--active" : ""}`}
        type="button"
        onClick={() => onChange(true)}
      >
        TL;DR
      </button>
    </div>
  );
}

function InteractiveTag({ hint }: { hint: string }) {
  return (
    <p className="cs-hint">
      <span className="cc-interactive-tag">Interactive</span>
      {hint}
    </p>
  );
}

const SCHEDULE_CARDS = [
  {
    id: "station-switcher",
    title: "Station switcher",
    desc: "Quickly jump between stations without leaving the schedule.",
    left: 22,
    top: 80,
  },
  {
    id: "local-split",
    title: "Local split",
    desc: "Switch between local splits so listeners always find their regional schedule.",
    left: 486,
    top: 52,
  },
  {
    id: "date-picker",
    title: "Date picker",
    desc: "Scroll back for catch-up or forward to see what’s on next - all from one row of tabs.",
    left: 486,
    top: 198,
  },
  {
    id: "on-air",
    title: "On-air",
    desc: "The live show stands out instantly so listeners can tap and tune in without thinking.",
    left: 22,
    top: 240,
  },
  {
    id: "play-button",
    title: "Play button",
    desc: "One tap to start any show - live or catch-up - straight from the schedule.",
    left: 486,
    top: 360,
  },
];
const SCHEDULE_ZONES = [
  { id: "local-split", left: "84%", top: "5.5%", width: "12%", height: "6%" },
  {
    id: "station-switcher",
    left: "5%",
    top: "13%",
    width: "90%",
    height: "8%",
  },
  { id: "date-picker", left: "2%", top: "22%", width: "96%", height: "7%" },
  { id: "on-air", left: "3%", top: "40%", width: "94%", height: "13%" },
  { id: "play-button", left: "78%", top: "41%", width: "18%", height: "10%" },
];

function ScheduleAntonym() {
  const { ref, containerW, scale, canHover } = useResponsiveScale(680);
  const [active, setActive] = useState<string | null>(null);
  if (!canHover)
    return (
      <div ref={ref} className="cs-responsive-measure">
        <div
          className="cs-antonym-section cs-antonym-section--mobile"
          style={{ width: containerW }}
          aria-hidden="true"
        >
          <div className="cs-antonym-mobile-cards">
            {SCHEDULE_CARDS.map((card) => (
              <div key={card.id} className="cs-antonym-card">
                <p className="cs-antonym-card-title">{card.title}</p>
                <p className="cs-antonym-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="cs-antonym-mobile-screenshot">
            <img
              className="cs-antonym-screenshot"
              src={IMG.schedule}
              alt="Schedule page design"
            />
          </div>
        </div>
      </div>
    );
  return (
    <div ref={ref} className="cs-responsive-measure">
      <div
        className="cs-antonym-section"
        style={{ width: containerW, height: Math.round(580 * scale) }}
        onMouseLeave={() => setActive(null)}
        aria-hidden="true"
      >
        <div
          className="cs-antonym-screenshot-wrap"
          style={{
            left: `calc(50% - ${Math.round((225 * scale) / 2)}px)`,
            top: Math.round(50 * scale),
            width: Math.round(225 * scale),
            height: Math.round(488 * scale),
          }}
        >
          <img
            className="cs-antonym-screenshot"
            src={IMG.schedule}
            alt="Schedule page design"
          />
          {SCHEDULE_ZONES.map((zone) => (
            <div
              key={zone.id}
              className={`cs-antonym-zone ${active === zone.id ? "cs-antonym-zone--active" : ""}`}
              style={{
                position: "absolute",
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
              }}
              onMouseEnter={() => setActive(zone.id)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </div>
        {SCHEDULE_CARDS.map((card) => (
          <div
            key={card.id}
            className="cs-antonym-card-wrapper"
            style={{
              left: Math.round(card.left * scale),
              top: Math.round(card.top * scale),
              width: Math.round(172 * scale),
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
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const viewerRef = useRef<HTMLDivElement | null>(null),
    scrollRef = useRef<HTMLDivElement | null>(null),
    imageRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const metrics = useRef({
    w: 680,
    h: 448,
    naturalW: 1,
    naturalH: 1,
    base: 100,
    max: 632,
    current: 100,
  });
  const [loaded, setLoaded] = useState(false),
    [buttons, setButtons] = useState({ in: false, out: false });
  const position = (width: number, preserve = false) => {
    const scroll = scrollRef.current,
      image = imageRef.current,
      m = metrics.current;
    if (!scroll || !image) return;
    const oldH = (m.current / m.naturalW) * m.naturalH,
      oldX = Math.max(24, (m.w - m.current) / 2),
      oldY = Math.max(24, (m.h - oldH) / 2);
    const cx = (scroll.scrollLeft + m.w / 2) / (m.current + oldX * 2),
      cy = (scroll.scrollTop + m.h / 2) / (oldH + oldY * 2);
    m.current = width;
    const imageH = (width / m.naturalW) * m.naturalH,
      x = Math.max(24, (m.w - width) / 2),
      y = Math.max(24, (m.h - imageH) / 2);
    image.style.width = `${width}px`;
    image.style.margin = `${y}px ${x}px`;
    if (preserve) {
      scroll.scrollLeft = cx * (width + x * 2) - m.w / 2;
      scroll.scrollTop = cy * (imageH + y * 2) - m.h / 2;
    } else {
      scroll.scrollLeft = (scroll.scrollWidth - m.w) / 2;
      scroll.scrollTop = (scroll.scrollHeight - m.h) / 2;
    }
    setButtons({ in: width < m.max - 0.5, out: width > m.base + 0.5 });
  };
  const fit = () => {
    const m = metrics.current;
    if (m.naturalW <= 1) return;
    m.base =
      m.naturalW * Math.min((m.w - 48) / m.naturalW, (m.h - 48) / m.naturalH);
    // Allow large landscape images to grow beyond the viewport after fitting.
    // This keeps the initial image fully visible while making the + control useful.
    m.max = Math.max(m.base, Math.min(m.naturalW, m.base * 3));
    position(m.base);
    setLoaded(true);
  };
  useEffect(() => {
    const viewer = viewerRef.current,
      scroll = scrollRef.current;
    if (!viewer || !scroll) return;
    let timer = 0;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const m = metrics.current,
        next = Math.min(m.max, Math.max(m.base, m.current - event.deltaY * 2));
      if (Math.abs(next - m.current) < 0.1) return;
      if (imageRef.current) imageRef.current.style.transition = "none";
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (imageRef.current) imageRef.current.style.transition = "";
      }, 150);
      position(next, true);
    };
    const observer = new ResizeObserver(([entry]) => {
      metrics.current.w = entry.contentRect.width;
      metrics.current.h = entry.contentRect.height;
      fit();
    });
    scroll.addEventListener("wheel", wheel, { passive: false });
    observer.observe(viewer);
    return () => {
      clearTimeout(timer);
      scroll.removeEventListener("wheel", wheel);
      observer.disconnect();
    };
    // The viewer owns imperative sizing state so pinch zoom does not re-render every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const zoom = (direction: 1 | -1) => {
    const m = metrics.current;
    position(
      Math.min(
        m.max,
        Math.max(m.base, m.current + ((m.max - m.base) / 3) * direction),
      ),
      true,
    );
  };
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroll = scrollRef.current;
    if (!scroll || !buttons.out) return;
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroll.scrollLeft,
      scrollTop: scroll.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroll = scrollRef.current;
    const current = drag.current;
    if (!scroll || !current.active || current.pointerId !== event.pointerId)
      return;
    event.preventDefault();
    scroll.scrollLeft = current.scrollLeft - (event.clientX - current.startX);
    scroll.scrollTop = current.scrollTop - (event.clientY - current.startY);
  };
  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId)
      return;
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return (
    <div ref={viewerRef} className="cs-zoom-viewer cs-cover-img">
      <div
        ref={scrollRef}
        className={`cs-zoom-scroll ${buttons.out ? "cs-zoom-scroll--draggable" : ""}`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="cs-zoom-img"
          draggable={false}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={(e) => {
            metrics.current.naturalW = e.currentTarget.naturalWidth;
            metrics.current.naturalH = e.currentTarget.naturalHeight;
            fit();
          }}
        />
      </div>
      <div className="cs-zoom-controls">
        <button
          className={`cs-zoom-btn ${!buttons.in ? "cs-zoom-btn--disabled" : ""}`}
          type="button"
          onClick={() => zoom(1)}
          disabled={!buttons.in}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className={`cs-zoom-btn ${!buttons.out ? "cs-zoom-btn--disabled" : ""}`}
          type="button"
          onClick={() => zoom(-1)}
          disabled={!buttons.out}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
}

const MIRO_BOARDS = [
  { src: IMG.know, x: 40, y: 40, w: 825, h: 1576, alt: "What we know so far" },
  {
    src: IMG.hub,
    x: 920,
    y: 40,
    w: 1350,
    h: 1172,
    alt: "What is the Station Hub",
  },
  {
    src: IMG.needs,
    x: 920,
    y: 1270,
    w: 1350,
    h: 960,
    alt: "User needs and user stories",
  },
];

function MiroBoard() {
  const viewerRef = useRef<HTMLDivElement | null>(null),
    scrollRef = useRef<HTMLDivElement | null>(null),
    wrapperRef = useRef<HTMLDivElement | null>(null),
    canvasRef = useRef<HTMLDivElement | null>(null);
  const metrics = useRef({ w: 680, h: 448, base: 0.2, max: 1, current: 0.2 }),
    animation = useRef<number | null>(null);
  const loadCount = useRef(0),
    loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false),
    [buttons, setButtons] = useState({ in: false, out: false });
  const position = (scale: number, preserve = false) => {
    const scroll = scrollRef.current,
      wrapper = wrapperRef.current,
      canvas = canvasRef.current,
      m = metrics.current;
    if (!scroll || !wrapper || !canvas) return;
    const oldW = 2340 * m.current,
      oldH = 2290 * m.current,
      oldX = Math.max(24, (m.w - oldW) / 2),
      oldY = Math.max(24, (m.h - oldH) / 2);
    const cx = (scroll.scrollLeft + m.w / 2) / (oldW + oldX * 2),
      cy = (scroll.scrollTop + m.h / 2) / (oldH + oldY * 2);
    m.current = scale;
    const w = 2340 * scale,
      h = 2290 * scale,
      x = Math.max(24, (m.w - w) / 2),
      y = Math.max(24, (m.h - h) / 2);
    canvas.style.transform = `scale(${scale})`;
    wrapper.style.width = `${w}px`;
    wrapper.style.height = `${h}px`;
    wrapper.style.margin = `${y}px ${x}px`;
    if (preserve) {
      scroll.scrollLeft = cx * (w + x * 2) - m.w / 2;
      scroll.scrollTop = cy * (h + y * 2) - m.h / 2;
    } else {
      scroll.scrollLeft = (scroll.scrollWidth - m.w) / 2;
      scroll.scrollTop = (scroll.scrollHeight - m.h) / 2;
    }
    setButtons({ in: scale < m.max - 0.001, out: scale > m.base + 0.001 });
  };
  const fit = () => {
    const m = metrics.current;
    m.base = Math.min((m.w - 48) / 2340, (m.h - 48) / 2290);
    m.max = m.base * 5;
    position(m.base);
    loadedRef.current = true;
    setLoaded(true);
  };
  useEffect(() => {
    const viewer = viewerRef.current,
      scroll = scrollRef.current;
    if (!viewer || !scroll) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      if (animation.current) cancelAnimationFrame(animation.current);
      const m = metrics.current;
      position(
        Math.min(m.max, Math.max(m.base, m.current - event.deltaY * 0.002)),
        true,
      );
    };
    const observer = new ResizeObserver(([entry]) => {
      metrics.current.w = entry.contentRect.width;
      metrics.current.h = entry.contentRect.height;
      if (loadedRef.current) fit();
    });
    scroll.addEventListener("wheel", wheel, { passive: false });
    observer.observe(viewer);
    return () => {
      scroll.removeEventListener("wheel", wheel);
      observer.disconnect();
      if (animation.current) cancelAnimationFrame(animation.current);
    };
    // The canvas uses refs for animation-frame updates and only exposes button state to React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const zoom = (direction: 1 | -1) => {
    const m = metrics.current,
      ratio = Math.pow(5, 0.25),
      target = Math.min(
        m.max,
        Math.max(m.base, direction > 0 ? m.current * ratio : m.current / ratio),
      ),
      start = m.current,
      time = performance.now();
    if (animation.current) cancelAnimationFrame(animation.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - time) / 300),
        eased = 1 - Math.pow(1 - p, 3);
      position(start + (target - start) * eased, true);
      animation.current = p < 1 ? requestAnimationFrame(tick) : null;
    };
    animation.current = requestAnimationFrame(tick);
  };
  return (
    <div
      ref={viewerRef}
      className="cs-miro-viewer cs-cover-img"
      aria-hidden="true"
    >
      <div ref={scrollRef} className="cs-miro-scroll">
        <div ref={wrapperRef} className="cs-miro-wrapper">
          <div
            ref={canvasRef}
            className="cs-miro-canvas"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            {MIRO_BOARDS.map((board) => (
              <img
                key={board.src}
                src={board.src}
                alt={board.alt}
                draggable={false}
                className="cs-miro-board"
                onLoad={() => {
                  loadCount.current += 1;
                  if (loadCount.current >= MIRO_BOARDS.length) fit();
                }}
                style={{
                  position: "absolute",
                  left: board.x,
                  top: board.y,
                  width: board.w,
                  height: board.h,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="cs-zoom-controls">
        <button
          className={`cs-zoom-btn ${!buttons.in ? "cs-zoom-btn--disabled" : ""}`}
          type="button"
          tabIndex={-1}
          onClick={() => zoom(1)}
          disabled={!buttons.in}
        >
          +
        </button>
        <button
          className={`cs-zoom-btn ${!buttons.out ? "cs-zoom-btn--disabled" : ""}`}
          type="button"
          tabIndex={-1}
          onClick={() => zoom(-1)}
          disabled={!buttons.out}
        >
          −
        </button>
      </div>
    </div>
  );
}

function ProtoPhone({
  src,
  alt,
  header = IMG.header,
}: {
  src: string;
  alt: string;
  header?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const scroll = ref.current;
    if (!scroll) return;
    let startY = 0;
    const onScroll = () => {
      if (scroll.scrollTop < 0) scroll.scrollTop = 0;
      setVisible(scroll.scrollTop > 8);
    };
    const wheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && scroll.scrollTop <= 0) e.preventDefault();
    };
    const start = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const move = (e: TouchEvent) => {
      if ((e.touches[0]?.clientY ?? 0) - startY > 0 && scroll.scrollTop <= 0)
        e.preventDefault();
    };
    scroll.addEventListener("scroll", onScroll, { passive: true });
    scroll.addEventListener("wheel", wheel, { passive: false });
    scroll.addEventListener("touchstart", start, { passive: true });
    scroll.addEventListener("touchmove", move, { passive: false });
    return () => {
      scroll.removeEventListener("scroll", onScroll);
      scroll.removeEventListener("wheel", wheel);
      scroll.removeEventListener("touchstart", start);
      scroll.removeEventListener("touchmove", move);
    };
  }, []);
  return (
    <div
      className={`cs-proto-phone cs-proto-phone-${alt.replace(/\s+/g, "-")}`}
      aria-hidden="true"
    >
      <img
        src={header}
        alt="App header"
        className={`cs-proto-header ${visible ? "cs-proto-header--visible" : ""}`}
        draggable={false}
      />
      <div ref={ref} className="cs-proto-scroll">
        <img src={src} alt={alt} className="cs-proto-img" draggable={false} />
      </div>
      <img
        src={IMG.nav}
        alt="App navigation"
        className="cs-proto-nav"
        draggable={false}
      />
    </div>
  );
}

function CaseStudyOverlay({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false),
    [closing, setClosing] = useState(false),
    [wasOpen, setWasOpen] = useState(false),
    [top, setTop] = useState(false);
  const inner = useRef<HTMLDivElement | null>(null),
    { spawnRipple, renderRipples } = useRipple();
  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setTop(false);
    }, 450);
  };
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div className="cs-card-wrapper">
      <div
        className={`bento-card schedule-card ${open ? "cs-card--ghost" : ""} ${wasOpen ? "cs-card--was-open" : ""}`}
        data-tooltip={
          "Transforming customer exprience\nEssity Australia"
        }
        onClick={() => {
          setWasOpen(true);
          setClosing(false);
          setOpen(true);
        }}
      >
        <iframe
          className="schedule-video"
          src={HERO_VIDEO_SRC}
          title="Rayo schedule preview"
          allow="autoplay; fullscreen; picture-in-picture"
          tabIndex={-1}
        />
        <span className="action-icon" aria-hidden="true">
          <img src={ICON_EXPAND} alt="" />
        </span>
      </div>
      {open ? (
        <>
          <div
            className={`cs-backdrop ${closing ? "cs-backdrop--out" : ""}`}
            onClick={close}
          />
          <div
            className={`cs-expanded cs-expanded--settled ${closing ? "cs-expanded--closing" : ""}`}
            style={{ left: 0, top: 0, width: "100vw", height: "100vh" }}
            onClick={spawnRipple}
          >
            <div className="cs-header">
              <button
                className="cs-header-close"
                type="button"
                data-tooltip="Press Esc to exit fullscreen"
                aria-label="Close case study"
                onClick={close}
              >
                <img src={ICON_SHRINK} alt="" />
              </button>
            </div>
            <div
              ref={inner}
              className="cs-expanded-inner"
              onScroll={(e) => setTop(e.currentTarget.scrollTop > 600)}
            >
              <div className="cs-expanded-content">
                <iframe
                  className="cs-hero-video essity-hero-video"
                  src={HERO_VIDEO_SRC}
                  title="Rayo schedule case study"
                  allow="autoplay; fullscreen; picture-in-picture"
                  tabIndex={-1}
                  style={{ width: 448, height: 448 }}
                />
                {children}
              </div>
            </div>
            <button
              className={`cs-back-to-top ${top ? "cs-back-to-top--visible" : ""}`}
              type="button"
              aria-label="Back to top"
              onClick={() =>
                inner.current?.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {renderRipples()}
          </div>
        </>
      ) : null}
    </div>
  );
}

const Cover = ({
  src,
  alt,
  full,
  style,
}: {
  src: string;
  alt: string;
  full?: boolean;
  style?: CSSProperties;
}) => (
  <img
    className={`cs-cover-img ${full ? "cs-cover-img--full" : ""}`}
    src={src}
    alt={alt}
    style={style}
  />
);
const Hint = ({ children }: { children: ReactNode }) => (
  <p className="cs-hint">{children}</p>
);
const Section = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="cs-body cs-body--continued">
    {title ? <h2 className="cs-section-title">{title}</h2> : null}
    {children}
  </div>
);

function EssityDesignGallery() {
  return (
    <div
      className="essity-design-gallery"
      aria-label="Essity high-fidelity designs"
    >
      <div className="essity-design-gallery__background" aria-hidden="true">
        {ESSITY_GALLERY_IMAGES.map((src) => (
          <img
            className="essity-design-gallery__background-image"
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            key={src}
          />
        ))}
      </div>
      <img
        className="cs-cover-img essity-design-gallery__mockup"
        data-scroll-reveal
        src="/src/assets/images/essity/mockup.png"
        alt="Essity digital platform shown across desktop and mobile devices"
        width={1000}
        height={667}
      />
    </div>
  );
}

export default function Essity() {
  const { canHover } = useResponsiveScale(680);
  const [tldr, setTldr] = useState(false),
    [dark, setDark] = useState(
      () => document.documentElement.dataset.theme === "dark",
    );
  const full = (...nodes: ReactNode[]) => (
    <div
      className={`tldr-collapsible ${tldr ? "tldr-collapsible--hidden" : ""}`}
    >
      <div>{Children.toArray(nodes)}</div>
    </div>
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.dataset.theme === "dark"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <CaseStudyOverlay>
      <TldrToggle value={tldr} onChange={setTldr} />
      <div className="cs-body">
        <h1 className="cs-title">
          Transforming customer experience <br></br>Essity Australia
        </h1>
        {full(
          <p className="cs-body-text">
            Understanding people, processes, and designing better exprience.
          </p>,
        )}
        <h2 className="cs-section-title">My role</h2>
        <p className="cs-body-text">UI/UX manager</p>
        <h2 className="cs-section-title">Impact</h2>
        <h3 className="cs-subsection-title">Award winning project</h3>
        {full(
          <p className="cs-body-text">
            This project was awarded SAP’s Best CX 2021 for Australia and New Zealand and resulted in FAIR being named <a href="https://news.sap.com/australia/2021/05/19/sap-australia-and-new-zealand-recognises-top-partners/" target="_blank" rel="noopener noreferrer">partner of the year</a>.
          </p>,
        )}
        <h3 className="cs-subsection-title">
          Customer exprience improvements
        </h3>
        {full(
          <p className="cs-body-text">
            Improved first contact resolution rate. <br></br>
            Reduction in customer ticket volumes, reducing operational bottlenecks. <br></br>
            Decreased resolution times, boosting overall customer satisfaction.
          </p>,
        )}
        <h3 className="cs-subsection-title">
          Design processes
        </h3>
        {full(
          <p className="cs-body-text">
            User research<br></br>
            Stakeholder interviews<br></br>
            Affinity mapping<br></br>
            Personas<br></br>
            Journey mapping<br></br>
            Feature prioritasation<br></br>
            Lo-fi & hi-fi designs<br></br>
            Usability testing<br></br>
            Accessibility testing<br></br>
          </p>,
        )}

      </div>
      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/essity/essity.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-hint">Essity project set out to create a B2B and B2C platform that simplified bulk purchasing while bringing sales, inventory, invoicing, pricing and contract management into one system.</p>

      <Section title="Problem">
        <p className="cs-body-text">
          Essity’s distributors often struggled to get a clear picture of what was happening with their orders. Changes to stock ETAs, deliveries and pricing agreements weren’t always communicated clearly, and even simple questions could take days to resolve. With no clear ownership or response time, distributors were often left chasing Essity for answers.
        </p>
        <p className="cs-body-text">
          Behind the scenes, many of the processes supporting these relationships were still manual. Price support, stock management and delivery tracking relied heavily on spreadsheets, creating conflicting sources of information and making mistakes difficult to avoid. When stock or delivery dates changed, those updates didn’t always reach the people who needed them.
        </p>
        <p className="cs-body-text">
          Contracts added another layer of complexity. Agreements were spread across different systems and spreadsheets, making it difficult to keep track of terms, conditions and expiry dates. Price support agreements were particularly difficult to manage, and miscalculations could quickly turn into disputes with distributors.
        </p>
        <p className="cs-body-text">
          It became clear that Essity needed more than a series of process fixes. It needed a shared system that could bring these workflows together, create a reliable source of truth, and give both Essity and its distributors clearer visibility across their relationship.
        </p>
      </Section>
      <Section title="The process">
        {full(
          <p className="cs-body-text">
            I used a custom method based on Design Thinking and SAP's Digital Transformation Framework to seamlessly incorporate the essential phases of discovery, definition, ideation, validation, and implementation into the project. This approach ensured that user needs remained at the forefront while adhering to the project's defined budget and timeline as consultants.
          </p>,
        )}
      </Section>
      <ZoomableImage
        src="/src/assets/images/essity/process.png"
        alt="Essity design and digital transformation process"
      />
      <InteractiveTag hint="Digital transformation process" />

      <Section title="User personas">
        {full(
          <p className="cs-body-text">
            Over several weeks, the design team worked through a series of
            research and discovery activities, each adding a layer of
            understanding.
          </p>,
          <p className="cs-body-text">
            Following the customer interviews, we found that while many different roles were involved, they were often trying to achieve the same things and facing similar challenges. Rather than creating a persona for every job title, we grouped people around their shared goals and created mission-based personas that better reflected how they actually used the system.
          </p>,
        )}
      </Section>
      <ZoomableImage
        src="/src/assets/images/essity/persona.png"
        alt="User persona for the project"
      />
      <InteractiveTag hint="User persona for the project" />
      <Section title="User journey maps">
        {full(
          <p className="cs-body-text">
            We used user journey maps to plot users’ experience across 15 processes to identify areas for improvement. Processes were categorised from the perspective of a particular persona.
            Based on my interviews, we identified 4 journeys.
          </p>,
        )}
      </Section>

      <ZoomableImage
        src="/src/assets/images/essity/journeymap.png"
        alt="User journey maps"
      />
      <InteractiveTag hint="User journey maps" />

      <Section title="Product vision">
        {full(
          <h3 className="cs-subsection-title">Order & contract management</h3>,
          <p className="cs-body-text">
            Give distributors one place to manage their orders and contracts, reducing the time spent chasing information and making day-to-day work with Essity easier.
          </p>,
          <h3 className="cs-subsection-title">Credit claim management</h3>,
          <p className="cs-body-text">
            Make raising and resolving claims faster and easier to follow, reducing disputes and giving distributors more confidence in the process.
          </p>,
          <h3 className="cs-subsection-title">Price support</h3>,
          <p className="cs-body-text">
            Create a clearer way to manage price support agreements, giving distributors consistent pricing information while reducing the administrative work for both sides.
          </p>,
          <h3 className="cs-subsection-title">Rebate management</h3>,
          <p className="cs-body-text">
            Rebate management
            Give distributors a simple way to track and manage their rebates, helping ensure accurate payments and better visibility over their cash flow.
          </p>,
        )}
      </Section>

      <Section title="Ideation and feasibility">
        {full(
          <p className="cs-body-text">
            SAP’s existing architecture meant we couldn’t design without constraints. I worked closely with our solution architect and engineering team to understand what was possible, then used regular stakeholder workshops to shape ideas that balanced user needs, business goals and technical feasibility.
          </p>,
        )}
      </Section>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/essity/ideation.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-hint">Screenshot of a Miro workshop where I worked through ideas with the business stakeholders and the engineering team.</p>

      <Section title="Low fidelity wireframes and usability testing">
        {full(
          <p className="cs-body-text">
            I turned our workshop ideas into early concepts in Figma, using feedback and notes captured in Miro to guide the designs. Then I worked closely with the solution architect and business analysts to make sure what we designed could realistically be built within SAP.
          </p>,
          <p className="cs-body-text">
            I then ran remote moderated usability testing through Loop11 with four distributors across five key tasks. I looked at where people clicked first, where they hesitated and how long tasks took to understand where the experience was getting in their way.
          </p>,
          <p className="cs-body-text">
            I brought the findings back to Essity and the delivery team, using them to agree on what needed to change before moving into implementation.
          </p>,
        )}
      </Section>

      <img
        className="cs-cover-img"
        data-scroll-reveal
        src="/src/assets/images/essity/usability-testing.png"
        alt="A five-stage journey mapping"
      />
      <p className="cs-hint">Example of incorporating user feedback into low fidelity designs.</p>


      <Section title="High fidelity designs">
        {full(
        )}
      </Section>

      <EssityDesignGallery />

      <Section title="Accessibility">
        {full(
          <p className="cs-body-text">
            Designing accessible digital experiences is critical to ensuring inclusivity for all users, including those with disabilities. For Essity Australia, adhering to WCAG 2.0 accessibility standards was not just a compliance requirement, it was a commitment to delivering a customer centric platform for a wide range of users.
          </p>,
           <h3 className="cs-subsection-title">Colour palette compatibility</h3>,
          <p className="cs-body-text">
            The primary branding colour, pink, did not meet accessibility standards for colour contrast, requiring extensive effort to balance corporate identity with compliant design.
          </p>,
                     <h3 className="cs-subsection-title">Complex navigatio</h3>,
          <p className="cs-body-text">
            Designing accessible menus and multi-level navigation that can cater for e-commerce and account functionalities required significant effort to ensure clarity. 
          </p>,
                               <h3 className="cs-subsection-title">Data heavy interfaces</h3>,
          <p className="cs-body-text">
            Visualising complex tables in an accessible manner limited creative freedom while demanding meticulous attention to detail.
          </p>,
            <h3 className="cs-subsection-title">Responsive design</h3>,
          <p className="cs-body-text">
             Maintaining accessibility across devices required careful adjustments, particularly for tablet users, who make up the majority of the customer support team engaging with complex B2B workflows.
          </p>,

        )}
      </Section>

           <Section title="Key takeaways">
        {full(

           <h3 className="cs-subsection-title">Strategic planning for an MVP</h3>,
          <p className="cs-body-text">
            Creating a clear strategic plan to launch an MVP ensures focus on delivering a quality product within time constraints. This approach also helps manage out-of-scope requests effectively, preventing them from derailing the project.
          </p>,
                     <h3 className="cs-subsection-title">The Importance of user testing</h3>,
          <p className="cs-body-text">
           User testing is vital throughout the entire design process. Applying insights learned during my Master's in UX, I consistently sought feedback to refine the user experience and ensure the final product truly met users’ needs.
          </p>,
                               <h3 className="cs-subsection-title">Early collaboration with engineers</h3>,
          <p className="cs-body-text">
            Involving engineers from the start ensures that designs are feasible, practical, and technically sound. By addressing feasibility limitations early on, we minimised rework and developed solutions that effectively addressed user needs while staying within architectural  constraints within SAP systems.
          </p>,


        )}
      </Section>


    </CaseStudyOverlay>
  );
}
