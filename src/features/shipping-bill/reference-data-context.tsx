import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import type { ReferenceData } from '../../services/reference-data-service.ts'

const ReferenceDataContext = createContext<ReferenceData | null>(null)

/**
 * Code lists (currencies, schemes, quantity codes, …) fetched once per form.
 * Sections read them from here instead of importing arrays, so the only way
 * data reaches the UI is through the service layer.
 */
export function ReferenceDataProvider({ data, children }: { data: ReferenceData; children: ReactNode }) {
  return <ReferenceDataContext.Provider value={data}>{children}</ReferenceDataContext.Provider>
}

export function useReferenceData(): ReferenceData {
  const data = useContext(ReferenceDataContext)
  if (!data) throw new Error('useReferenceData must be used inside <ReferenceDataProvider>')
  return data
}
