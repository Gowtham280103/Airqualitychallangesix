import React, { useState } from 'react'
import {
  Navigation, MapPin, Clock, Ruler, Leaf, AlertTriangle,
  Bike, Car, Train, PersonStanding, ChevronRight, Info
} from 'lucide-react'
import { routeService } from '../services/api'
import { useLocation } from '../context/LocationContext'
import { sanitizeCity } from '../utils/sanitize'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import clsx from 'clsx'

const MODE_CONFIG = {
  walking:  { icon: PersonStanding, color: 'green',  label: 'Walk',    gradient: 'from-green-500 to-teal-500' },
  cycling:  { icon: Bike,           color: 'teal',   label: 'Cycle',   gradient: 'from-teal-500 to-sky-500' },
  transit:  { icon: Train,          color: 'blue',   label: 'Transit', gradient: 'from-sky-500 to-blue-600' },
  driving:  { icon: Car,            color: 'orange', label: 'Drive',   gradient: 'from-orange-400 to-red-500' },
}

const EXPOSURE_STYLES = {
  low:      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  moderate: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  high:     'text-red-600   dark:text-red-400   bg-red-50   dark:bg-red-900/20',
}

function RouteCard({ route, recommended, rank }) {
  const cfg = MODE_CONFIG[route.mode] || MODE_CONFIG.driving
  const Icon = cfg.icon
  const exposureStyle = EXPOSURE_STYLES[route.pollution_exposure] || EXPOSURE_STYLES.moderate

  return (
    <div
      className={clsx(
        'card p-5 transition-all duration-200 relative overflow-hidden',
        recommended
          ? 'ring-2 ring-green-500 dark:ring-green-400 shadow-md'
          : 'hover:shadow-md hover:-translate-y-0.5'
      )}
      role="article"
      aria-label={`${cfg.label} route: ${route.distance} km, ${route.duration} minutes`}
    >
      {/* Rank number — subtle background */}
      <div
        className="absolute top-3 right-4 text-5xl font-black opacity-[0.04] dark:opacity-[0.06] select-none pointer-events-none"
        aria-hidden="true"
      >
        {rank}
      </div>

      {recommended && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 mb-3">
          <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
          Recommended — Lowest Emissions
        </div>
      )}

      {/* Mode header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0',
          `bg-gradient-to-br ${cfg.gradient}`
        )}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-gray-100">{cfg.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{route.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{route.distance} km</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5 justify-end">
            <Clock className="w-3 h-3" aria-hidden="true" /> {route.duration} min
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/60">
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">CO₂</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {route.co2_estimate ?? 0}<span className="text-xs font-normal text-gray-400"> g</span>
          </p>
          <p className="text-xs text-gray-400">(est.)</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Exposure</p>
          <span className={clsx('badge text-xs capitalize', exposureStyle)}>
            {route.pollution_exposure ?? 'N/A'}
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Calories</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {route.calories && route.calories !== '0' ? route.calories : '—'}
          </p>
        </div>
      </div>

      {route.notes && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-700/60 pt-3">
          {route.notes}
        </p>
      )}
    </div>
  )
}

// ─── Emission Comparison Bar ───────────────────────────────────────────────────
function EmissionBar({ routes }) {
  const max = Math.max(...routes.map(r => r.co2_estimate ?? 0), 1)
  const colors = { walking: 'bg-green-500', cycling: 'bg-teal-500', transit: 'bg-sky-500', driving: 'bg-orange-500' }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-500" aria-hidden="true" />
        CO₂ Emissions Comparison (grams, estimated)
      </h3>
      <div className="space-y-3">
        {routes.map(route => {
          const cfg = MODE_CONFIG[route.mode] || MODE_CONFIG.driving
          const pct = max > 0 ? ((route.co2_estimate ?? 0) / max) * 100 : 0
          return (
            <div key={route.id} className="flex items-center gap-3">
              <div className="w-14 text-xs font-medium text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                {cfg.label}
              </div>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-700', colors[route.mode] || 'bg-gray-400')}
                  style={{ width: `${Math.max(pct, route.co2_estimate === 0 ? 2 : pct)}%` }}
                  role="progressbar"
                  aria-valuenow={route.co2_estimate ?? 0}
                  aria-valuemax={max}
                  aria-label={`${cfg.label} CO₂: ${route.co2_estimate ?? 0}g`}
                />
              </div>
              <div className="w-16 text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                {route.co2_estimate ?? 0} g
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RoutePlanner() {
  const { location } = useLocation()
  const [origin, setOrigin] = useState(location.city)
  const [destination, setDestination] = useState('')
  const [routes, setRoutes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  async function handlePlan(e) {
    e.preventDefault()
    const cleanOrigin = sanitizeCity(origin)
    const cleanDest = sanitizeCity(destination)
    if (!cleanOrigin || !cleanDest) return

    setLoading(true)
    setNotice(null)
    setRoutes(null)

    try {
      const result = await routeService.plan({ origin: cleanOrigin, destination: cleanDest, city: location.city })
      setRoutes(result)
      setNotice(null)
    } catch {
      setRoutes(getDemoRoutes(cleanOrigin, cleanDest))
      setNotice('Using estimated route data — connect the backend for route planning.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Low-Emission Route Planner</h1>
        <p className="section-subtitle">Compare routes by emissions, travel time, and pollution exposure</p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handlePlan} aria-label="Plan a route">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1 text-green-500" aria-hidden="true" />
                Starting Point
              </label>
              <input
                id="origin"
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Connaught Place, Delhi"
                className="input-field"
                maxLength={100}
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Navigation className="w-4 h-4 inline mr-1 text-sky-500" aria-hidden="true" />
                Destination
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. India Gate, Delhi"
                className="input-field"
                maxLength={100}
                required
                aria-required="true"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !destination.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading
              ? <LoadingSpinner size="sm" />
              : <Navigation className="w-4 h-4" aria-hidden="true" />
            }
            Find Low-Emission Routes
          </button>
        </form>
      </div>

      {/* Notice */}
      {notice && (
        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {notice}
        </div>
      )}

      {/* Results */}
      {routes && (
        <section aria-labelledby="routes-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="routes-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Route Options
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
              Sorted by emissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {routes.map((route, i) => (
              <RouteCard key={route.id || i} route={route} recommended={i === 0} rank={i + 1} />
            ))}
          </div>

          {/* Emissions bar chart */}
          <EmissionBar routes={routes} />

          {/* Disclaimer */}
          <div className="card p-4 mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                CO₂ estimates are approximations based on typical vehicle emission factors. Pollution exposure levels are
                indicative. Actual values depend on real-time traffic conditions and your specific vehicle.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* How it works — shown before first search */}
      {!routes && !loading && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Enter origin & destination', desc: 'Type any two locations in your city' },
              { step: '2', label: 'Compare route options', desc: 'See walking, cycling, transit, and driving routes' },
              { step: '3', label: 'Choose the greenest route', desc: 'Pick the lowest-emission option that fits your needs' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getDemoRoutes(origin, destination) {
  return [
    {
      id: 'walk', mode: 'walking', distance: '2.4', duration: '28',
      description: 'Pedestrian path via green corridor',
      co2_estimate: 0, pollution_exposure: 'low', calories: '185',
      notes: 'Recommended when AQI < 100. Use footpath along the park.',
    },
    {
      id: 'cycle', mode: 'cycling', distance: '2.8', duration: '12',
      description: 'Cycling lane on main road',
      co2_estimate: 0, pollution_exposure: 'moderate', calories: '95',
      notes: 'Dedicated cycling lane available. Wear a mask on high-pollution days.',
    },
    {
      id: 'transit', mode: 'transit', distance: '4.1', duration: '22',
      description: 'Metro + 400 m walk',
      co2_estimate: 180, pollution_exposure: 'low', calories: '20',
      notes: 'Most practical low-emission option for longer distances.',
    },
    {
      id: 'drive', mode: 'driving', distance: '3.2', duration: '18',
      description: 'Direct road route',
      co2_estimate: 520, pollution_exposure: 'high', calories: '0',
      notes: 'Higher emissions. Consider carpooling to reduce per-person impact.',
    },
  ]
}
