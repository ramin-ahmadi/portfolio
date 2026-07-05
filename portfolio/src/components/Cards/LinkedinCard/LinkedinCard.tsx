import React, { useState } from 'react'
import './LinkedinCard.css'

const ICON_EXTERNAL_LINK = '/src/assets/icons/external-link.svg'
const HREF = 'https://www.linkedin.com/in/raminahmadi/'
const TOOLTIP = 'Connect with me on LinkedIn 🧑‍💻'

export default function LinkedinCard({ classes = '' }: { classes?: string }) {
  const [animKey, setAnimKey] = useState(0)
  function replay() { setAnimKey(k => k + 1) }

  return (
    <div
      className={[ 'bento-card', 'linkedin-card', classes ].filter(Boolean).join(' ')}
      data-tooltip={TOOLTIP}
      onMouseEnter={replay}
      onClick={() => window.open(HREF, '_blank', 'noopener,noreferrer')}
    >
      <a
        className="action-icon"
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={ICON_EXTERNAL_LINK} alt="Open LinkedIn" />
      </a>

      <svg
        key={animKey}
        className="li-svg"
        viewBox="0 0 36 36"
        fill="none"
        width="88"
        height="88"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="li-dot" cx="11" cy="10" r="2.2" />
        <path
          className="li-path"
          d="M11 15.5 L11 26"
          style={{ ['--len' as any]: '11', ['--draw-dur' as any]: '0.38s', ['--draw-delay' as any]: '0.08s' } as React.CSSProperties}
        />
        <path
          className="li-path"
          d="M17 15.5 L17 26"
          style={{ ['--len' as any]: '11', ['--draw-dur' as any]: '0.38s', ['--draw-delay' as any]: '0.14s' } as React.CSSProperties}
        />
        <path
          className="li-path"
          d="M17 19.5 C17 17 19 15.5 21 15.5 C23 15.5 25 17 25 19.5 L25 26"
          style={{ ['--len' as any]: '22', ['--draw-dur' as any]: '0.42s', ['--draw-delay' as any]: '0.20s' } as React.CSSProperties}
        />
      </svg>
    </div>
  )
}
