import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import { cargoOptions, contractTypes, paymentTypes, priceInclusionTypes, sealTypes, weightUnits } from '@/data/types'
import { loadingPorts, ports, PortOption } from './model'

const MOCK_DELAY_MS = 150

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export interface FormOptions {
  loadingPorts: PortOption[]
  destinationPorts: PortOption[]
  portOptions: { value: string; label: string }[]
  currencyOptions: { value: string; label: string }[]
  contractTypes: typeof contractTypes
  paymentTypes: typeof paymentTypes
  priceInclusionTypes: typeof priceInclusionTypes
  sealTypes: typeof sealTypes
  weightUnits: typeof weightUnits
  cargoOptions: typeof cargoOptions
  stateOptions: typeof stateOptions
  documentCodes: typeof documentCodes
  quantityCodes: typeof quantityCodes
  schemeCodes: typeof schemeCodes
  tradeAgreements: typeof Trades
}

/**
 * Single boundary for all reference/option data used by the shipping bill form.
 * UI components must go through this service instead of importing hardcoded arrays.
 */
export const referenceDataService = {
  async getLoadingPorts(query = ''): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const list = loadingPorts.filter((port) => port.code.startsWith('IN'))
    const filtered = q
      ? list.filter((port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q))
      : list
    return delay(filtered)
  },

  async getDestinationPorts(query = ''): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? ports.filter((port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q))
      : ports
    return delay(filtered)
  },

  async getFormOptions(): Promise<FormOptions> {
    const portOptions = ports.map((port) => ({ value: port.code, label: `${port.name} · ${port.code}` }))
    const currencyOptions = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({ value, label: value }))
    return delay({
      loadingPorts,
      destinationPorts: ports,
      portOptions,
      currencyOptions,
      contractTypes,
      paymentTypes,
      priceInclusionTypes,
      sealTypes,
      weightUnits,
      cargoOptions,
      stateOptions,
      documentCodes,
      quantityCodes,
      schemeCodes,
      tradeAgreements: Trades
    })
  }
}
