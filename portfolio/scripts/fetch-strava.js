import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'src/assets/strava-activity.json')
const ENV_FILES = ['.env.local', '.env']

for (const file of ENV_FILES) {
  const envPath = path.join(ROOT, file)
  if (!fs.existsSync(envPath)) continue

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const [rawKey, ...rawValue] = trimmed.split('=')
    const key = rawKey.trim()
    const value = rawValue.join('=').trim().replace(/^["']|["']$/g, '')

    if (key && value && !process.env[key]) {
      process.env[key] = value
    }
  }
}

const {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REFRESH_TOKEN,
  STRAVA_ATHLETE_ID,
} = process.env

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}. Add it to portfolio/.env.local before running npm run fetch:strava.`)
  }
}

function getPolyline(activity) {
  return activity?.map?.summary_polyline || activity?.map?.polyline || activity?.polyline || ''
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = body?.message || body?.errors?.map((error) => error.message).join(', ') || response.statusText
    throw new Error(`${response.status} ${message}`)
  }

  return body
}

async function main() {
  requireEnv('STRAVA_CLIENT_ID', STRAVA_CLIENT_ID)
  requireEnv('STRAVA_CLIENT_SECRET', STRAVA_CLIENT_SECRET)
  requireEnv('STRAVA_REFRESH_TOKEN', STRAVA_REFRESH_TOKEN)

  const token = await requestJson('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  const athleteId = token?.athlete?.id ? String(token.athlete.id) : ''
  if (STRAVA_ATHLETE_ID && athleteId && STRAVA_ATHLETE_ID !== athleteId) {
    throw new Error(`Strava token belongs to athlete ${athleteId}, but STRAVA_ATHLETE_ID is ${STRAVA_ATHLETE_ID}.`)
  }

  const activities = await requestJson('https://www.strava.com/api/v3/athlete/activities?per_page=20&page=1', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })

  const latestWithRoute = activities.find((activity) => getPolyline(activity))
  if (!latestWithRoute) {
    throw new Error('No recent activity with route data found.')
  }

  const normalized = {
    id: latestWithRoute.id,
    athlete_id: athleteId || STRAVA_ATHLETE_ID || null,
    name: latestWithRoute.name,
    type: latestWithRoute.type,
    sport_type: latestWithRoute.sport_type,
    distance: latestWithRoute.distance,
    total_elevation_gain: latestWithRoute.total_elevation_gain,
    start_date_local: latestWithRoute.start_date_local,
    polyline: getPolyline(latestWithRoute),
    strava_url: `https://www.strava.com/activities/${latestWithRoute.id}`,
    fetched_at: new Date().toISOString(),
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(normalized, null, 2)}\n`)
  console.log(`Wrote latest Strava activity to ${path.relative(ROOT, OUTPUT_PATH)}`)

  if (token.refresh_token && token.refresh_token !== STRAVA_REFRESH_TOKEN) {
    console.log('Strava returned a rotated refresh token. Update STRAVA_REFRESH_TOKEN in your secrets before the next fetch.')
  }
}

main().catch((error) => {
  console.error(`Strava fetch failed: ${error.message}`)
  process.exit(1)
})
