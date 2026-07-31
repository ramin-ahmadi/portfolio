import { type CSSProperties, useState } from 'react'
import './ColourVariables.css'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger'

type VariableRow = {
  name: 'background' | 'color'
  swatch: string
  alias: string
}

type VariableGroup = {
  path?: string[]
  rows: VariableRow[]
}

const SIDEBAR_ITEMS = [
  { label: 'button', level: 0 },
  { label: 'primary', level: 1, variant: 'primary' as const },
  { label: 'hover', level: 2 },
  { label: 'border', level: 3 },
  { label: 'active', level: 2 },
  { label: 'border', level: 3 },
  { label: 'border', level: 2 },
  { label: 'focus', level: 2 },
  { label: 'ring', level: 3 },
  { label: 'secondary', level: 1, variant: 'secondary' as const },
  { label: 'tertiary', level: 1, variant: 'tertiary' as const },
  { label: 'success', level: 1, variant: 'success' as const },
  { label: 'warning', level: 1, variant: 'warning' as const },
  { label: 'danger', level: 1, variant: 'danger' as const },
  { label: 'contrast', level: 1 },
  { label: 'link', level: 1 },
]

const VARIANT_COLOURS: Record<ButtonVariant, {
  base: string
  baseAlias: string
  hover: string
  hoverAlias: string
  active: string
  activeAlias: string
  contrast: string
  contrastAlias: string
}> = {
  primary: {
    base: '#4caf43',
    baseAlias: 'primary/color',
    hover: '#348b31',
    hoverAlias: 'primary/hover/color',
    active: '#245f27',
    activeAlias: 'primary/active/color',
    contrast: '#ffffff',
    contrastAlias: 'primary/contrast/color',
  },
  secondary: {
    base: '#2F4460',
    baseAlias: 'secondary/color',
    hover: '#00234B',
    hoverAlias: 'secondary/hover/color',
    active: '#141E2E',
    activeAlias: 'secondary/active/color',
    contrast: '#FFFFFF',
    contrastAlias: 'secondary/contrast/color',
  },
  tertiary: {
    base: '#AEB8BF',
    baseAlias: 'tertiary/color',
    hover: '#687781',
    hoverAlias: 'tertiary/hover/color',
    active: '#2B343B',
    activeAlias: 'tertiary/active/color',
    contrast: '#FFFFFF',
    contrastAlias: 'tertiary/contrast/color',
  },
  success: {
    base: '#1F9E16',
    baseAlias: 'success/light',
    hover: '#1A6F1A',
    hoverAlias: 'success/base',
    active: '#155615',
    activeAlias: 'success/dark-hover',
    contrast: '#FFFFFF',
    contrastAlias: 'success/contrast/color',
  },
  warning: {
    base: '#D97706',
    baseAlias: 'warning/color',
    hover: '#B85F00',
    hoverAlias: 'warning/hover/color',
    active: '#8A4700',
    activeAlias: 'warning/active/color',
    contrast: '#FFFFFF',
    contrastAlias: 'warning/contrast/color',
  },
  danger: {
    base: '#C94740',
    baseAlias: 'danger/color',
    hover: '#A93B36',
    hoverAlias: 'danger/hover/color',
    active: '#7A2B28',
    activeAlias: 'danger/active/color',
    contrast: '#FFFFFF',
    contrastAlias: 'danger/contrast/color',
  },
}

function getVariableGroups(variant: ButtonVariant): VariableGroup[] {
  const colours = VARIANT_COLOURS[variant]

  const groups: VariableGroup[] = [
    {
      rows: [
        { name: 'background', swatch: colours.base, alias: colours.baseAlias },
        { name: 'color', swatch: colours.contrast, alias: colours.contrastAlias },
      ],
    },
    {
      path: ['button', variant, 'hover'],
      rows: [
        { name: 'background', swatch: colours.hover, alias: colours.hoverAlias },
        { name: 'color', swatch: colours.contrast, alias: colours.contrastAlias },
      ],
    },
    {
      path: ['button', variant, 'hover', 'border'],
      rows: [
        { name: 'color', swatch: colours.hover, alias: colours.hoverAlias },
      ],
    },
    {
      path: ['button', variant, 'active'],
      rows: [
        { name: 'background', swatch: colours.active, alias: colours.activeAlias },
        { name: 'color', swatch: colours.contrast, alias: colours.contrastAlias },
      ],
    },
  ]

  return groups
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
      <path d="M7 3.5v13" />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5a7.5 7.5 0 0 0 0 15h1.1a1.6 1.6 0 0 0 1.1-2.75 1.6 1.6 0 0 1 1.1-2.75h1.2a3 3 0 0 0 3-3A7.5 7.5 0 0 0 10 2.5Z" />
      <circle cx="6.5" cy="8" r=".8" />
      <circle cx="8.5" cy="5.5" r=".8" />
      <circle cx="12" cy="5.5" r=".8" />
      <circle cx="14" cy="8" r=".8" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v14M3 10h14" />
    </svg>
  )
}

function VariableValue({ swatch, alias }: Pick<VariableRow, 'swatch' | 'alias'>) {
  return (
    <span className="cvf-value">
      <span className="cvf-swatch" style={{ backgroundColor: swatch }} />
      <span className="cvf-alias">{alias}</span>
    </span>
  )
}

function GroupPath({ path }: { path: string[] }) {
  return (
    <div className="cvf-group">
      {path.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? <span className="cvf-slash"> / </span> : null}
          <span className={index === path.length - 1 ? 'cvf-group-current' : ''}>{part}</span>
        </span>
      ))}
    </div>
  )
}

export default function ColourVariables() {
  const [variant, setVariant] = useState<ButtonVariant>('primary')
  const variableGroups = getVariableGroups(variant)

  return (
    <div className="cvf-outer">
      <div className="cvf-window">
        <aside className="cvf-sidebar">
          <div className="cvf-sidebar-header">
            <strong>Enable</strong>
            <span className="cvf-menu">•••</span>
          </div>

          <div className="cvf-sidebar-list">
            {SIDEBAR_ITEMS.map((item, index) => {
              const isSelected = item.variant === variant
              const className = `cvf-sidebar-item${isSelected ? ' cvf-sidebar-item--selected' : ''}`
              const style = { '--cvf-level': item.level } as CSSProperties

              return item.variant ? (
                <button
                  className={`${className} cvf-sidebar-tab`}
                  key={`${item.label}-${index}`}
                  type="button"
                  aria-pressed={isSelected}
                  data-variant={item.variant}
                  style={style}
                  onClick={() => setVariant(item.variant)}
                >
                  {item.label}
                </button>
              ) : (
                <div
                  className={className}
                  key={`${item.label}-${index}`}
                  style={style}
                >
                  {item.label}
                </div>
              )
            })}
          </div>
        </aside>

        <section className="cvf-main">
          <div className="cvf-main-header">
            <PanelIcon />
         
          </div>

          <div className="cvf-table-header">
            <strong>Name</strong>
            <strong>Light theme</strong>
            <PlusIcon />
          </div>

          <div className="cvf-table-body">
            {variableGroups.map((group, groupIndex) => (
              <div className="cvf-variable-group" key={`group-${groupIndex}`}>
                {group.path ? <GroupPath path={group.path} /> : null}
                {group.rows.map((row, rowIndex) => (
                  <div className="cvf-variable-row" key={`${row.name}-${rowIndex}`}>
                    <span className="cvf-variable-name">
                      <PaletteIcon />
                      {row.name}
                    </span>
                    <VariableValue swatch={row.swatch} alias={row.alias} />
                    <span />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="cvf-create">
            <PlusIcon />
            <span>Create variable</span>
          </div>
        </section>
      </div>
    </div>
  )
}
