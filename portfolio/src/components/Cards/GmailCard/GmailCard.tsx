import { useEffect, useRef, useState } from 'react'
import './GmailCard.css'
import { useRipple } from '../../useRipple'

const ICON_COPY = '/src/assets/icons/copy.svg'

const CHECKMARK_ANIM = {"v":"5.7.1","fr":30,"ip":0,"op":45,"w":32,"h":32,"nm":"checkMark","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"checkmark","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":5,"s":[100]}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[16,16,0],"ix":2},"a":{"a":0,"k":[12,12,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[8,-5.5],[-3,5.5],[-8,0.5]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0,0,0,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":2,"ix":5},"lc":2,"lj":2,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.3],"y":[1]},"o":{"x":[0.3],"y":[0]},"t":0,"s":[100]},{"t":45,"s":[0]}],"ix":1},"e":{"a":0,"k":100,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":3,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"tr","p":{"a":0,"k":[12,11.5],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"checkmark","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":45,"st":0,"bm":0}],"markers":[]}

const EMAIL = 'ramin.ahmadi.portfolio@gmail.com'

export default function GmailCard({ classes = '' }: { classes?: string }) {
  const [copied, setCopied] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const checkEl = useRef<HTMLDivElement | null>(null)
  const lottieAnim = useRef<any>(null)
  const checkTimer = useRef<number | null>(null)
  const timer = useRef<number | null>(null)
  const { spawnRipple, renderRipples } = useRipple()

  useEffect(() => {
    const win = window as any
    if (!win.lottie || !checkEl.current) return
    lottieAnim.current = win.lottie.loadAnimation({
      container: checkEl.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: CHECKMARK_ANIM,
    })
    lottieAnim.current.setSpeed(2)

    return () => {
      if (checkTimer.current) window.clearTimeout(checkTimer.current)
      if (timer.current) window.clearTimeout(timer.current)
      if (lottieAnim.current) lottieAnim.current.destroy()
    }
  }, [])

  useEffect(() => {
    if (!lottieAnim.current) return
    if (copied) {
      lottieAnim.current.goToAndStop(0, true)
      if (checkTimer.current) window.clearTimeout(checkTimer.current)
      checkTimer.current = window.setTimeout(() => {
        lottieAnim.current.play()
      }, 300)
    } else {
      if (checkTimer.current) window.clearTimeout(checkTimer.current)
      lottieAnim.current.goToAndStop(0, true)
    }
  }, [copied])

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    })
  }

  function replay() {
    setAnimKey((key) => key + 1)
  }

  return (
    <div
      className={[ 'bento-card', 'gmail-card', classes ].filter(Boolean).join(' ')}
      onClick={(e) => { handleCopy(); spawnRipple(e) }}
      onMouseEnter={replay}
      data-tooltip="Click to copy my email address 📨"
    >
      <span className={`action-icon${copied ? ' gmail-copied-label' : ''}`}>
        <img
          className={`gm-copy-icon${copied ? ' gm-copy-icon--out' : ''}`}
          src={ICON_COPY}
          alt="Copy email"
        />
        <span className={`gm-copied-text${copied ? ' gm-copied-text--in' : ''}`}>

          <div className="gm-check-lottie" ref={checkEl} >
                      {/* Animated SVG tick — draws when `copied` is true */}
          <svg
            className={`gm-tick ${copied ? 'gm-tick--draw' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 8l4 4 8-8"
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          </div>
                    Copied
        </span>
      </span>

      <svg key={animKey} className="gm-svg" viewBox="52 42 88 66" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <path className="gm-from-top" fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
        <path className="gm-from-top" fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path className="gm-from-top" fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path className="gm-from-left" fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path className="gm-from-right" fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      </svg>

      {renderRipples()}
    </div>
  )
}
