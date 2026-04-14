export const EVENT_SHORT_TITLE = 'Kalam Conclave 2.0'
export const EVENT_LOGO_URL = 'https://github.com/user-attachments/assets/c7ec9256-9ba7-4a9f-b194-64910d35c68d'

const LEGACY_EVENT_SHORT_TITLES = new Set(['1st Kalam Conclave 2.0'])

export function normalizeEventShortTitle(value) {
  const text = String(value ?? '').trim()
  if (!text) return EVENT_SHORT_TITLE
  return LEGACY_EVENT_SHORT_TITLES.has(text) ? EVENT_SHORT_TITLE : text
}
