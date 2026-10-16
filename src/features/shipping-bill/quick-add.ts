/**
 * Targets for the quick-add dialogs.
 *
 * Each target records where a newly created party (and its first branch)
 * should be written back into the form. Building them in one module keeps the
 * path strings out of the components.
 */
import type { BusinessRole } from '../../domain/shipping-bill/types.ts'

export interface QuickAddTarget {
  kind: 'exporter' | 'business'
  /** Role the new business is pre-ticked for; ignored for exporters. */
  role: BusinessRole
  ownerPath: string
  branchPath: string
  title: string
}

export interface QuickBranchTarget {
  kind: 'exporter' | 'business'
  ownerId: string
  branchPath: string
  title: string
}

export const quickAddExporter = (): QuickAddTarget => ({
  kind: 'exporter',
  role: 'consignee',
  ownerPath: 'exporterId',
  branchPath: 'exporterBranchId',
  title: 'Add exporter'
})

export const quickAddConsignee = (): QuickAddTarget => ({
  kind: 'business',
  role: 'consignee',
  ownerPath: 'consigneeId',
  branchPath: 'consigneeBranchId',
  title: 'Add consignee'
})

export const quickAddBuyer = (invoiceIndex: number): QuickAddTarget => ({
  kind: 'business',
  role: 'buyer',
  ownerPath: `invoices.${invoiceIndex}.buyerId`,
  branchPath: `invoices.${invoiceIndex}.buyerBranchId`,
  title: 'Add buyer'
})

export const quickAddThirdParty = (invoiceIndex: number): QuickAddTarget => ({
  kind: 'business',
  role: 'thirdParty',
  ownerPath: `invoices.${invoiceIndex}.thirdPartyId`,
  branchPath: `invoices.${invoiceIndex}.thirdPartyBranchId`,
  title: 'Add third party'
})

export const quickAddItemThirdParty = (invoiceIndex: number, itemIndex: number): QuickAddTarget => ({
  kind: 'business',
  role: 'thirdParty',
  ownerPath: `invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyId`,
  branchPath: `invoices.${invoiceIndex}.items.${itemIndex}.itemThirdPartyBranchId`,
  title: 'Add item third party'
})

export const quickAddBranch = (
  kind: 'exporter' | 'business',
  ownerId: string,
  branchPath: string,
  title = 'Add branch'
): QuickBranchTarget => ({
  kind,
  ownerId,
  branchPath,
  title
})
