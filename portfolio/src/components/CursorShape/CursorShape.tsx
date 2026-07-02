import { useEffect, useRef } from 'react'
import './CursorShape.css'

const TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, span, a, li, label, td, th, blockquote'

const ARROW = {
  start: [1.02, 2.21] as [number, number],
  segs: [
    [0.85, 1.38, 1.73, 0.72, 2.47, 1.12],
    [10.75, 5.28, 25.86, 13.61, 25.86, 13.61],
    [26.62, 14.01, 26.54, 15.14, 25.72, 15.43],
    [22.41, 16.61, 15.79, 18.98, 15.79, 18.98],
    [15.23, 19.18, 14.73, 19.55, 14.38, 20.04],
    [12.3, 23.02, 8.16, 28.56, 8.16, 28.56],
    [7.65, 29.26, 6.55, 29.02, 6.37, 28.17],
    [4.59, 19.52, 1.02, 2.21, 1.02, 2.21],
  ] as number[][],
}

const BEAM = {
  start: [2, 1] as [number, number],
  segs: [
    [3.1, 1, 4, 1.45, 4, 2.5],
    [4, 6, 4, 10, 4, 15],
    [4, 20, 4, 24, 4, 27.5],
    [4, 28.55, 3.1, 29, 2, 29],
    [0.9, 29, 0, 28.55, 0, 27.5],
    [0, 24, 0, 20, 0, 15],
    [0, 10, 0, 6, 0, 2.5],
    [0, 1.45, 0.9, 1, 2, 1],
  ] as number[][],
}

const ARROW_OFFSET = [0, 0]
const BEAM_OFFSET = [-1.2, -9]
const ARROW_STROKE = 2
const BEAM_STROKE = 1.2
const DURATION = 200
const LERP_POS = 0.25

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function buildPath(a: any, b: any, t: number) {
  const sx = lerp(a.start[0], b.start[0], t)
  const sy = lerp(a.start[1], b.start[1], t)
  let d = `M${sx.toFixed(2)},${sy.toFixed(2)}`
  for (let i = 0; i < a.segs.length; i++) {
    const sa = a.segs[i]
    const sb = b.segs[i]
    const v = sa.map((val: number, j: number) => lerp(val, sb[j], t).toFixed(2))
    d += `C${v[0]},${v[1]} ${v[2]},${v[3]} ${v[4]},${v[5]}`
  }
  return d + 'Z'
}

export default function CursorShape() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)

  const rawX = useRef(-200)
  const rawY = useRef(-200)
  const sx = useRef(-200)
  const sy = useRef(-200)
  const visible = useRef(false)

  const current = useRef(0)
  const animFrom = useRef(0)
  const animTo = useRef(0)
  const animStart = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)

  // Detect touch / reduced-motion early
  const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  const isTouch = prefersReducedMotion || (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) || window.innerWidth <= 768))

  useEffect(() => {
    if (isTouch) return

    const lazyOn = !!document.querySelector('.lazy-toggle--on')

    function onMouseMove(e: MouseEvent) {
      rawX.current = e.clientX
      rawY.current = e.clientY
      if (!visible.current) {
        sx.current = rawX.current
        sy.current = rawY.current
        visible.current = true
        if (rootRef.current) rootRef.current.style.opacity = '1'
      }
    }

    function onMouseLeave() {
      visible.current = false
      if (rootRef.current) rootRef.current.style.opacity = '0'
    }

    function tick(now: number) {
      const lp = lazyOn ? LERP_POS : 1
      sx.current = lerp(sx.current, rawX.current, lp)
      sy.current = lerp(sy.current, rawY.current, lp)

      // detect text under cursor
      const el = document.elementFromPoint(rawX.current, rawY.current)
      const newIsText = !!el?.closest?.(TEXT_SELECTOR) && !el?.closest?.('.action-icon, .about-shrink-btn, .nav-pills, .cv-wrap, .cc-outer')
      if ((newIsText ? 1 : 0) !== animTo.current) {
        animFrom.current = current.current
        animTo.current = newIsText ? 1 : 0
        animStart.current = performance.now()
      }

      if (animStart.current !== null) {
        const raw = Math.min((now - animStart.current) / DURATION, 1)
        current.current = animFrom.current + (animTo.current - animFrom.current) * easeInOut(raw)
        if (raw >= 1) { current.current = animTo.current; animStart.current = null }
      }

      // update DOM
      if (svgRef.current && pathRef.current && rootRef.current) {
        const ox = lerp(ARROW_OFFSET[0], BEAM_OFFSET[0], current.current)
        const oy = lerp(ARROW_OFFSET[1], BEAM_OFFSET[1], current.current)
        svgRef.current.style.transform = `translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px)`
        pathRef.current.setAttribute('d', buildPath(ARROW, BEAM, current.current))
        pathRef.current.setAttribute('stroke-width', String(lerp(ARROW_STROKE, BEAM_STROKE, current.current).toFixed(2)))
        rootRef.current.style.left = `${Math.round(sx.current)}px`
        rootRef.current.style.top = `${Math.round(sy.current)}px`
      }

      rafId.current = requestAnimationFrame(tick)
    }

    // init
    if (pathRef.current) pathRef.current.setAttribute('d', buildPath(ARROW, BEAM, 0))
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    rafId.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  if (isTouch) return null

  return (
    <div ref={rootRef} className="cs-root" style={{ left: -200, top: -200, opacity: 0 }}>
      <svg ref={svgRef} id="cs-svg" width={17} height={18} viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="cs-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx={0} dy={1} stdDeviation={1} floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>
        <path ref={pathRef} id="cs-path" fill="#333333" stroke="white" strokeWidth={ARROW_STROKE} filter="url(#cs-shadow)" />
      </svg>
    </div>
  )
}
