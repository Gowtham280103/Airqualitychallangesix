/**
 * Input sanitization utilities
 */

/**
 * Strip HTML tags and limit string length
 */
export function sanitizeText(str, maxLen = 500) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')          // strip HTML
    .replace(/[^\w\s,.!?'\-–—]/g, '') // allow safe chars only
    .trim()
    .slice(0, maxLen)
}

/**
 * Sanitize a city name
 */
export function sanitizeCity(city) {
  if (typeof city !== 'string') return ''
  return city
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z\s\-,.']/g, '')
    .trim()
    .slice(0, 100)
}

/**
 * Validate coordinate
 */
export function isValidCoord(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  )
}

/**
 * Validate AQI value
 */
export function isValidAQI(value) {
  return typeof value === 'number' && value >= 0 && value <= 500
}
