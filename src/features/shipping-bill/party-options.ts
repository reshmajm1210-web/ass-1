/**
 * Adapters between the party/port services and the comboboxes.
 *
 * Services speak domain records (Exporter, Business, Branch, PortOption); the
 * combobox speaks {value,label,description}. Keeping the mapping here means
 * form components never touch service response shapes.
 */
import type { Branch, Business, BusinessRole, Exporter, PortOption } from '../../domain/shipping-bill/types.ts'
import {
  getBranchById,
  getBusinessById,
  getExporterById,
  searchBranches,
  searchBusinesses,
  searchExporters
} from '../../services/party-service.ts'
import { getPortByCode, searchDestinationPorts, searchLoadingPorts } from '../../services/port-service.ts'
import type { ComboboxOption } from '../../ui/index.ts'

export function toExporterOption(exporter: Exporter): ComboboxOption {
  return {
    value: String(exporter.id),
    label: exporter.name,
    description: exporter.iec ? `IEC ${exporter.iec}` : undefined
  }
}

export function toBusinessOption(business: Business): ComboboxOption {
  return {
    value: String(business.id),
    label: business.name,
    description: business.iec ? `IEC ${business.iec}` : undefined
  }
}

export function toBranchOption(branch: Branch): ComboboxOption {
  return {
    value: String(branch.id),
    label: branch.branchName,
    description: [branch.city, branch.countryCode].filter(Boolean).join(', ')
  }
}

export function toPortOption(port: PortOption): ComboboxOption {
  return { value: port.code, label: `${port.name} (${port.code})`, description: port.countryCode }
}

/* Loaders (called with the current query while the menu is open) ---------- */

export function loadExporterOptions(query: string): Promise<ComboboxOption[]> {
  return searchExporters(query).then((exporters) => exporters.map(toExporterOption))
}

export function loadBusinessOptions(role: BusinessRole) {
  return (query: string): Promise<ComboboxOption[]> =>
    searchBusinesses(query, role).then((businesses) => businesses.map(toBusinessOption))
}

export function loadBranchOptions(kind: 'exporter' | 'business', ownerId: string) {
  return (query: string): Promise<ComboboxOption[]> =>
    searchBranches(kind, ownerId, query).then((branches) => branches.map(toBranchOption))
}

export function loadLoadingPortOptions(query: string): Promise<ComboboxOption[]> {
  return searchLoadingPorts(query).then((ports) => ports.map(toPortOption))
}

export function loadDestinationPortOptions(query: string): Promise<ComboboxOption[]> {
  return searchDestinationPorts(query).then((ports) => ports.map(toPortOption))
}

/* Resolvers (echo the label of a value loaded from saved data) ------------ */

function optionResolver<T>(load: (value: string) => Promise<T | undefined>, map: (record: T) => ComboboxOption) {
  return (value: string): Promise<ComboboxOption | undefined> => load(value).then((record) => record && map(record))
}

export const resolveExporterOption = optionResolver(getExporterById, toExporterOption)
export const resolveBusinessOption = optionResolver(getBusinessById, toBusinessOption)
export const resolveBranchOption = optionResolver(getBranchById, toBranchOption)
export const resolvePortOption = optionResolver(getPortByCode, toPortOption)
