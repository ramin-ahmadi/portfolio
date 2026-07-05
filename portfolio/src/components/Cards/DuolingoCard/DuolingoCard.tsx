import { useEffect, useMemo, useState } from 'react'

const FIRE = '/src/assets/images/duolingo/duolingo-fire.svg'
const APP_ICON = '/src/assets/logos/duolingo.svg'
const APP_FLAG = '/src/assets/images/duolingo/duolingo-flag.svg'
const AVATAR_WEBM = '/src/assets/videos/duolingo-avatar.webm'
const AVATAR_PNG = '/src/assets/images/duolingo/duolingo-avatar-fallback.png'
const PROFILE = 'https://www.duolingo.com/profile/Ram992212'
const STREAK_API = 'https://duolingo-streak.ramin-ahmadi-portfolio.workers.dev/streak'

const ua = navigator.userAgent
const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))
const desktopSafari = !isIOS && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua)
const LACKS_VP9_ALPHA = isIOS || desktopSafari

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export default function DuolingoCard({ classes = '', streak: initialStreak = 0 }: { classes?: string; streak?: number }) {
  const [displayed, setDisplayed] = useState(0)

  const shouldUseVideo = useMemo(() => !LACKS_VP9_ALPHA, [])

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | undefined

    function animateTo(target: number) {
      const duration = 1800
      timeoutId = window.setTimeout(() => {
        const start = performance.now()

        function tick(now: number) {
          if (cancelled) return
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          setDisplayed(Math.round(easeOutQuint(progress) * target))
          if (progress < 1) {
            window.requestAnimationFrame(tick)
          }
        }

        window.requestAnimationFrame(tick)
      }, 500)
    }

    async function loadStreak() {
      let current = initialStreak

      try {
        const response = await fetch(STREAK_API)
        const data = await response.json()
        if (data?.streak != null) current = data.streak
      } catch {
        // Use fallback streak
      }

      if (!cancelled) animateTo(current)
    }

    void loadStreak()

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [initialStreak])

  return (
    <div
      className={['bento-card', 'duolingo-card', classes].filter(Boolean).join(' ')}
      data-tooltip="I am learning French 🥐
Follow me on Duolingo"
    >
      <a
        className="action-icon"
        href={PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        <img src="/src/assets/icons/external-link.svg" alt="Open Duolingo" />
      </a>

      <div className="duolingo-streak">
        <img className="duolingo-fire" src={FIRE} alt="Fire" />
        <span className="streak-number">{displayed}</span>
      </div>

      <div className="duolingo-app-flag">
        <img src={APP_FLAG} alt="French Flag" />
      </div>

      {shouldUseVideo ? (
        <video className="duolingo-avatar" autoPlay loop muted playsInline>
          <source src={AVATAR_WEBM} type="video/webm" />
        </video>
      ) : (
        <img className="duolingo-avatar" src={AVATAR_PNG} alt="Duolingo avatar" />
      )}

      <div className="duolingo-app-icon">
        <img src={APP_ICON} alt="Duolingo" />
      </div>
    </div>
  )
}
