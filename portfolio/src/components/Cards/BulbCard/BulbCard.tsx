import { useEffect, useRef, useState } from "react";
import { useRipple } from "../../useRipple";

const NUM_RAYS = 12;
const RAY_DELAYS = [
  0, 0.72, 0.28, 1.05, 0.51, 0.18, 0.88, 0.42, 0.63, 0.95, 0.35, 0.77,
];

const TOGGLE_ANIM = {
  v: "5.6.5",
  fr: 30,
  ip: 0,
  op: 15,
  w: 32,
  h: 32,
  nm: "toggle",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "toggle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [16, 16, 0], ix: 2 },
        a: { a: 0, k: [12, 12, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [-1.657, 0],
                    [0, -1.657],
                    [1.657, 0],
                    [0, 1.657],
                  ],
                  o: [
                    [1.657, 0],
                    [0, 1.657],
                    [-1.657, 0],
                    [0, -1.657],
                  ],
                  v: [
                    [0, -3],
                    [3, 0],
                    [0, 3],
                    [-3, 0],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "st",
              c: { a: 0, k: [0, 0, 0, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 2, ix: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false,
            },
            {
              ty: "tr",
              p: {
                a: 1,
                k: [
                  {
                    i: { x: 0.337, y: 1 },
                    o: { x: 0.666, y: 0 },
                    t: 0,
                    s: [8, 12],
                    to: [1.333, 0],
                    ti: [-1.333, 0],
                  },
                  { t: 15, s: [16, 12] },
                ],
                ix: 2,
              },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "circle",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [
                    [-3.866, 0],
                    [0, 0],
                    [0, -3.866],
                    [3.866, 0],
                    [0, 0],
                    [0, 3.866],
                  ],
                  o: [
                    [0, 0],
                    [3.866, 0],
                    [0, 3.866],
                    [0, 0],
                    [-3.866, 0],
                    [0, -3.866],
                  ],
                  v: [
                    [-4, -7],
                    [4, -7],
                    [11, 0],
                    [4, 7],
                    [-4, 7],
                    [-11, 0],
                  ],
                  c: true,
                },
                ix: 2,
              },
              nm: "Path 1",
              mn: "ADBE Vector Shape - Group",
              hd: false,
            },
            {
              ty: "st",
              c: { a: 0, k: [0, 0, 0, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 2, ix: 5 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false,
            },
            {
              ty: "tr",
              p: { a: 0, k: [12, 12], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "toggle",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 2,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 15,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
} as const;

type LottieAnimationHandle = {
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  setDirection: (direction: number) => void;
  goToAndPlay: (frame: number, isFrame?: boolean) => void;
};

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (config: {
        container: Element;
        renderer: "svg";
        loop: boolean;
        autoplay: boolean;
        animationData: unknown;
      }) => LottieAnimationHandle;
    };
  }
}

export default function BulbCard() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  const lottieEl = useRef<HTMLDivElement | null>(null);
  const lottieAnim = useRef<LottieAnimationHandle | null>(null);
  const { spawnRipple, renderRipples } = useRipple();

  useEffect(() => {
    if (!window.lottie || !lottieEl.current) return;

    lottieAnim.current = window.lottie.loadAnimation({
      container: lottieEl.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      animationData: TOGGLE_ANIM,
    });

    lottieAnim.current.goToAndStop(isDark ? 14 : 0, true);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "";

    if (lottieAnim.current) {
      lottieAnim.current.setDirection(next ? 1 : -1);
      lottieAnim.current.goToAndPlay(next ? 0 : 14, true);
    }
  }

  return (
    <div
      className={`bento-card bulb-card ${isDark ? "is-dark" : ""}`}
      onClick={(event) => {
        toggleTheme();
        spawnRipple(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleTheme();
        }
      }}
      role="button"
      tabIndex={0}
      data-tooltip={
        isDark ? "Switch to light mode ☀️" : "Switch to dark mode 🌙"
      }
    >
      <div className="action-icon">
        <div className="bulb-lottie" ref={lottieEl} >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", transform: "translate3d(0px, 0px, 0px)", contentVisibility: "visible" }}
            >
            <defs>
                <clipPath id="__lottie_element_7">
                <rect width="32" height="32" x="0" y="0"></rect>
                </clipPath>
            </defs>
            <g clipPath="url(#__lottie_element_7)">
                <g
                transform="matrix(1,0,0,1,4,4)"
                opacity="1"
                style={{ display: "block" }}
                >
                <g opacity="1" transform="matrix(1,0,0,1,12,12)">
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fillOpacity="0"
                    stroke="rgb(0,0,0)"
                    strokeOpacity="1"
                    strokeWidth="2"
                    d=" M-4,-7 C-4,-7 4,-7 4,-7 C7.866000175476074,-7 11,-3.865999937057495 11,0 C11,3.865999937057495 7.866000175476074,7 4,7 C4,7 -4,7 -4,7 C-7.866000175476074,7 -11,3.865999937057495 -11,0 C-11,-3.865999937057495 -7.866000175476074,-7 -4,-7z"
                    ></path>
                </g>
                <g opacity="1" transform="matrix(1,0,0,1,8,12)">
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fillOpacity="0"
                    stroke="rgb(0,0,0)"
                    strokeOpacity="1"
                    strokeWidth="2"
                    d=" M0,-3 C1.656999945640564,-3 3,-1.656999945640564 3,0 C3,1.656999945640564 1.656999945640564,3 0,3 C-1.656999945640564,3 -3,1.656999945640564 -3,0 C-3,-1.656999945640564 -1.656999945640564,-3 0,-3z"
                    ></path>
                </g>
                </g>
            </g>
            </svg>
        </div>
      </div>

      <div className="icon-wrap">
        <div className={isDark ? "sun hidden" : "sun"}>
          {Array.from({ length: NUM_RAYS }, (_, index) => (
            <div
              key={index}
              className="ray-arm"
              style={{ transform: `rotate(${index * (360 / NUM_RAYS)}deg)` }}
            >
              <div
                className="ray-bar"
                style={{ animationDelay: `${RAY_DELAYS[index]}s` }}
              />
            </div>
          ))}
          <div className="sun-circle" />
        </div>

        <div className={isDark ? "moon visible" : "moon"}>
          <div className="moon-stars">
            <div className="mstar" />
            <div className="mstar" />
            <div className="mstar" />
          </div>
          <div className="moon-shape" />
        </div>
      </div>

      {renderRipples()}
    </div>
  );
}
