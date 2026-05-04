// Core types for the client portal

export type ProposalStatus = 'draft' | 'pending' | 'accepted' | 'declined' | 'expired'
export type ProjectStatus = 'pre-project' | 'in-progress' | 'paused' | 'completed' | 'cancelled'
export type PhaseStatus = 'pending' | 'in-progress' | 'completed'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Proposal {
  id: string
  client: string
  clientContact: string
  title: string
  date: string
  validUntil: string
  status: ProposalStatus
  summary: string
  concerns: string[]
  whyRebuild: string
  scope: ScopeItem[]
  revisions: {
    included: number
    additionalPrice: number
    note: string
  }
  discoveryDetails: Record<string, DiscoveryItem>
  phaseII: {
    title: string
    rangeMin: number
    rangeMax: number
    note: string
  }
  pricing: {
    comparison: string
    reason: string
  }
  payment: {
    terms: PaymentTerm[]
    note: string
    support: string
  }
  timeline: string
  prototypeUrl?: string
}

export interface ScopeItem {
  phase: string
  desc: string
  deliverables: string[]
  hours: string
  price: number
}

export interface DiscoveryItem {
  title: string
  problem: string
  possibilities: string[]
  range: string
}

export interface PaymentTerm {
  milestone: string
  amount: number
}

export interface Project {
  id: string
  name: string
  client: string
  clientContact: string
  status: ProjectStatus
  startDate: string | null
  estimatedEnd: string | null
  proposalId: string
  phases: ProjectPhase[]
  recentActivity: ActivityItem[]
  nextMilestone: Milestone | null
  totalBudget: number
  paidAmount: number
}

export interface ProjectPhase {
  name: string
  status: PhaseStatus
  progress: number
  tasks: Task[]
}

export interface Task {
  name: string
  done: boolean
}

export interface ActivityItem {
  date: string
  action: string
  icon?: string
}

export interface Milestone {
  name: string
  date: string
  payment?: number
}

export interface Invoice {
  id: string
  projectId: string
  number: string
  date: string
  dueDate: string
  status: InvoiceStatus
  items: InvoiceItem[]
  total: number
  paidDate?: string
}

export interface InvoiceItem {
  description: string
  amount: number
}

export interface TeamMember {
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Deliverable {
  id: string
  name: string
  type: 'file' | 'link' | 'preview'
  url?: string
  date: string
  phase: string
  status: 'draft' | 'ready' | 'approved'
}
