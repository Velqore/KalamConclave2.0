export const rulesKey = (id) => `sub_event_rules_${id}`

export function parseRules(value) {
  try {
    if (value) {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean)
      }
    }
  } catch (err) {
    console.warn('[KalamConclave] Failed to parse sub-event rules from settings:', err)
  }
  return []
}

const markdownDropPatterns = [
  /^.+\s+rulebook$/i,
  /^\d+\.\s*(about the event|theme|nature of the competition|eligibility criteria|general rules|time limit|performance guidelines|awards and recognition)\s*$/i,
  /^format$/i,
  /^duration$/i,
  /^suggested sub-themes$/i,
]

function normalizeRuleLine(line) {
  return line
    .replace(/^[-*•]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .trim()
}

export function parseRulesMarkdown(markdownText) {
  if (!markdownText) return []

  return markdownText
    .split('\n')
    .map((line) => normalizeRuleLine(line))
    .filter(Boolean)
    .filter((line) => !markdownDropPatterns.some((pattern) => pattern.test(line)))
}

async function loadRulesFromFile(path) {
  if (!path) return []
  if (typeof fetch !== 'function') {
    console.warn(`[KalamConclave] Fetch is unavailable, cannot load rules file "${path}".`)
    return []
  }

  try {
    const response = await fetch(path)
    if (!response.ok) return []
    const markdownText = await response.text()
    return parseRulesMarkdown(markdownText)
  } catch (err) {
    console.warn(`[KalamConclave] Failed to load rules file "${path}":`, err)
    return []
  }
}

export async function loadDefaultRulesMap(events) {
  const entries = await Promise.all(
    events.map(async (event) => [event.id, await loadRulesFromFile(event.rulesFile)]),
  )
  return Object.fromEntries(entries)
}

export function getEffectiveRules({ settings, eventId, defaults }) {
  const liveRules = parseRules(settings[rulesKey(eventId)])
  if (liveRules.length > 0) return liveRules
  return defaults[eventId] ?? []
}
