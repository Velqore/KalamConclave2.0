import { ensureSupabase, supabase } from './supabaseClient'

const VISITOR_STORAGE_KEY = 'kalamConclaveVisitorId'

const toRole = (pathname = '/') => {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/volunteer')) return 'volunteer'
  return 'viewer'
}

const getVisitorId = () => {
  const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
  if (existing) return existing
  const next = crypto.randomUUID()
  localStorage.setItem(VISITOR_STORAGE_KEY, next)
  return next
}

export async function trackPageView(pathname = '/') {
  if (!supabase) return

  const role = toRole(pathname)
  const onceKey = `page-view:${role}:${pathname}`
  if (sessionStorage.getItem(onceKey) === '1') return
  sessionStorage.setItem(onceKey, '1')

  try {
    const client = ensureSupabase()
    await client.from('page_views').insert({
      path: pathname,
      viewer_role: role,
      visitor_id: getVisitorId(),
    })
  } catch {
    // intentionally swallow errors to avoid blocking navigation
  }
}

export async function fetchPageViewSummary() {
  if (!supabase) return { total: 0, unique: 0, byPath: [] }

  const client = ensureSupabase()
  const { data, error } = await client
    .from('page_views')
    .select('path, visitor_id')

  if (error) throw error

  const pathMap = new Map()
  const visitors = new Set()

  for (const row of data ?? []) {
    visitors.add(row.visitor_id)
    pathMap.set(row.path, (pathMap.get(row.path) ?? 0) + 1)
  }

  const byPath = Array.from(pathMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)

  return {
    total: data?.length ?? 0,
    unique: visitors.size,
    byPath,
  }
}
