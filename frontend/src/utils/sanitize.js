/**
 * Input sanitization utilities.
 * Used on the frontend before sending data to the API.
 */

/**
 * Strip HTML tags and control characters, then trim and limit length.
 * Allows printable ASCII including common punctuation.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizeText(str, maxLen = 500) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')            // strip HTML tags
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen)
}

/**
 * Sanitize a city name — allow letters, spaces, hyphens, commas and periods only.
 * @param {string} city
 * @returns {string}
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
 * Validate that a latitude/longitude pair is within valid geographic ranges.
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isValidCoord(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  )
}

/**
 * Validate that an AQI value is a finite number within the 0–500 range.
 * @param {number} value
 * @returns {boolean}
 */
export function isValidAQI(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 500
}
