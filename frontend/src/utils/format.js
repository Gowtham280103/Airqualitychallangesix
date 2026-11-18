import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date) {
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return 'Unknown date'
  }
}

export function formatDateTime(date) {
  try {
    return format(new Date(date), 'MMM d, h:mm a')
  } catch {
    return 'Unknown'
  }
}

export function formatRelativeTime(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'Recently'
  }
}

export function formatNumber(n, decimals = 1) {
  if (n == null || isNaN(n)) return '--'
  return Number(n).toFixed(decimals)
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
