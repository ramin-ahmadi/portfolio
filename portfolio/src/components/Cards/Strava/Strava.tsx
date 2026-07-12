import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useRipple } from '../../useRipple'

const STRAVA_PROFILE = 'https://www.strava.com/athletes/1986054746'
const ACTIVITY_JSON = '/src/assets/strava-activity.json'
const APP_ICON = '/src/assets/logos/strava.svg'
const ICON_EXTERNAL_LINK = '/src/assets/icons/external-link.svg'
const LONG_FOREST_CENTER: [number, number] = [-37.6618, 144.5112]
const LONG_FOREST_ZOOM = 1
const ROUTE_ZOOM_OUT_STEPS = .2

type RideInfo = {
  name: string
  distance: string
  elevation: string
  date: string | null
  athleteId: string | null
}

type StravaActivity = {
  id?: number
  athlete_id?: string | number | null
  name?: string
  type?: string
  sport_type?: string
  distance?: number
  total_elevation_gain?: number
  start_date_local?: string
  polyline?: string
  map?: {
    summary_polyline?: string
    polyline?: string
  }
}

type Status = 'loading' | 'ready' | 'error'

declare global {
  interface Window {
    L?: any
    __stravaLeafletPromise?: Promise<any>
  }
}

// Strava's start_date_local is an ISO string already shifted to the rider's
// local time (still suffixed with "Z"). Formatting in UTC gives us a stable
// "26 Apr" regardless of the viewer's own timezone.
function formatRideDate(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d)
}

// Google encoded-polyline decoder.
function decodePolyline(str: string) {
  const coords: Array<[number, number]> = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < str.length) {
    let b
    let shift = 0
    let result = 0

    do {
      b = str.charCodeAt(index) - 63
      index += 1
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0
    result = 0

    do {
      b = str.charCodeAt(index) - 63
      index += 1
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lng += result & 1 ? ~(result >> 1) : result >> 1
    coords.push([lat / 1e5, lng / 1e5])
  }

  return coords
}

function getPolyline(activity: StravaActivity) {
  return activity.polyline || activity.map?.summary_polyline || activity.map?.polyline || ''
}

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)
  if (window.__stravaLeafletPromise) return window.__stravaLeafletPromise

  window.__stravaLeafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = Object.assign(document.createElement('link'), {
        id: 'leaflet-css',
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
      })
      document.head.appendChild(link)
    }

    const existingScript = document.getElementById('leaflet-js') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L))
      existingScript.addEventListener('error', reject)
      return
    }

    const script = Object.assign(document.createElement('script'), {
      id: 'leaflet-js',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      onload: () => resolve(window.L),
      onerror: reject,
    })
    document.head.appendChild(script)
  })

  return window.__stravaLeafletPromise
}

export default function Strava({ classes = '' }: { classes?: string }) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const leafletMap = useRef<any>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [rideInfo, setRideInfo] = useState<RideInfo | null>(null)
  const [errMsg, setErrMsg] = useState('')
  const { spawnRipple, renderRipples } = useRipple()

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const L = await loadLeaflet()

        await new Promise((resolve) => window.setTimeout(resolve, 50))
        if (!mapEl.current || cancelled) return

        leafletMap.current = L.map(mapEl.current, {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          keyboard: false,
        }).setView(LONG_FOREST_CENTER, LONG_FOREST_ZOOM)

        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          { subdomains: 'abcd', maxZoom: 19 },
        ).addTo(leafletMap.current)

        const activityRes = await fetch(ACTIVITY_JSON)

        if (!activityRes.ok) throw new Error('Could not load activity data — run: node scripts/fetch-strava.js')
        const activity = await activityRes.json() as StravaActivity

        if (!activity) throw new Error('No rides found')
        if (cancelled) return

        setRideInfo({
          name: activity.name || '',
          distance: `${((activity.distance || 0) / 1000).toFixed(1)} km`,
          elevation: `${Math.round(activity.total_elevation_gain || 0)} m ↑`,
          date: formatRideDate(activity.start_date_local),
          athleteId: activity.athlete_id ? String(activity.athlete_id) : null,
        })

        const encoded = getPolyline(activity)
        if (!encoded) throw new Error('No route data')

        const coords = decodePolyline(encoded)

        const stravaColor = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-strava').trim() || '#fc4c02'
        const route = L.polyline(coords, {
          color: stravaColor,
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(leafletMap.current)

        leafletMap.current.fitBounds(route.getBounds(), { padding: [10, 10] })
        leafletMap.current.setZoom(Math.max(0, leafletMap.current.getZoom() - ROUTE_ZOOM_OUT_STEPS))
        leafletMap.current.invalidateSize()

        if (!cancelled) setStatus('ready')
      } catch (error) {
        console.error('StravaCard error:', error)
        if (!cancelled) {
          setErrMsg(String(error))
          setStatus('error')
        }
      }
    }

    init()

    return () => {
      cancelled = true
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  const datePart = rideInfo?.date ? ` (${rideInfo.date})` : ''
  const profileHref = rideInfo?.athleteId ? `https://www.strava.com/athletes/${rideInfo.athleteId}` : STRAVA_PROFILE
  const tooltip = `My latest activity${datePart} 🥾\nConnect with me on Strava`

  function openProfile(event: MouseEvent<HTMLDivElement>) {
    spawnRipple(event)
    window.open(profileHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={['bento-card', 'strava-card', classes].filter(Boolean).join(' ')}
      data-tooltip={tooltip}
      onClick={openProfile}
    >
      <a
        className="action-icon"
        href={profileHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={ICON_EXTERNAL_LINK} alt="Open Strava" />
      </a>

      <div ref={mapEl} className="strava-map" />

      {status === 'loading' ? <div className="strava-skeleton" /> : null}

      {status === 'ready' && rideInfo ? (
        <div className="strava-overlay">
          <span className="strava-distance">{rideInfo.distance}</span>
          <span className="strava-elevation">{rideInfo.elevation}</span>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="strava-overlay" title={errMsg}>
          <span className="strava-distance">Strava</span>
          <span className="strava-elevation">Route unavailable</span>
        </div>
      ) : null}

      <div className="strava-badge">
        <img src={APP_ICON} alt="Strava" width={28} height={28} />
      </div>

      {renderRipples()}
    </div>
  )
}
