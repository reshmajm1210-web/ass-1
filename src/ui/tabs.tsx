import type { ReactNode } from 'react'

export interface TabDefinition {
  id: string
  label: string
}

interface TabListProps {
  tabs: TabDefinition[]
  value: string
  onChange: (id: string) => void
}

export function TabList({ tabs, value, onChange }: TabListProps) {
  return (
    <div className="tabs__list" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={tab.id === value}
          aria-controls={`panel-${tab.id}`}
          className={['tabs__trigger', tab.id === value ? 'tabs__trigger--active' : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  id: string
  activeId: string
  children: ReactNode
}

/**
 * Panels stay mounted while hidden, so typing in one tab is never lost when
 * the user visits another (the starter's PersistentTab behaviour).
 */
export function TabPanel({ id, activeId, children }: TabPanelProps) {
  const active = id === activeId
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      className="tabs__panel">
      {children}
    </div>
  )
}
