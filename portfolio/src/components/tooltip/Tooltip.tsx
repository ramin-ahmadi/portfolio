import { useEffect, useRef, useState } from 'react'
import './Tooltip.css'

const CHAR_DELAY_MS = 18
const LERP_FACTOR = 0.07

export default function CursorTooltip() {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  const fullText = useRef('')
  const charIndex = useRef(0)
  const typeTimer = useRef<number | null>(null)
  const currentTarget = useRef<EventTarget | null>(null)

  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const smoothX = useRef(0)
  const smoothY = useRef(0)
  const rafId = useRef<number | null>(null)

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

  function animLoop() {
    const hasSmooth = !!document.querySelector('.lazy-toggle--on')
    const lf = hasSmooth ? LERP_FACTOR : 1
    smoothX.current = lerp(smoothX.current, mouseX.current, lf)
    smoothY.current = lerp(smoothY.current, mouseY.current, lf)
    setX(smoothX.current)
    setY(smoothY.current)
    rafId.current = requestAnimationFrame(animLoop)
  }

  function startTyping(text: string) {
    if (typeTimer.current) { window.clearTimeout(typeTimer.current); typeTimer.current = null }
    fullText.current = text || ''
    charIndex.current = 0
    setDisplayed('')
    setVisible(true)
    tick()
  }

  function tick() {
    if (charIndex.current < fullText.current.length) {
      charIndex.current += 1
      setDisplayed(fullText.current.slice(0, charIndex.current))
      typeTimer.current = window.setTimeout(tick, CHAR_DELAY_MS)
    }
  }

  function hide() {
    if (typeTimer.current) { window.clearTimeout(typeTimer.current); typeTimer.current = null }
    setVisible(false)
    setDisplayed('')
    currentTarget.current = null
  }

  function onMouseMove(e: MouseEvent) {
    mouseX.current = e.clientX
    mouseY.current = e.clientY

    const el = (e.target as Element)?.closest?.('[data-tooltip]') ?? null

    if (el !== currentTarget.current) {
      currentTarget.current = el
      if (el) {
        startTyping((el as HTMLElement).dataset.tooltip || '')
      } else {
        hide()
      }
    } else if (el && (el as HTMLElement).dataset.tooltip !== fullText.current) {
      startTyping((el as HTMLElement).dataset.tooltip || '')
    }
  }

  function onMouseLeave() { hide() }

  useEffect(() => {
    const prefersReducedMotion = typeof matchMedia !== 'undefined'
      && matchMedia('(prefers-reduced-motion: reduce)').matches

    const isTouch = prefersReducedMotion
      || 'ontouchstart' in window
      || navigator.maxTouchPoints > 0
      || (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches)
      || window.innerWidth <= 768

    if (isTouch) return

    smoothX.current = window.innerWidth / 2
    smoothY.current = window.innerHeight / 2
    mouseX.current = smoothX.current
    mouseY.current = smoothY.current

    rafId.current = requestAnimationFrame(animLoop)
    window.addEventListener('mousemove', onMouseMove)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (typeTimer.current) window.clearTimeout(typeTimer.current)
      if (rafId.current) cancelAnimationFrame(rafId.current)
      window.removeEventListener('mousemove', onMouseMove)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  const offset = 24
  const maxLineLen = Math.max(...displayed.split('\n').map(l => l.length))
  const pillW = maxLineLen * 10.5 + 32
  const clampedX = Math.min(x + offset, window.innerWidth - pillW - 8)
  const clampedY = y + offset

  return (
    <div className="cursor-tooltip" style={{ left: `${clampedX}px`, top: `${clampedY}px` }}>
      {displayed}
    </div>
  )
}
