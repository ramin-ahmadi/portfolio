import './Nav.css'
import { useState, useRef, useEffect, useCallback } from 'react'

const NAV_ITEMS = ['All', 'About me', 'Work', 'Fun']

export default function Nav() {
    const [activePill, setActivePill] = useState('All')
    const [indicatorStyle, setIndicatorStyle] = useState({ left: '0px', width: '0px' })
    const [hoverStyle, setHoverStyle] = useState({ left: '0px', width: '0px', opacity: 0 })
    const [indicatorReady, setIndicatorReady] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [stretchTransform, setStretchTransform] = useState('')
    const [isInstant, setIsInstant] = useState(false)
    const [pathD, setPathD] = useState<string>('')
    const [labelFading, setLabelFading] = useState(false)
    
    const pillsRef = useRef<HTMLDivElement>(null)
    const pillEls = useRef<HTMLAnchorElement[]>([])

    // Morphing icon setup (inspired by provided Vue code)
    const WAVE = {
        start: [3, 12],
        segs: [
            [4, 10.5, 5, 9.75, 6, 9.75],
            [7, 9.75, 8, 10.5, 9, 12],
            [10, 13.5, 11, 14.25, 12, 14.25],
            [13, 14.25, 14, 13.5, 15, 12],
            [16, 10.5, 17, 9.75, 18, 9.75],
            [19, 9.75, 20, 10.5, 21, 12],
        ],
    }

    const BOLT = {
        start: [13, 2],
        segs: [
            [10.17, 5.5, 7.33, 9, 4.5, 12.5],
            [6.67, 12.5, 8.83, 12.5, 11, 12.5],
            [10.67, 15.67, 10.33, 18.83, 10, 22],
            [12.83, 18.5, 15.67, 15, 18.5, 11.5],
            [16.33, 11.5, 14.17, 11.5, 12, 11.5],
            [12.33, 8.33, 12.67, 5.17, 13, 2],
        ],
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
    function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

    function buildPath(a: any, b: any, t: number) {
        const sx = lerp(a.start[0], b.start[0], t)
        const sy = lerp(a.start[1], b.start[1], t)
        let d = `M${sx.toFixed(2)},${sy.toFixed(2)}`
        for (let i = 0; i < a.segs.length; i++) {
            const sa = a.segs[i], sb = b.segs[i]
            const v = sa.map((val: number, j: number) => lerp(val, sb[j], t).toFixed(2))
            d += `C${v[0]},${v[1]} ${v[2]},${v[3]} ${v[4]},${v[5]}`
        }
        return d
    }

    const MORPH_MS = 300

    const morphT = useRef<number>(isInstant ? 1 : 0)
    const morphFrom = useRef<number>(morphT.current)
    const morphTo = useRef<number>(morphT.current)
    const morphStart = useRef<number | null>(null)
    const rafId = useRef<number | null>(null)

    useEffect(() => {
        // initialize path
        setPathD(buildPath(WAVE, BOLT, morphT.current))

        function tick(now: number) {
            if (morphStart.current !== null) {
                const raw = Math.min((now - morphStart.current) / MORPH_MS, 1)
                const eased = easeInOut(raw)
                morphT.current = morphFrom.current + (morphTo.current - morphFrom.current) * eased
                setPathD(buildPath(WAVE, BOLT, morphT.current))
                if (raw >= 1) { morphT.current = morphTo.current; morphStart.current = null }
            }
            rafId.current = requestAnimationFrame(tick)
        }
        rafId.current = requestAnimationFrame(tick)
        return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onToggle = useCallback(() => {
        setLabelFading(true)
        const newIsInstant = !isInstant
        setIsInstant(newIsInstant)

        morphFrom.current = morphT.current
        morphTo.current = newIsInstant ? 1 : 0
        morphStart.current = performance.now()

        setTimeout(() => { setLabelFading(false) }, 100)
    }, [isInstant])

    const getElMetrics = useCallback((item: string) => {
        const container = pillsRef.current
        if (!container) return null
        const idx = NAV_ITEMS.indexOf(item)
        const el = pillEls.current[idx]
        if (!el) return null
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        return {
            left: elRect.left - containerRect.left,
            width: elRect.width,
            centerX: (elRect.left - containerRect.left) + elRect.width / 2,
        }
    }, [])

    const updateIndicator = useCallback((skipTransition = false, pill = activePill) => {
        const m = getElMetrics(pill)
        if (!m) return
        setIndicatorStyle({
            left: `${m.left}px`,
            width: `${m.width}px`,
        })
        if (!skipTransition) setIndicatorReady(true)
    }, [activePill, getElMetrics])

    useEffect(() => {
        // Wait for DOM to be fully painted before measuring
        const timer1 = requestAnimationFrame(() => {
            updateIndicator(true)
            const timer2 = requestAnimationFrame(() => {
                setIndicatorReady(true)
            })
            return () => cancelAnimationFrame(timer2)
        })
        return () => cancelAnimationFrame(timer1)
    }, [activePill, updateIndicator])

    const onPillHover = useCallback((item: string) => {
        if (item === activePill) {
            setHoverStyle(prev => ({ ...prev, opacity: 0 }))
            return
        }
        const m = getElMetrics(item)
        if (!m) return
        setHoverStyle({
            left: `${m.left}px`,
            width: `${m.width}px`,
            opacity: 1,
        })
    }, [activePill, getElMetrics])

    const onPillLeave = useCallback(() => {
        setHoverStyle(prev => ({ ...prev, opacity: 0 }))
    }, [])

    const selectItem = useCallback((item:any) => {
        if (item === activePill) return

        const fromMetrics = getElMetrics(activePill)
        const toMetrics = getElMetrics(item)

        setHoverStyle(prev => ({ ...prev, opacity: 0 }))

        if (fromMetrics && toMetrics) {
            const distance = Math.abs(toMetrics.centerX - fromMetrics.centerX)
            const stretchX = 1 + Math.min(distance / 280, 0.35)
            const squishY = 1 - Math.min(distance / 900, 0.12)

            setIsAnimating(true)
            setStretchTransform(`scaleX(${stretchX}) scaleY(${squishY})`)
            setActivePill(item)

            setTimeout(() => {
                updateIndicator(false, item)
                setTimeout(() => {
                    setStretchTransform('scaleX(1) scaleY(1)')
                    setTimeout(() => {
                        setIsAnimating(false)
                        setStretchTransform('')
                    }, 280)
                }, 80)
            }, 0)
        } else {
            setActivePill(item)
            setTimeout(() => updateIndicator(false, item), 0)
        }
    }, [activePill, getElMetrics, updateIndicator])
    
    return (
        <nav className="nav">
            <img className="nav-logo" src="/src/assets/logos/Ramin-Ahmadi.svg" alt="Ramin Ahmadi"/>
            <div className="nav-pills" ref={pillsRef} onMouseLeave={onPillLeave}>
                <span className="nav-pill-hover-ghost" style={hoverStyle}></span>
                <span 
                    className={`nav-pill-indicator ${indicatorReady ? 'nav-pill-indicator--ready' : ''} ${isAnimating ? 'nav-pill-indicator--liquid' : ''}`}
                    style={{
                        ...indicatorStyle,
                        transform: stretchTransform,
                    }}
                ></span>
                {NAV_ITEMS.map((pill, i) => (
                    <a 
                        key={pill}
                        href="#" 
                        className={`nav-pill ${activePill === pill ? 'active' : ''}`}
                        ref={(el) => { if (el) pillEls.current[i] = el }}
                        onClick={(e) => {
                            e.preventDefault()
                            selectItem(pill)
                        }}
                        onMouseEnter={() => onPillHover(pill)}
                    >
                        {pill}
                    </a>
                ))}
            </div>
        <button
            className={`lazy-toggle ${isInstant ? 'lazy-toggle--off' : 'lazy-toggle--on'}`}
            data-tooltip={isInstant ? 'Toggle smooth scrolling effects' : 'Toggle snappy scrolling effects'}
            aria-label={isInstant ? 'Toggle smooth scrolling effects' : 'Toggle snappy scrolling effects'}
            onClick={() => setIsInstant(prev => !prev)}
        >
            {isInstant ? (
                <>
                    <svg className="lazy-toggle__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13.00,2.00C10.17,5.50 7.33,9.00 4.50,12.50C6.67,12.50 8.83,12.50 11.00,12.50C10.67,15.67 10.33,18.83 10.00,22.00C12.83,18.50 15.67,15.00 18.50,11.50C16.33,11.50 14.17,11.50 12.00,11.50C12.33,8.33 12.67,5.17 13.00,2.00"></path>
                    </svg>
                    <span className="lazy-toggle__label">Instant scroll</span>
                </>
            ) : (
                <>
                    <svg className="lazy-toggle__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d={pathD} />
                        </svg>
                        <span data-tooltip="Toggle smooth scrolling effects" aria-label="Toggle smooth scrolling effects" className={`lazy-toggle__label ${labelFading ? 'lazy-toggle__label--fading' : ''}`}>
                            {isInstant ? 'Instant scroll' : 'Smooth scroll'}
                        </span>
                </>
            )}
                
            </button>
    </nav>
    )
}
