/**
 * Custom hooks for fetching and caching air quality data.
 * Cache TTL is 5 minutes to avoid redundant API calls.
 */
import { useState, useEffect, useCallback } from 'react'
import { airQualityService } from '../services/api'
import { useLocation } from '../context/LocationContext'

const CACHE = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Return cached entry if still fresh, otherwise null. */
function getCached(key) {
  const entry = CACHE.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    CACHE.delete(key)
    return null
  }
  return entry.data
}

/** Store a value in the in-memory cache. */
function setCache(key, data) {
  CACHE.set(key, { data, ts: Date.now() })
}

/**
 * Fetch and auto-refresh current AQI for the active location.
 * Returns { data, loading, error, refetch }.
 */
export function useCurrentAQI() {
  const { location } = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    const key = `aqi-current-${location.city}`
    const cached = getCached(key)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await airQualityService.getCurrent(location.city)
      setCache(key, result)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [location.city])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, CACHE_TTL_MS)
    return () => clearInterval(interval)
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

/**
 * Fetch AQI history for the active location.
 * Returns { data, loading, error }.
 */
export function useAQIHistory(days = 7) {
  const { location } = useLocation()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const key = `aqi-history-${location.city}-${days}`
    const cached = getCached(key)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    airQualityService.getHistory(location.city, days)
      .then(result => {
        setCache(key, result)
        setData(result)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [location.city, days])

  return { data, loading, error }
}

/**
 * Fetch short-range AQI forecast for the active location.
 * Returns { data, loading, error }.
 */
export function useAQIForecast() {
  const { location } = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const key = `aqi-forecast-${location.city}`
    const cached = getCached(key)
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    airQualityService.getForecast(location.city)
      .then(result => {
        setCache(key, result)
        setData(result)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [location.city])

  return { data, loading, error }
}
