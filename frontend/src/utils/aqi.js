/**
 * AQI utility functions — US EPA & Indian NAQI standard breakpoints
 */

export const AQI_CATEGORIES = [
  {
    label: 'Good',
    min: 0,
    max: 50,
    color: '#22c55e',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'Air quality is satisfactory, posing little or no risk.',
    advice: 'Enjoy outdoor activities freely.',
    icon: '😊',
  },
  {
    label: 'Moderate',
    min: 51,
    max: 100,
    color: '#eab308',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'Acceptable air quality. Some pollutants may concern very sensitive individuals.',
    advice: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
    icon: '😐',
  },
  {
    label: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    color: '#f97316',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'Members of sensitive groups may experience health effects.',
    advice: 'Sensitive groups should reduce prolonged outdoor exertion.',
    icon: '😷',
  },
  {
    label: 'Unhealthy',
    min: 151,
    max: 200,
    color: '#ef4444',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'Everyone may begin to experience health effects.',
    advice: 'Everyone should reduce prolonged outdoor exertion.',
    icon: '🤒',
  },
  {
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#8b5cf6',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Health alert: Everyone may experience more serious effects.',
    advice: 'Everyone should avoid prolonged outdoor exertion.',
    icon: '😨',
  },
  {
    label: 'Hazardous',
    min: 301,
    max: 500,
    color: '#991b1b',
    bgColor: 'bg-red-100 dark:bg-red-950/50',
    textColor: 'text-red-800 dark:text-red-300',
    borderColor: 'border-red-300 dark:border-red-900',
    description: 'Health warning: Emergency conditions. Everyone is affected.',
    advice: 'Everyone should avoid all outdoor exertion.',
    icon: '☠️',
  },
]

export function getAQICategory(aqi) {
  if (aqi == null || isNaN(aqi)) return AQI_CATEGORIES[0]
  return (
    AQI_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) ||
    AQI_CATEGORIES[AQI_CATEGORIES.length - 1]
  )
}

export function getAQIPercent(aqi) {
  return Math.min(100, Math.max(0, (aqi / 500) * 100))
}

export const POLLUTANT_INFO = {
  pm25: {
    label: 'PM2.5',
    unit: 'µg/m³',
    safe: 12,
    moderate: 35.4,
    description: 'Fine particulate matter (<2.5 µm)',
    source: 'Vehicular emissions, crop burning, power plants',
    healthImpact: 'Deep lung penetration; triggers asthma, heart and vascular strain',
  },
  pm10: {
    label: 'PM10',
    unit: 'µg/m³',
    safe: 54,
    moderate: 154,
    description: 'Coarse dust particles (<10 µm)',
    source: 'Construction dust, road resuspension, wind-blown soil',
    healthImpact: 'Irritates eyes, nose, throat and upper respiratory tract',
  },
  no2: {
    label: 'NO₂',
    unit: 'ppb',
    safe: 53,
    moderate: 100,
    description: 'Nitrogen dioxide',
    source: 'Automobile exhaust, fossil fuel combustion in industry',
    healthImpact: 'Inflames airways, aggravates bronchitis, lowers immunity',
  },
  so2: {
    label: 'SO₂',
    unit: 'ppb',
    safe: 35,
    moderate: 75,
    description: 'Sulfur dioxide',
    source: 'Thermal power generation, metal smelting, diesel engines',
    healthImpact: 'Bronchoconstriction and acute throat tightness',
  },
  co: {
    label: 'CO',
    unit: 'ppm',
    safe: 4.4,
    moderate: 9.4,
    description: 'Carbon monoxide',
    source: 'Incomplete combustion in vehicles, stoves, wood fires',
    healthImpact: 'Reduces oxygen transport in blood, causes dizziness and fatigue',
  },
  o3: {
    label: 'O₃',
    unit: 'ppb',
    safe: 54,
    moderate: 70,
    description: 'Ground-level ozone',
    source: 'Solar chemical reaction between NOx and VOCs',
    healthImpact: 'Damages lung tissue, triggers coughing and chest tightness',
  },
}

export function getPollutantStatus(key, value) {
  const info = POLLUTANT_INFO[key]
  if (!info || value == null) return 'unknown'
  if (value <= info.safe) return 'good'
  if (value <= info.moderate) return 'moderate'
  return 'poor'
}

/**
 * Return a concise formatted AQI string with category, e.g. "142 — Unhealthy for Sensitive Groups".
 * @param {number|null} aqi
 * @returns {string}
 */
export function formatAQI(aqi) {
  if (aqi == null || !Number.isFinite(aqi)) return 'N/A'
  const category = getAQICategory(aqi)
  return `${Math.round(aqi)} — ${category.label}`
}

/**
 * Compare two AQI readings and return a direction label.
 * @param {number} current
 * @param {number} previous
 * @returns {{ direction: 'better'|'worse'|'stable', delta: number }}
 */
export function compareAQI(current, previous) {
  if (current == null || previous == null) return { direction: 'stable', delta: 0 }
  const delta = Math.round(current - previous)
  if (delta < -5) return { direction: 'better', delta }
  if (delta > 5) return { direction: 'worse', delta }
  return { direction: 'stable', delta }
}
