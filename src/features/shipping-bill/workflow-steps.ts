/**
 * The export-job workflow the shipping bill is the first step of. Steps
 * without a `route` are shown as planned work, exactly as in the starter.
 */
export interface WorkflowStep {
  id: string
  title: string
  description: string
  route?: (billId: number | string) => string
}

export const workflowSteps: WorkflowStep[] = [
  { id: 'shipping-bill', title: 'Shipping bill', description: 'Current step' },
  { id: 'document-review', title: 'Document review', description: 'Planned' },
  { id: 'customs-filing', title: 'Customs filing', description: 'Planned' },
  { id: 'shipment-tracking', title: 'Shipment tracking', description: 'Planned' }
]
