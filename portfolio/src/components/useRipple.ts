import { createElement, useRef, useState, type MouseEvent } from 'react'

type RipplePoint = {
  id: number
  x: number
  y: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<RipplePoint[]>([])
  const nextIdRef = useRef(0)

  function spawnRipple(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = nextIdRef.current++

    setRipples((current) => [...current, { id, x, y }])

    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id))
    }, 520)
  }

  function renderRipples() {
    return ripples.map((ripple) =>
      createElement('span', {
        key: ripple.id,
        className: 'card-ripple',
        style: {
          left: `${ripple.x}px`,
          top: `${ripple.y}px`,
          width: '20px',
          height: '20px',
          marginLeft: '-10px',
          marginTop: '-10px',
        },
      }),
    )
  }

  return { spawnRipple, renderRipples }
}

export default useRipple
