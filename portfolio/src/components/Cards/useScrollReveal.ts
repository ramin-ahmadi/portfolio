import { type RefObject, useEffect } from 'react'

const REVEAL_SELECTOR = '[data-scroll-reveal]'
const VISIBLE_CLASS = 'cs-scroll-reveal--visible'

/**
 * Reveals opted-in elements as they enter a card's scrollable viewport.
 *
 * Add `data-scroll-reveal` to any visual that should use the effect, then call
 * this hook once from the card overlay with its scroll-container ref.
 */
export function useScrollReveal(
  scrollContainerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!enabled || !scrollContainer) return

    const revealElements = Array.from(
      scrollContainer.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    )

    if (
      !('IntersectionObserver' in window)
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      revealElements.forEach((element) => element.classList.add(VISIBLE_CLASS))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          entry.target.classList.add(VISIBLE_CLASS)
          observer.unobserve(entry.target)
        })
      },
      {
        root: scrollContainer,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      },
    )

    revealElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [enabled, scrollContainerRef])
}
