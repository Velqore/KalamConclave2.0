import { ensureSupabase, supabase } from './supabaseClient'

const VISITOR_STORAGE_KEY = 'appVisitorId'
const LAST_TRACK_STORAGE_KEY = 'lastTrackedPageView'
const TRACK_DEDUPE_WINDOW_MS = 1_500

const toRole = (pathname = '/') => {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/volunteer')) return 'volunteer'
  return 'viewer'
}

const getVisitorId = () => {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
  } catch {
    // continue with session fallback
  }

  try {
    const existing = sessionStorage.getItem(VISITOR_STORAGE_KEY)
    if (existing) return existing
  } catch {
    // continue with generated fallback
  }

  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

  try {
    localStorage.setItem(VISITOR_STORAGE_KEY, next)
  } catch {
    try {
      sessionStorage.setItem(VISITOR_STORAGE_KEY, next)
    } catch {
      // ignore storage write failures
    }
  }

  return next
}

export async function trackPageView(pathname = '/') {
  if (!supabase) return

  const role = toRole(pathname)
  const signature = `${role}:${pathname}`
  const now = Date.now()

  try {
    const serialized = sessionStorage.getItem(LAST_TRACK_STORAGE_KEY)
    if (serialized) {
      const previous = JSON.parse(serialized)
      if (previous?.signature === signature && now - (previous.timestamp ?? 0) < TRACK_DEDUPE_WINDOW_MS) {
        return
      }
    }
    sessionStorage.setItem(LAST_TRACK_STORAGE_KEY, JSON.stringify({ signature, timestamp: now }))
  } catch {
    // ignore storage errors and continue tracking
  }

  try {
    const client = ensureSupabase()
    await client.from('page_views').insert({
      path: pathname,
      viewer_role: role,
      visitor_id: getVisitorId(),
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

export async function resetPageViews() {
  if (!supabase) return

  const client = ensureSupabase()
  const { error } = await client.from('page_views').delete().neq('id', 0)

  if (error) {
    const nonFatalCodes = new Set(['42P01', '42501', 'PGRST116'])
    if (nonFatalCodes.has(error.code)) {
      console.warn('Page view reset unavailable:', error.message)
      return
    }
    throw error
  }
}

export async function fetchPageViewSummary() {
  if (!supabase) return { total: 0, unique: 0, byPath: [] }

  const client = ensureSupabase()
  const { data, error } = await client
    .from('page_views')
    .select('path, visitor_id')

  if (error) {
    // Gracefully handle cases where the table doesn't exist yet (42P01) or
    // the anon role lacks SELECT permission (42501). In both cases return an
    // empty summary so the UI shows zeros instead of an error banner.
    const nonFatalCodes = new Set(['42P01', '42501', 'PGRST116'])
    if (nonFatalCodes.has(error.code)) {
      console.warn('Page view analytics unavailable:', error.message)
      return { total: 0, unique: 0, byPath: [] }
    }
    throw error
  }

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
