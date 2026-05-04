/**
 * E2E Flow Tests for Client Portal
 * Run: npx tsx scripts/test-flows.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://192.168.1.66:3002'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✅ ${name}`)
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message })
    console.log(`❌ ${name}: ${err.message}`)
  }
}

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  return { status: res.status, data: await res.json().catch(() => null) }
}

// ============ TESTS ============

async function runTests() {
  console.log('\n🧪 Running E2E Flow Tests\n')
  console.log(`Base URL: ${BASE_URL}\n`)

  // 1. Server is running
  await test('Server responds', async () => {
    const res = await fetch(BASE_URL)
    if (!res.ok) throw new Error(`Status ${res.status}`)
  })

  // 2. Login page accessible
  await test('Login page loads', async () => {
    const res = await fetch(`${BASE_URL}/login`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
  })

  // 3. Protected routes require auth
  await test('Portal requires auth', async () => {
    const { status } = await fetchJSON('/api/portal')
    if (status !== 401) throw new Error(`Expected 401, got ${status}`)
  })

  // 4. Admin API requires auth
  await test('Admin API requires auth', async () => {
    const { status } = await fetchJSON('/api/admin/clients')
    if (status !== 401) throw new Error(`Expected 401, got ${status}`)
  })

  // 5. Proposal API requires auth
  await test('Proposal API requires auth', async () => {
    const { status } = await fetchJSON('/api/proposals/test-id')
    if (status !== 401) throw new Error(`Expected 401, got ${status}`)
  })

  // Summary
  console.log('\n' + '='.repeat(40))
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)

  if (failed > 0) {
    console.log('Failed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`)
    })
  }
}

// ============ REQUIREMENTS CHECKLIST ============

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           BOOTH MEDICAL MVP - REQUIREMENTS                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  ADMIN (dave@davegavigan.com):                                ║
║  [ ] Create/manage clients                                     ║
║  [ ] Create/manage projects                                    ║
║  [ ] Create proposals (with rich content)                      ║
║  [ ] Post timeline updates (manual)                            ║
║  [ ] Upload deliverables (auto-creates timeline event)         ║
║                                                                ║
║  CLIENT (jared@boothmed.com):                                  ║
║  [ ] Login and see their portal                                ║
║  [ ] View proposal with full details                           ║
║  [ ] Accept or comment on proposal                             ║
║  [ ] See timeline of events (read-only)                        ║
║  [ ] Comment on timeline updates (not create)                  ║
║  [ ] View deliverables                                         ║
║                                                                ║
║  TIMELINE (system-generated):                                  ║
║  [ ] Proposal sent                                             ║
║  [ ] Proposal accepted                                         ║
║  [ ] Deliverable uploaded                                      ║
║  [ ] Manual update from admin                                  ║
║                                                                ║
║  NICE TO HAVE (later):                                         ║
║  [ ] Email notifications                                       ║
║  [ ] Office hours → send email                                 ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
`)

runTests().catch(console.error)
