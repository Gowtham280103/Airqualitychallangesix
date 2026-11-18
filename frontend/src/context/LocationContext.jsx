import React, { createContext, useContext, useState, useCallback } from 'react'

const LocationContext = createContext(null)

const DEFAULT_LOCATION = {
  city: 'Delhi',
  country: 'India',
  lat: 28.6139,
  lon: 77.2090,
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('breathewise-location')
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION
    } catch {
      return DEFAULT_LOCATION
    }
  })

  const updateLocation = useCallback((newLocation) => {
    // Basic validation
    if (!newLocation?.city || typeof newLocation.city !== 'string') return
    const sanitized = {
      city: newLocation.city.trim().slice(0, 100),
      country: (newLocation.country || '').trim().slice(0, 100),
      lat: typeof newLocation.lat === 'number' ? newLocation.lat : null,
      lon: typeof newLocation.lon === 'number' ? newLocation.lon : null,
    }
    setLocation(sanitized)
    localStorage.setItem('breathewise-location', JSON.stringify(sanitized))
  }, [])

  return (
    <LocationContext.Provider value={{ location, updateLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within LocationProvider')
  return ctx
}
