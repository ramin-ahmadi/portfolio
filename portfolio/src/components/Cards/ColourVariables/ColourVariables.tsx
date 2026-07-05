import { useMemo, useState } from 'react'
import './ColourVariables.css'

type TokenValue = {
  hex: string
  alpha: number
  alias?: string
}

type Row = {
  t: 'h' | 'v'
  label?: string
  parent?: string | null
  group?: string
  top?: string
  name?: string
  dt?: 'color' | 'number'
  val?: TokenValue | number | null
  lv?: TokenValue | number | null
  dv?: TokenValue | number | null
  la?: string | null
  da?: string | null
}

const PRIMITIVES = {
  colour: {
    neutral: {
      'neutral-1000': { hex: '#160E21', alpha: 1 },
      'neutral-900': { hex: '#352A41', alpha: 1 },
      'neutral-850': { hex: '#42374E', alpha: 1 },
      'neutral-750': { hex: '#584F63', alpha: 1 },
      'neutral-650': { hex: '#6E6678', alpha: 1 },
      'neutral-350': { hex: '#B1ADB6', alpha: 1 },
      'neutral-150': { hex: '#DEDCE0', alpha: 1 },
      'neutral-50': { hex: '#F4F3F5', alpha: 1 },
      'neutral-10': { hex: '#FEFEFE', alpha: 1 },
      'neutral-0': { hex: '#FFFFFF', alpha: 1 },
    },
    primary: {
      'purple-900': { hex: '#502485', alpha: 1 },
      'purple-700': { hex: '#682FAD', alpha: 1 },
      'purple-600': { hex: '#8E09FD', alpha: 1 },
      'purple-500': { hex: '#9945FF', alpha: 1 },
      'purple-300': { hex: '#C28FFF', alpha: 1 },
      'purple-100': { hex: '#EBDAFF', alpha: 1 },
      'purple-50': { hex: '#F5ECFF', alpha: 1 },
    },
    secondary: {
      'pink-600': { hex: '#F94DFD', alpha: 1 },
      'pink-500': { hex: '#E367C0', alpha: 1 },
      'aqua-500': { hex: '#4BF0F0', alpha: 1 },
    },
    system: {
      'red-900': { hex: '#2B181A', alpha: 1 },
      'red-500': { hex: '#DC3044', alpha: 1 },
      'red-300': { hex: '#E76E7C', alpha: 1 },
      'red-100': { hex: '#FCEAEC', alpha: 1 },
      'green-500': { hex: '#28DE9C', alpha: 1 },
      'green-300': { hex: '#237668', alpha: 1 },
    },
    transparency: {
      'neutral-1000-90': { hex: '#160E21', alpha: 0.9 },
      'neutral-1000-80': { hex: '#160E21', alpha: 0.8 },
      'neutral-1000-25': { hex: '#160E21', alpha: 0.25 },
      'neutral-1000-12': { hex: '#160E21', alpha: 0.12 },
      'neutral-1000-0': { hex: '#160E21', alpha: 0 },
      'purple-900-0': { hex: '#502485', alpha: 0 },
      'neutral-750-50': { hex: '#584F63', alpha: 0.5 },
      'neutral-150-50': { hex: '#DEDCE0', alpha: 0.5 },
      'neutral-0-90': { hex: '#FFFFFF', alpha: 0.9 },
      'neutral-0-80': { hex: '#FFFFFF', alpha: 0.8 },
      'neutral-0-25': { hex: '#FFFFFF', alpha: 0.25 },
      'neutral-0-12': { hex: '#FFFFFF', alpha: 0.12 },
      'neutral-0-0': { hex: '#FFFFFF', alpha: 0 },
      'pink-500-25': { hex: '#E367C0', alpha: 0.25 },
      'purple-50-0': { hex: '#F5ECFF', alpha: 0 },
    },
    premium: {
      'premium-purple-200': { hex: '#260267', alpha: 1 },
      'premium-purple-100': { hex: '#7606DC', alpha: 1 },
      'premium-gold-200': { hex: '#BA7F28', alpha: 1 },
      'premium-gold-100': { hex: '#FFCB46', alpha: 1 },
    },
    switcher: {
      'left-pink-100': { hex: '#F3E5FD', alpha: 1 },
      'left-pink-0': { hex: '#F1E1FD', alpha: 0 },
      'right-pink-100': { hex: '#F1E4FF', alpha: 1 },
      'right-pink-0': { hex: '#EBD9FF', alpha: 0 },
      'left-purple-100': { hex: '#57268B', alpha: 1 },
      'left-purple-0': { hex: '#57258C', alpha: 0 },
      'right-purple-100': { hex: '#52238A', alpha: 1 },
      'right-purple-0': { hex: '#582193', alpha: 0 },
    },
    iOS26: {
      'glass-light-top': { hex: '#FFFFFF', alpha: 0.16 },
      'glass-light-bottom': { hex: '#FFFFFF', alpha: 0.34 },
      'glass-dark-top': { hex: '#000000', alpha: 0.16 },
      'glass-dark-bottom': { hex: '#000000', alpha: 0.34 },
    },
  },
  spacing: {
    half: { v: 4 },
    '1': { v: 8 },
    '2': { v: 16 },
    '3': { v: 24 },
    '4': { v: 32 },
    '5': { v: 40 },
    '6': { v: 48 },
    '7': { v: 56 },
    '8': { v: 64 },
    '9': { v: 72 },
    '10': { v: 80 },
  },
  radius: {
    sm: { v: 4 },
    md: { v: 8 },
    lg: { v: 16 },
    xl: { v: 32 },
    '2xl': { v: 128 },
    '3xl': { v: 360 },
  },
}

const LIGHT = {
  Primary: {
    primary: { hex: '#9945FF', alpha: 1, alias: 'colour/primary/purple-500' },
    'primary-light': { hex: '#C28FFF', alpha: 1, alias: 'colour/primary/purple-300' },
    'primary-lightest': { hex: '#F5ECFF', alpha: 1, alias: 'colour/primary/purple-50' },
    'primary-dark': { hex: '#682FAD', alpha: 1, alias: 'colour/primary/purple-700' },
    'primary-darker': { hex: '#502485', alpha: 1, alias: 'colour/primary/purple-900' },
  },
  Secondary: {
    pink: { hex: '#E367C0', alpha: 1, alias: 'colour/secondary/pink-500' },
    aqua: { hex: '#4BF0F0', alpha: 1, alias: 'colour/secondary/aqua-500' },
  },
  Neutral: {
    'neutral-constant-1000': { hex: '#160E21', alpha: 1, alias: 'colour/neutral/neutral-1000' },
    'neutral-constant-50': { hex: '#F4F3F5', alpha: 1, alias: 'colour/neutral/neutral-50' },
    'neutral-constant-150': { hex: '#DEDCE0', alpha: 1, alias: 'colour/neutral/neutral-150' },
    'neutral-constant-0': { hex: '#FFFFFF', alpha: 1, alias: 'colour/neutral/neutral-0' },
    neutral: { hex: '#160E21', alpha: 1, alias: 'colour/neutral/neutral-1000' },
    'neutral-invert': { hex: '#FFFFFF', alpha: 1, alias: 'colour/neutral/neutral-0' },
    'neutral-lightest': { hex: '#FEFEFE', alpha: 1, alias: 'colour/neutral/neutral-10' },
    'neutral-light': { hex: '#F4F3F5', alpha: 1, alias: 'colour/neutral/neutral-50' },
    'neutral-dark': { hex: '#DEDCE0', alpha: 1, alias: 'colour/neutral/neutral-150' },
    'neutral-darker': { hex: '#6E6678', alpha: 1, alias: 'colour/neutral/neutral-650' },
    'neutral-opaque': { hex: '#160E21', alpha: 0.25, alias: 'colour/transparency/neutral-1000-25' },
    'neutral-80': { hex: '#160E21', alpha: 0.8, alias: 'colour/transparency/neutral-1000-80' },
  },
  System: {
    red: { hex: '#DC3044', alpha: 1, alias: 'colour/system/red-500' },
    'red-light': { hex: '#FCEAEC', alpha: 1, alias: 'colour/system/red-100' },
    green: { hex: '#28DE9C', alpha: 1, alias: 'colour/system/green-500' },
  },
  Gradient: {
    'Gradient-0': { hex: '#FFFFFF', alpha: 0, alias: 'colour/transparency/neutral-0-0' },
    'Gradient-25': { hex: '#FFFFFF', alpha: 0.25, alias: 'colour/transparency/neutral-0-25' },
    'Gradient-80': { hex: '#FFFFFF', alpha: 0.8, alias: 'colour/transparency/neutral-0-80' },
    'Gradient-90': { hex: '#FFFFFF', alpha: 0.9, alias: 'colour/transparency/neutral-0-90' },
    'Gradient-100': { hex: '#FFFFFF', alpha: 1, alias: 'colour/neutral/neutral-0' },
    'gradient-purple-0': { hex: '#502485', alpha: 0, alias: 'colour/transparency/purple-900-0' },
    'gradient-purple-100': { hex: '#502485', alpha: 1, alias: 'colour/primary/purple-900' },
    'gradient-pink-0': { hex: '#E367C0', alpha: 0.25, alias: 'colour/transparency/pink-500-25' },
    'gradient-surface-0': { hex: '#F5ECFF', alpha: 0, alias: 'colour/transparency/purple-50-0' },
  },
  Switcher: {
    'left-100': { hex: '#F3E5FD', alpha: 1, alias: 'colour/switcher/left-pink-100' },
    'left-0': { hex: '#F1E1FD', alpha: 0, alias: 'colour/switcher/left-pink-0' },
    'right-100': { hex: '#F1E4FF', alpha: 1, alias: 'colour/switcher/right-pink-100' },
    'right-0': { hex: '#EBD9FF', alpha: 0, alias: 'colour/switcher/right-pink-0' },
  },
  iOS26: {
    'glass-top': { hex: '#FFFFFF', alpha: 0.16, alias: 'colour/iOS26/glass-light-top' },
    'glass-bottom': { hex: '#FFFFFF', alpha: 0.34, alias: 'colour/iOS26/glass-light-bottom' },
  },
}

const DARK = {
  Primary: {
    primary: { hex: '#C28FFF', alpha: 1, alias: 'colour/primary/purple-300' },
    'primary-light': { hex: '#9945FF', alpha: 1, alias: 'colour/primary/purple-500' },
    'primary-lightest': { hex: '#502485', alpha: 1, alias: 'colour/primary/purple-900' },
    'primary-dark': { hex: '#EBDAFF', alpha: 1, alias: 'colour/primary/purple-100' },
    'primary-darker': { hex: '#EBDAFF', alpha: 1, alias: 'colour/primary/purple-100' },
  },
  Secondary: {
    pink: { hex: '#E367C0', alpha: 1, alias: 'colour/secondary/pink-500' },
    aqua: { hex: '#4BF0F0', alpha: 1, alias: 'colour/secondary/aqua-500' },
  },
  Neutral: {
    'neutral-constant-1000': { hex: '#160E21', alpha: 1, alias: 'colour/neutral/neutral-1000' },
    'neutral-constant-50': { hex: '#F4F3F5', alpha: 1, alias: 'colour/neutral/neutral-50' },
    'neutral-constant-150': { hex: '#DEDCE0', alpha: 1, alias: 'colour/neutral/neutral-150' },
    'neutral-constant-0': { hex: '#FFFFFF', alpha: 1, alias: 'colour/neutral/neutral-0' },
    neutral: { hex: '#FFFFFF', alpha: 1, alias: 'colour/neutral/neutral-0' },
    'neutral-invert': { hex: '#160E21', alpha: 1, alias: 'colour/neutral/neutral-1000' },
    'neutral-lightest': { hex: '#352A41', alpha: 1, alias: 'colour/neutral/neutral-900' },
    'neutral-light': { hex: '#42374E', alpha: 1, alias: 'colour/neutral/neutral-850' },
    'neutral-dark': { hex: '#584F63', alpha: 1, alias: 'colour/neutral/neutral-750' },
    'neutral-darker': { hex: '#B1ADB6', alpha: 1, alias: 'colour/neutral/neutral-350' },
    'neutral-opaque': { hex: '#FFFFFF', alpha: 0.25, alias: 'colour/transparency/neutral-0-25' },
    'neutral-80': { hex: '#FFFFFF', alpha: 0.8, alias: 'colour/transparency/neutral-0-80' },
  },
  System: {
    red: { hex: '#E76E7C', alpha: 1, alias: 'colour/system/red-300' },
    'red-light': { hex: '#2B181A', alpha: 1, alias: 'colour/system/red-900' },
    green: { hex: '#237668', alpha: 1, alias: 'colour/system/green-300' },
  },
  Gradient: {
    'Gradient-0': { hex: '#160E21', alpha: 0, alias: 'colour/transparency/neutral-1000-0' },
    'Gradient-25': { hex: '#160E21', alpha: 0.25, alias: 'colour/transparency/neutral-1000-25' },
    'Gradient-80': { hex: '#160E21', alpha: 0.8, alias: 'colour/transparency/neutral-1000-80' },
    'Gradient-90': { hex: '#160E21', alpha: 0.9, alias: 'colour/transparency/neutral-1000-90' },
    'Gradient-100': { hex: '#160E21', alpha: 1, alias: 'colour/neutral/neutral-1000' },
    'gradient-purple-0': { hex: '#502485', alpha: 0, alias: 'colour/transparency/purple-900-0' },
    'gradient-purple-100': { hex: '#502485', alpha: 1, alias: 'colour/primary/purple-900' },
    'gradient-pink-0': { hex: '#E367C0', alpha: 0.25, alias: 'colour/transparency/pink-500-25' },
    'gradient-surface-0': { hex: '#F5ECFF', alpha: 0, alias: 'colour/transparency/purple-50-0' },
  },
  Switcher: {
    'left-100': { hex: '#57268B', alpha: 1, alias: 'colour/switcher/left-purple-100' },
    'left-0': { hex: '#57258C', alpha: 0, alias: 'colour/switcher/left-purple-0' },
    'right-100': { hex: '#52238A', alpha: 1, alias: 'colour/switcher/right-purple-100' },
    'right-0': { hex: '#582193', alpha: 0, alias: 'colour/switcher/right-purple-0' },
  },
  iOS26: {
    'glass-top': { hex: '#000000', alpha: 0.16, alias: 'colour/iOS26/glass-dark-top' },
    'glass-bottom': { hex: '#000000', alpha: 0.34, alias: 'colour/iOS26/glass-dark-bottom' },
  },
}

function hexToRgba(hex: string, alpha?: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha ?? 1})`
}

function buildPrimitiveRows(): Row[] {
  const rows: Row[] = []
  const colourGroups = ['neutral', 'primary', 'secondary', 'system', 'transparency', 'premium', 'switcher', 'iOS26']
  for (const groupName of colourGroups) {
    const vars = (PRIMITIVES.colour as Record<string, Record<string, TokenValue>>)[groupName]
    if (!vars) continue
    rows.push({ t: 'h', label: groupName, parent: 'colour', group: `colour/${groupName}` })
    for (const [name, val] of Object.entries(vars)) {
      rows.push({ t: 'v', name, dt: 'color', val, group: `colour/${groupName}`, top: 'colour' })
    }
  }
  for (const cat of ['spacing', 'radius'] as const) {
    const vars = PRIMITIVES[cat] as Record<string, { v: number }>
    if (!vars) continue
    rows.push({ t: 'h', label: cat, parent: null, group: cat })
    for (const [name, val] of Object.entries(vars)) {
      rows.push({ t: 'v', name, dt: 'number', val: val.v, group: cat, top: cat })
    }
  }
  return rows
}

function buildTokenRows(): Row[] {
  const rows: Row[] = []
  const allGroups = [...new Set([...Object.keys(LIGHT), ...Object.keys(DARK)])]
  for (const groupName of allGroups) {
    const lg = LIGHT[groupName as keyof typeof LIGHT] || {}
    const dg = DARK[groupName as keyof typeof DARK] || {}
    const allVars = [...new Set([...Object.keys(lg), ...Object.keys(dg)])]
    rows.push({ t: 'h', label: groupName, parent: null, group: groupName })
    for (const name of allVars) {
      const lv = lg[name as keyof typeof lg]
      const dv = dg[name as keyof typeof dg]
      const isColor = (lv && typeof lv === 'object') || (dv && typeof dv === 'object')
      rows.push({
        t: 'v',
        name,
        dt: isColor ? 'color' : 'number',
        lv: isColor ? (lv as TokenValue | null) : (lv as number | null),
        dv: isColor ? (dv as TokenValue | null) : (dv as number | null),
        la: isColor && lv ? (lv as TokenValue).alias : null,
        da: isColor && dv ? (dv as TokenValue).alias : null,
        group: groupName,
        top: groupName,
      })
    }
  }
  return rows
}

const primRows = buildPrimitiveRows()
const tokRows = buildTokenRows()

function Swatch({ hex, alpha }: { hex: string; alpha: number }) {
  return <span className="cv-swatch"><span className="cv-swatch-fill" style={{ background: hexToRgba(hex, alpha) }} /></span>
}

function AliasPill({ value }: { value: TokenValue }) {
  return (
    <span className="cv-alias">
      <Swatch hex={value.hex} alpha={value.alpha} />
      {value.alias}
    </span>
  )
}

export default function ColourVariables() {
  const [view, setView] = useState<'primitives' | 'tokens'>('primitives')
  const [group, setGroup] = useState('All')
  const [search, setSearch] = useState('')

  const sidebar = useMemo(() => {
    if (view === 'primitives') {
      const items: Array<{ key: string; label: string; count: number; indent: number }> = []
      const children = ['neutral', 'primary', 'secondary', 'system', 'transparency', 'premium', 'switcher', 'iOS26']
      const colourCount = primRows.filter((r) => r.t === 'v' && r.top === 'colour').length
      items.push({ key: 'colour', label: 'colour', count: colourCount, indent: 0 })
      for (const child of children) {
        const count = primRows.filter((r) => r.t === 'v' && r.group === `colour/${child}`).length
        if (count) items.push({ key: `colour/${child}`, label: child, count, indent: 1 })
      }
      const spacingCount = primRows.filter((r) => r.t === 'v' && r.group === 'spacing').length
      if (spacingCount) items.push({ key: 'spacing', label: 'spacing', count: spacingCount, indent: 0 })
      const radiusCount = primRows.filter((r) => r.t === 'v' && r.group === 'radius').length
      if (radiusCount) items.push({ key: 'radius', label: 'radius', count: radiusCount, indent: 0 })
      return items
    }

    const items: Array<{ key: string; label: string; count: number; indent: number }> = []
    const seen = new Set<string>()
    for (const row of tokRows) {
      if (row.t === 'v' && !seen.has(row.group || '')) seen.add(row.group || '')
    }
    for (const key of seen) {
      items.push({ key, label: key, count: tokRows.filter((row) => row.t === 'v' && row.group === key).length, indent: 0 })
    }
    return items
  }, [view])

  const total = useMemo(() => (view === 'primitives' ? primRows : tokRows).filter((row) => row.t === 'v').length, [view])

  const rows = useMemo(() => {
    const src = view === 'primitives' ? primRows : tokRows
    const q = search.toLowerCase().trim()
    return src.filter((row) => {
      if (group !== 'All') {
        if (view === 'primitives' && group === 'colour') {
          if (row.t === 'v' && row.top !== 'colour') return false
          if (row.t === 'h' && !row.group?.startsWith('colour/')) return false
        } else if (row.group !== group) {
          return false
        }
      }
      if (!q) return true
      if (row.t === 'h') return true
      const name = row.name?.toLowerCase().includes(q)
      let valueMatch = false
      if (row.val && typeof row.val === 'object' && 'hex' in row.val) valueMatch = valueMatch || row.val.hex.toLowerCase().includes(q)
      if (row.la) valueMatch = valueMatch || row.la.toLowerCase().includes(q)
      if (row.da) valueMatch = valueMatch || row.da.toLowerCase().includes(q)
      if (row.lv && typeof row.lv === 'object' && 'hex' in row.lv) valueMatch = valueMatch || row.lv.hex.toLowerCase().includes(q)
      if (row.dv && typeof row.dv === 'object' && 'hex' in row.dv) valueMatch = valueMatch || row.dv.hex.toLowerCase().includes(q)
      return name || valueMatch
    })
  }, [group, search, view])

  function resetFilters() {
    setGroup('All')
    setSearch('')
  }

  return (
    <div className="cv-outer">
      <div className="cv-wrap" aria-hidden="true">
        <div className="cv-topbar">
          <div className="cv-topbar-left">
            <span className="cv-title">Variables</span>
            <button className={`cv-tab ${view === 'primitives' ? 'cv-tab--on' : ''}`} onClick={() => { setView('primitives'); resetFilters() }}>
              Primitives
            </button>
            <button className={`cv-tab ${view === 'tokens' ? 'cv-tab--on' : ''}`} onClick={() => { setView('tokens'); resetFilters() }}>
              Tokens
            </button>
          </div>
          <label className="cv-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        <div className="cv-body">
          <aside className="cv-side">
            <div className="cv-side-label">Groups</div>
            <button className={`cv-side-item ${group === 'All' ? 'cv-side-item--on' : ''}`} onClick={() => setGroup('All')}>
              <span>All</span>
              <span className="cv-side-count">{total}</span>
            </button>
            {sidebar.map((item) => (
              <button
                key={item.key}
                className={`cv-side-item ${group === item.key ? 'cv-side-item--on' : ''}${item.indent ? ` cv-side-item--i${item.indent}` : ''}`}
                onClick={() => setGroup(item.key)}
              >
                <span>{item.label}</span>
                <span className="cv-side-count">{item.count}</span>
              </button>
            ))}
          </aside>

          <div className="cv-table">
            <div className="cv-thead">
              <span className="cv-col-name">Name</span>
              {view === 'primitives' ? <span className="cv-col-val">Value</span> : <><span className="cv-col-val">Light</span><span className="cv-col-val">Dark</span></>}
            </div>

            <div className="cv-rows">
              {rows.length ? rows.map((row, index) => (
                row.t === 'h' ? (
                  <div className="cv-gh" key={`h-${index}`}>
                    {row.parent ? <span className="cv-gh-path">{row.parent} / </span> : null}
                    <span className="cv-gh-name">{row.label}</span>
                  </div>
                ) : (
                  <div className="cv-row" key={`v-${index}`}>
                    <span className="cv-col-name cv-row-name">{row.name}</span>
                    {view === 'primitives' ? (
                      <span className="cv-col-val">
                        {row.dt === 'color' && typeof row.val === 'object' && row.val ? (
                          <>
                            <Swatch hex={row.val.hex} alpha={row.val.alpha} />
                            <span>{row.val.hex}</span>
                            {row.val.alpha < 1 ? <span className="cv-muted"> {Math.round(row.val.alpha * 100)}%</span> : null}
                          </>
                        ) : row.val != null ? (
                          <span className="cv-num">{String(row.val)}</span>
                        ) : null}
                      </span>
                    ) : (
                      <>
                        <span className="cv-col-val">
                          {row.dt === 'color' && row.lv && typeof row.lv === 'object' ? <AliasPill value={row.lv as TokenValue} /> : row.lv != null ? <span className="cv-num">{String(row.lv)}</span> : null}
                        </span>
                        <span className="cv-col-val">
                          {row.dt === 'color' && row.dv && typeof row.dv === 'object' ? <AliasPill value={row.dv as TokenValue} /> : row.dv != null ? <span className="cv-num">{String(row.dv)}</span> : null}
                        </span>
                      </>
                    )}
                  </div>
                )
              )) : <div className="cv-empty">No variables match your search.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="cv-tag">Explore our colour variables</div>
    </div>
  )
}
