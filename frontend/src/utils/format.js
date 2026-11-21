/**
 * Formatting utilities for dates, numbers, distances and durations.
 */
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

/**
 * Parse a date value that may be a string or Date object.
 * Returns null if the value is not a valid date.
 * @param {string|Date} date
 * @returns {Date|null}
 */
function parseDate(date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  return isValid(d) ? d : null
}

/**
 * Format a date as "MMM d, yyyy" (e.g. "Jan 5, 2024").
 * Returns "Unknown date" on invalid input.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = parseDate(date)
  if (!d) return 'Unknown date'
  try {
    return format(d, 'MMM d, yyyy')
  } catch {
    return 'Unknown date'
  }
}

/**
 * Format a date as "MMM d, h:mm a" (e.g. "Jan 5, 3:45 PM").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  const d = parseDate(date)
  if (!d) return 'Unknown'
  try {
    return format(d, 'MMM d, h:mm a')
  } catch {
    return 'Unknown'
  }
}

/**
 * Format a date as a relative time string (e.g. "3 minutes ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const d = parseDate(date)
  if (!d) return 'Recently'
  try {
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return 'Recently'
  }
}

/**
 * Format a number to a fixed number of decimal places.
 * Returns '--' for null/undefined/NaN.
 * @param {number|null|undefined} n
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(n, decimals = 1) {
  if (n == null || !Number.isFinite(n)) return '--'
  return n.toFixed(decimals)
}

/**
 * Format a distance in metres to a human-readable string.
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return '--'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format a duration in minutes to "Xh Ym" or "X min".
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return '--'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
