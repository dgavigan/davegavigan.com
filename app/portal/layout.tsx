'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { PortalProvider } from './data/store'
export const dynamic = 'force-dynamic'

// Nav items are built dynamically in component to include proposal link

interface Client {
  id: string
  name: string
  slug: string
}

interface PortalInfo {
  user: { name: string | null; email: string; role?: string }
  client: Client | null
  clients?: Client[] // All clients (admin only)
  projects: { id: string; name: string; status: string; proposal?: { id: string } | null }[]
  memberRole?: string // owner, admin, viewer
}

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false)
  const [clientSwitcherOpen, setClientSwitcherOpen] = useState(false)
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null)
  const [showLogout, setShowLogout] = useState(false)

  const isAdmin = session?.user?.role === 'admin'
  const viewingClientId = searchParams.get('clientId')
  const selectedProjectId = searchParams.get('projectId')

  useEffect(() => {
    const url = viewingClientId ? `/api/portal?clientId=${viewingClientId}` : '/api/portal'
    fetch(url)
      .then(res => res.ok ? res.json() : null)
      .then(data => setPortalInfo(data))
      .catch(() => {})
  }, [viewingClientId])

  const isActive = (href: string) => {
    if (href === '/portal') return pathname === '/portal'
    return pathname.startsWith(href)
  }

  // Find current project - use selectedProjectId from URL, or default to first active project
  const getDefaultProject = () => {
    if (!portalInfo?.projects?.length) return undefined
    // Prefer active projects first
    const activeProject = portalInfo.projects.find(p => p.status === 'active')
    return activeProject || portalInfo.projects[0]
  }
  const currentProject = selectedProjectId 
    ? portalInfo?.projects?.find(p => p.id === selectedProjectId) || getDefaultProject()
    : getDefaultProject()
  const clientName = portalInfo?.client?.name || 'Client Portal'
  const userName = portalInfo?.user?.name || portalInfo?.user?.email?.split('@')[0] || 'User'

  // Build nav items with dynamic proposal link
  const proposalId = (currentProject as any)?.proposal?.id
  // Owners and admins see invoices, viewers don't
  const canSeeInvoices = isAdmin || portalInfo?.memberRole === 'owner' || portalInfo?.memberRole === 'admin'
  const navItems = [
    { href: '/portal', label: 'Dashboard', icon: '📊' },
    { href: '/portal/timeline', label: 'Timeline', icon: '📣' },
    // Direct proposal link - goes to the proposal page
    { href: proposalId ? `/portal/proposals/${proposalId}` : '/portal', label: 'Proposal', icon: '📝' },
    { href: '/portal/deliverables', label: 'Deliverables', icon: '📦' },
    ...(canSeeInvoices ? [{ href: '/portal/invoices', label: 'Invoices', icon: '💰' }] : []),
    { href: '/portal/team', label: 'Team', icon: '👥' },
    { href: '/portal/support', label: 'Support', icon: '🆘' },
    { href: '/portal/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const switchClient = (clientId: string) => {
    setClientSwitcherOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('clientId', clientId)
    params.delete('projectId') // Reset project when switching client
    router.push(`${pathname}?${params.toString()}`)
  }

  const switchProject = (projectId: string) => {
    setProjectSwitcherOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('projectId', projectId)
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearClientView = () => {
    setClientSwitcherOpen(false)
    router.push(pathname)
  }

  // Build nav href with clientId and projectId preserved
  const buildHref = (href: string) => {
    const params = new URLSearchParams()
    if (viewingClientId) params.set('clientId', viewingClientId)
    if (selectedProjectId) params.set('projectId', selectedProjectId)
    const queryString = params.toString()
    return queryString ? `${href}?${queryString}` : href
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Admin viewing banner */}
      {isAdmin && viewingClientId && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
          👁️ Viewing as: <strong>{clientName}</strong>
          <button onClick={clearClientView} className="ml-3 underline hover:no-underline">Exit</button>
        </div>
      )}

      {/* Mobile top bar */}
      <div className={`md:hidden fixed ${isAdmin && viewingClientId ? 'top-10' : 'top-0'} left-0 right-0 z-40 bg-[#1a1a2e] px-4 py-3 flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/me.jpg" alt="DG" width={26} height={26} className="rounded-full" />
          <span className="text-sm font-semibold text-white">Client Portal</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 p-1">
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {sidebarOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className={`md:hidden fixed ${isAdmin && viewingClientId ? 'top-[90px]' : 'top-[50px]'} left-0 right-0 z-40 bg-[#1a1a2e] border-b border-white/10 p-4 shadow-2xl`}>
            {/* Mobile Client Switcher (Admin only) */}
            {isAdmin && portalInfo?.clients && portalInfo.clients.length > 0 && (
              <div className="mb-3 pb-3 border-b border-white/10">
                <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-2">👁️ View As Client</div>
                <div className="space-y-1">
                  {viewingClientId && (
                    <button
                      onClick={() => { clearClientView(); setSidebarOpen(false); }}
                      className="w-full px-3 py-2 rounded-lg text-left text-gray-400 hover:bg-white/5 text-sm"
                    >
                      ← Back to Admin View
                    </button>
                  )}
                  {portalInfo.clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => { switchClient(client.id); setSidebarOpen(false); }}
                      className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                        client.id === viewingClientId 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'hover:bg-white/5 text-white'
                      }`}
                    >
                      <span className="text-sm truncate">{client.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Project Switcher */}
            <div className="mb-3 pb-3 border-b border-white/10">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Project</div>
              {portalInfo?.projects && portalInfo.projects.length > 1 ? (
                <div className="space-y-1">
                  {portalInfo.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => { switchProject(project.id); setSidebarOpen(false); }}
                      className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                        project.id === currentProject?.id 
                          ? 'bg-white/10' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] text-gray-500 truncate">{clientName}</div>
                          <span className={`text-sm truncate ${project.id === currentProject?.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {project.name}
                          </span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                          project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 rounded-lg bg-white/5 text-left">
                  <div className="text-[10px] text-gray-500 truncate">{clientName}</div>
                  <div className="text-sm text-white font-medium truncate">{currentProject?.name || 'No project'}</div>
                </div>
              )}
            </div>
            
            {/* Mobile nav */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>{item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-amber-400 hover:bg-white/5"
                >
                  <span className="mr-2">⚙️</span>Admin
                </Link>
              )}
            </div>

            {/* Mobile logout */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-gray-500">{portalInfo?.user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed ${isAdmin && viewingClientId ? 'top-10' : 'top-0'} left-0 w-60 ${isAdmin && viewingClientId ? 'h-[calc(100vh-40px)]' : 'h-screen'} bg-[#1a1a2e] border-r border-white/10 flex-col z-40`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/me.jpg" alt="DG" width={32} height={32} className="rounded-full ring-2 ring-white/10" />
            <div>
              <div className="text-sm font-semibold text-white">Dave Gavigan</div>
              <div className="text-[10px] text-gray-500">Client Portal</div>
            </div>
          </Link>
        </div>

        {/* Admin Client Switcher */}
        {isAdmin && portalInfo?.clients && portalInfo.clients.length > 0 && (
          <div className="p-3 border-b border-white/10">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-2 px-1">👁️ View As Client</div>
            <div className="relative">
              <button 
                onClick={() => setClientSwitcherOpen(!clientSwitcherOpen)}
                className="w-full px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {viewingClientId ? clientName : 'Select client...'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-amber-400 shrink-0 ml-2 transition-transform ${clientSwitcherOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {clientSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setClientSwitcherOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#252542] rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                    <div className="p-2">
                      {viewingClientId && (
                        <button
                          onClick={clearClientView}
                          className="w-full px-3 py-2 rounded-lg text-left text-gray-400 hover:bg-white/5 text-sm mb-1"
                        >
                          ← Back to Admin View
                        </button>
                      )}
                      {portalInfo.clients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => switchClient(client.id)}
                          className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                            client.id === viewingClientId 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : 'hover:bg-white/5 text-white'
                          }`}
                        >
                          <span className="text-sm truncate">{client.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Project Switcher */}
        <div className="p-3 border-b border-white/10">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">Project</div>
          <div className="relative">
            <button 
              onClick={() => setProjectSwitcherOpen(!projectSwitcherOpen)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-500 truncate">{clientName}</div>
                  <div className="text-sm text-white font-medium truncate">{currentProject?.name || 'No project'}</div>
                </div>
                {portalInfo?.projects && portalInfo.projects.length > 1 && (
                  <svg className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform ${projectSwitcherOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                )}
              </div>
            </button>

            {projectSwitcherOpen && portalInfo?.projects && portalInfo.projects.length > 1 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProjectSwitcherOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#252542] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-2">
                    {portalInfo.projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => switchProject(project.id)}
                        className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                          project.id === currentProject?.id 
                            ? 'bg-white/10' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${project.id === currentProject?.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {project.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                            project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildHref(item.href)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2.5">{item.icon}</span>{item.label}
            </Link>
          ))}
          
          {/* Admin link */}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all mt-2"
            >
              <span className="mr-2.5">⚙️</span>Admin Panel
            </Link>
          )}
        </nav>

        {/* User section with logout */}
        <div className="p-3 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${isAdmin ? 'bg-amber-500/30' : 'bg-white/10'}`}>
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{userName}</div>
                <div className="text-[10px] text-gray-500 truncate">
                  {isAdmin && <span className="text-amber-400">Admin · </span>}
                  {portalInfo?.user?.email}
                </div>
              </div>
            </button>

            {showLogout && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLogout(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-[#252542] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-white/5 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`${isAdmin && viewingClientId ? 'pt-[90px] md:pt-10' : 'pt-[50px] md:pt-0'} md:ml-60 min-h-screen`}>
        <div className="max-w-4xl mx-auto p-5 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider demo={false}>
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
          <div className="text-[var(--text-muted)]">Loading...</div>
        </div>
      }>
        <PortalLayoutInner>{children}</PortalLayoutInner>
      </Suspense>
    </PortalProvider>
  )
}
