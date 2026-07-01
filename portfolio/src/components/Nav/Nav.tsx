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
    
    const pillsRef = useRef<HTMLDivElement>(null)
    const pillEls = useRef<HTMLAnchorElement[]>([])

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
        <button className="lazy-toggle lazy-toggle--on" data-tooltip="Toggle snappy scrolling effects" aria-label="Toggle snappy scrolling effects">
            <svg className="lazy-toggle__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.00,12.00C4.00,10.50 5.00,9.75 6.00,9.75C7.00,9.75 8.00,10.50 9.00,12.00C10.00,13.50 11.00,14.25 12.00,14.25C13.00,14.25 14.00,13.50 15.00,12.00C16.00,10.50 17.00,9.75 18.00,9.75C19.00,9.75 2₀.₀₀,1₀.5₀ 2₁.₀₀,12.₀₀"></path>
            </svg>
            <span className="lazy-toggle__label">Smooth scroll</span>
        </button>
    </nav>
    )
}
