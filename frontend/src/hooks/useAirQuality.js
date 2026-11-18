import { useState, useEffect, useCallback, useRef } from 'react'
import { airQualityService } from '../services/api'
import { useLocation } from '../context/LocationContext'

const CACHE = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key) {
  const entry = CACHE.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    CACHE.delete(key)
    return null
  }
  return entry.data
}

export function useCurrentAQI() {
  const { location } = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

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
      CACHE.set(key, { data: result, ts: Date.now() })
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [location.city])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, CACHE_TTL)
    return () => clearInterval(interval)
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

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
    airQualityService.getHistory(location.city, days)
      .then(result => {
        CACHE.set(key, { data: result, ts: Date.now() })
        setData(result)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [location.city, days])

  return { data, loading, error }
}
