// GitHub App API helper for issue management
import * as jwt from 'jsonwebtoken'
import * as fs from 'fs'
import * as path from 'path'

const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '3284025'
const GITHUB_PRIVATE_KEY_PATH = process.env.GITHUB_PRIVATE_KEY_PATH || path.join(process.cwd(), 'gavigan-client-portal.2026-04-05.private-key.pem')
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY // For Vercel: key contents as env var
const PORTAL_LABEL = 'portal'  // Label to identify client-submitted issues

// Cache for installation tokens (they last 1 hour)
const tokenCache: Map<string, { token: string; expires: number }> = new Map()

interface GitHubIssue {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: { name: string }[]
  created_at: string
  updated_at: string
  comments: number
  html_url: string
}

interface GitHubComment {
  id: number
  body: string
  user: { login: string }
  created_at: string
}

// Generate a JWT for the GitHub App
function generateAppJWT(): string {
  // Use env var (Vercel) or file path (local dev)
  const privateKey = GITHUB_PRIVATE_KEY || fs.readFileSync(GITHUB_PRIVATE_KEY_PATH, 'utf8')
  
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now - 60,  // Issued 60 seconds ago (clock drift)
    exp: now + (10 * 60),  // Expires in 10 minutes
    iss: GITHUB_APP_ID,
  }
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
}

// Get installation ID for a repo
async function getInstallationId(repo: string): Promise<number> {
  const [owner] = repo.split('/')
  const appJwt = generateAppJWT()
  
  const res = await fetch(`https://api.github.com/users/${owner}/installation`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${appJwt}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to get installation: ${res.status} - ${error}`)
  }
  
  const data = await res.json()
  return data.id
}

// Get an installation access token
async function getInstallationToken(repo: string): Promise<string> {
  // Check cache
  const cached = tokenCache.get(repo)
  if (cached && cached.expires > Date.now()) {
    return cached.token
  }
  
  const installationId = await getInstallationId(repo)
  const appJwt = generateAppJWT()
  
  const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${appJwt}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to get installation token: ${res.status} - ${error}`)
  }
  
  const data = await res.json()
  
  // Cache for 50 minutes (tokens last 60 minutes)
  tokenCache.set(repo, {
    token: data.token,
    expires: Date.now() + (50 * 60 * 1000),
  })
  
  return data.token
}

async function githubFetch(repo: string, url: string, options: RequestInit = {}) {
  const token = await getInstallationToken(repo)
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  })
  
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`GitHub API error: ${res.status} - ${error}`)
  }
  
  return res.json()
}

// Create an issue from the support form
export async function createPortalIssue(
  repo: string,
  title: string,
  body: string,
  submitter: { name: string | null; email: string }
): Promise<GitHubIssue> {
  const issueBody = `**Submitted by:** ${submitter.name || 'Unknown'} (${submitter.email})

---

${body}`

  const issue = await githubFetch(repo, `https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body: issueBody,
      labels: [PORTAL_LABEL],
    }),
  })

  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    comments: issue.comments || 0,
    labels: issue.labels || [],
    html_url: issue.html_url,
  }
}

// Get portal-labeled issues for a repo
export async function getPortalIssues(repo: string): Promise<GitHubIssue[]> {
  const issues = await githubFetch(
    repo,
    `https://api.github.com/repos/${repo}/issues?labels=${PORTAL_LABEL}&state=all&sort=updated&direction=desc&per_page=50`
  )
  
  return issues.map((issue: any) => ({
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    labels: issue.labels,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    comments: issue.comments,
    html_url: issue.html_url,
  }))
}

// Get a single issue
export async function getPortalIssue(repo: string, issueNumber: number): Promise<GitHubIssue | null> {
  try {
    const issue = await githubFetch(repo, `https://api.github.com/repos/${repo}/issues/${issueNumber}`)
    
    // Verify it has portal label
    const hasPortalLabel = issue.labels.some((l: any) => l.name === PORTAL_LABEL)
    if (!hasPortalLabel) return null
    
    return {
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      labels: issue.labels,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      comments: issue.comments,
      html_url: issue.html_url,
    }
  } catch {
    return null
  }
}

// Get comments on an issue
export async function getIssueComments(repo: string, issueNumber: number): Promise<GitHubComment[]> {
  const comments = await githubFetch(
    repo,
    `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`
  )
  
  return comments.map((c: any) => ({
    id: c.id,
    body: c.body,
    user: { login: c.user.login },
    created_at: c.created_at,
  }))
}

// Add a comment to an issue
export async function addIssueComment(
  repo: string,
  issueNumber: number,
  body: string,
  commenter: { name: string | null; email: string }
): Promise<GitHubComment> {
  const commentBody = `**${commenter.name || commenter.email}** commented via portal:

${body}`

  const comment = await githubFetch(
    repo,
    `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ body: commentBody }),
    }
  )
  
  return {
    id: comment.id,
    body: comment.body,
    user: { login: comment.user.login },
    created_at: comment.created_at,
  }
}

// Update an issue's body
export async function updateIssueBody(
  repo: string,
  issueNumber: number,
  newBody: string,
  submitter: { name: string | null; email: string }
): Promise<void> {
  const issueBody = `**Submitted by:** ${submitter.name || 'Unknown'} (${submitter.email})

---

${newBody}`

  await githubFetch(repo, `https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({ body: issueBody }),
  })
}

// Ensure the portal label exists in the repo
export async function ensurePortalLabel(repo: string): Promise<void> {
  try {
    await githubFetch(repo, `https://api.github.com/repos/${repo}/labels/${PORTAL_LABEL}`)
  } catch {
    // Label doesn't exist, create it
    await githubFetch(repo, `https://api.github.com/repos/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({
        name: PORTAL_LABEL,
        color: '7B68EE',  // Medium purple
        description: 'Submitted via client portal',
      }),
    })
  }
}
