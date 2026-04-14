/**
 * Returns the registration deadline as a human-readable string,
 * computed as two days before the given ISO event date string.
 * Returns null if the date is missing or invalid.
 */
export function getRegistrationDeadline(eventDateStr) {
  if (!eventDateStr) return null
  const d = new Date(eventDateStr)
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() - 2)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
