'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Proposal, Project, Invoice, Deliverable, TeamMember } from './types'
import { demoProposal, demoProject } from './demo-proposal'

// Demo data
const DEMO_CLIENT = {
  name: 'Acme Medical Supply',
  contact: 'Alex Thompson',
  email: 'alex@acmemedical.example.com',
}

const demoInvoices: Invoice[] = []

const demoDeliverables: Deliverable[] = [
  {
    id: 'del-1',
    name: 'Homepage Draft',
    type: 'preview',
    url: 'https://medequip-prototype.vercel.app/',
    date: '2026-03-21',
    phase: 'Theme Development',
    status: 'ready',
  },
  {
    id: 'del-2',
    name: 'Shop Page with Filters',
    type: 'preview',
    url: 'https://medequip-prototype.vercel.app/shop',
    date: '2026-03-22',
    phase: 'Theme Development',
    status: 'ready',
  },
]

const demoTeam: TeamMember[] = [
  {
    name: 'Dave Gavigan',
    email: 'davegavigan@gmail.com',
    role: 'Developer',
    avatar: '/assets/me.jpg',
  },
  {
    name: 'Alex Thompson',
    email: 'alex@acmemedical.example.com',
    role: 'Project Owner',
  },
]

// Store interface
interface PortalStore {
  isDemo: boolean
  currentProject: Project | null
  currentProposal: Proposal | null
  projects: Project[]
  proposals: Proposal[]
  invoices: Invoice[]
  deliverables: Deliverable[]
  team: TeamMember[]
  clientName: string
  clientContact: string
  setDemo: (isDemo: boolean) => void
  acceptProposal: (proposalId: string) => void
  getProposal: (id: string) => Proposal | null
  getProject: (id: string) => Project | null
}

const PortalContext = createContext<PortalStore | null>(null)

export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) {
    throw new Error('usePortal must be used within PortalProvider')
  }
  return context
}

interface PortalProviderProps {
  children: ReactNode
  demo?: boolean
}

export function PortalProvider({ children, demo = true }: PortalProviderProps) {
  const [isDemo, setIsDemo] = useState(demo)
  const [proposals, setProposals] = useState<Proposal[]>([demoProposal as Proposal])
  const [projects, setProjects] = useState<Project[]>([demoProject as unknown as Project])
  const [invoices] = useState<Invoice[]>(demoInvoices)
  const [deliverables] = useState<Deliverable[]>(demoDeliverables)
  const [team] = useState<TeamMember[]>(demoTeam)

  const currentProject = projects[0] || null
  const currentProposal = proposals[0] || null

  const acceptProposal = (proposalId: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: 'accepted' as const } : p
    ))
    
    setProjects(prev => {
      const existing = prev.find(p => p.proposalId === proposalId)
      if (existing) {
        return prev.map(p => 
          p.proposalId === proposalId 
            ? { ...p, status: 'in-progress' as const, startDate: new Date().toISOString().split('T')[0] }
            : p
        )
      }
      return prev
    })
  }

  const getProposal = (id: string) => proposals.find(p => p.id === id) || null
  const getProject = (id: string) => projects.find(p => p.id === id) || null

  const value: PortalStore = {
    isDemo,
    currentProject,
    currentProposal,
    projects,
    proposals,
    invoices,
    deliverables,
    team,
    clientName: DEMO_CLIENT.name,
    clientContact: DEMO_CLIENT.contact,
    setDemo: setIsDemo,
    acceptProposal,
    getProposal,
    getProject,
  }

  return (
    <PortalContext.Provider value={value}>
      {children}
    </PortalContext.Provider>
  )
}
