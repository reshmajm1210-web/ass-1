/**
 * Reference-data service — every code list the form needs (currencies,
 * schemes, quantity codes, states, trade agreements, …).
 *
 * The starter imported these arrays straight into components, which the
 * assignment explicitly rules out ("Directly importing hardcoded arrays into
 * components does not meet this requirement"). Here the lists are fetched
 * once per form as a bundle, cached, and served over the same async boundary
 * as everything else — a real `GET /api/reference-data` slots right in.
 */
import type { Option, PortOption, SchemeCodeOption } from '../domain/shipping-bill/types.ts'
import { QUICK_LATENCY_MS, simulateNetwork } from './mock/latency.ts'
import * as data from './mock/reference-data.ts'

/** The bundle a shipping-bill form needs before it can render selects. */
export interface ReferenceData {
  currencies: Option[]
  contractTypes: Option[]
  weightUnits: Option[]
  paymentTypes: Option[]
  priceInclusionTypes: Option[]
  cargoOptions: Option[]
  sealTypes: Option[]
  nfeiCategories: Option[]
  stateOptions: Option[]
  quantityCodes: Option[]
  schemeCodes: SchemeCodeOption[]
  tradeAgreements: Option[]
  containerSizes: Option[]
  containerSealTypes: Option[]
  igstPaymentOptions: Option[]
  accessoryStatusOptions: Option[]
  goodsSourceOptions: Option[]
  countries: Option[]
  exporterClassOptions: Option[]
  exporterTypeOptions: Option[]
  /** Every known port — feeds plain selects such as "discharge port". */
  ports: PortOption[]
}

let cache: ReferenceData | null = null

function buildReferenceData(): ReferenceData {
  return {
    currencies: data.currencyOptions,
    contractTypes: data.contractTypes,
    weightUnits: data.weightUnits,
    paymentTypes: data.paymentTypes,
    priceInclusionTypes: data.priceInclusionTypes,
    cargoOptions: data.cargoOptions,
    sealTypes: data.sealTypes,
    nfeiCategories: data.nfeiCategories,
    stateOptions: data.stateOptions,
    quantityCodes: data.quantityCodes,
    schemeCodes: data.schemeCodes,
    tradeAgreements: data.tradeAgreementOptions,
    containerSizes: data.containerSizes,
    containerSealTypes: data.containerSealTypes,
    igstPaymentOptions: data.igstPaymentOptions,
    accessoryStatusOptions: data.accessoryStatusOptions,
    goodsSourceOptions: data.goodsSourceOptions,
    countries: data.countries,
    exporterClassOptions: data.exporterClassOptions,
    exporterTypeOptions: data.exporterTypeOptions,
    ports: data.allPorts
  }
}

/**
 * Fetch the whole code-list bundle. Served from an in-memory cache after the
 * first call (like a query cache would), so only the initial load pays the
 * full latency.
 */
export function getReferenceData(): Promise<ReferenceData> {
  if (cache) return simulateNetwork(() => cache!, { delayMs: QUICK_LATENCY_MS })
  return simulateNetwork(() => {
    cache = buildReferenceData()
    return cache
  })
}

/**
 * Scheme helper re-exported here so feature code never imports from
 * `services/mock` directly — the service module is the public boundary.
 */
export { schemeShowsDrawback } from './mock/reference-data.ts'

/** Type-to-search over e-Sanchit document type codes. */
export function searchDocumentCodes(query: string): Promise<Option[]> {
  return simulateNetwork(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.documentCodes
    return data.documentCodes.filter(
      (doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q)
    )
  }, { query })
}

/** Resolve one document code to its label. */
export function getDocumentCodeLabel(value: string): Promise<string> {
  return simulateNetwork(() => data.documentCodes.find((doc) => doc.value === value)?.label ?? value, {
    delayMs: QUICK_LATENCY_MS
  })
}

/** Searchable file types for supporting documents. */
export function searchFileTypeOptions(query: string): Promise<Option[]> {
  return simulateNetwork(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.fileTypeOptions
    return data.fileTypeOptions.filter(
      (option) => option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q)
    )
  }, { query })
}

/**
 * Marks & numbers available for one exporter. Exporters without configured
 * marks resolve to an empty list — the form renders that as a disabled
 * select with an explanatory placeholder (empty state).
 */
export function getMarksAndNumbersOptions(exporterId: string): Promise<Option[]> {
  return simulateNetwork(() => (exporterId ? (data.marksByExporter[exporterId] ?? []) : []), {
    delayMs: QUICK_LATENCY_MS
  })
}
