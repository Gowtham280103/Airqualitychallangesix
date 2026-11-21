import React, { useState, useEffect, useCallback } from 'react'
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, RefreshCw, MapPin, Shield } from 'lucide-react'
import { alertsService } from '../services/api'
import { useLocation } from '../context/LocationContext'
import { useCurrentAQI } from '../hooks/useAirQuality'
import { formatRelativeTime } from '../utils/format'
import SkeletonCard from '../components/ui/SkeletonCard'
import clsx from 'clsx'

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
    label: 'Critical',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    label: 'High',
  },
  moderate: {
    icon: Info,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    dot: 'bg-yellow-500',
    label: 'Moderate',
  },
  low: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    dot: 'bg-green-500',
    label: 'Low',
  },
}

function AlertCard({ alert }) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.moderate
  const Icon = config.icon

  return (
    <div
      className={clsx('card p-5 border', config.border)}
      role="article"
      aria-label={`${config.label} alert: ${alert.title}`}
    >
      <div className="flex items-start gap-3">
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={clsx('w-5 h-5', config.color)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">{alert.title}</h3>
            <span className={clsx('badge text-xs flex-shrink-0 flex items-center gap-1', config.badge)}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} aria-hidden="true" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{alert.message}</p>
          {alert.recommendation && (
            <div className="bg-white/70 dark:bg-gray-700/40 rounded-lg p-3 mt-2 border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3" aria-hidden="true" />
                Recommended action
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{alert.recommendation}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {alert.created_at ? formatRelativeTime(alert.created_at) : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  )
}

function SummaryTile({ label, count, config }) {
  const hasAlerts = count > 0
  return (
    <div className={clsx(
      'card p-4 border text-center transition-all duration-200',
      hasAlerts ? config.border : 'border-gray-100 dark:border-gray-700'
    )}>
      <div className={clsx(
        'text-2xl font-bold',
        hasAlerts ? config.color : 'text-gray-300 dark:text-gray-600'
      )}>
        {count}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
      {hasAlerts && (
        <div className={clsx('w-1.5 h-1.5 rounded-full mx-auto mt-1.5', config.dot)} aria-hidden="true" />
      )}
    </div>
  )
}

function generateAlertsFromAQI(aqi, city) {
  const alerts = []
  const now = new Date().toISOString()

  if (aqi > 300) {
    alerts.push({
      id: 'emergency', severity: 'critical',
      title: 'Hazardous Air Quality — Emergency Alert',
      message: `AQI in ${city} has reached ${Math.round(aqi)}. This poses immediate health risks to everyone.`,
      recommendation: 'Remain indoors. Wear N95 masks if outdoor movement is unavoidable. Seek emergency medical care for breathing difficulty.',
      created_at: now,
    })
  } else if (aqi > 200) {
    alerts.push({
      id: 'very-unhealthy', severity: 'high',
      title: 'Very Unhealthy Air Quality',
      message: `AQI in ${city} is ${Math.round(aqi)}. Serious health effects are possible for everyone.`,
      recommendation: 'Avoid all outdoor activities. Use HEPA air purifiers indoors. Wear N95 mask if going outside.',
      created_at: now,
    })
  } else if (aqi > 150) {
    alerts.push({
      id: 'unhealthy', severity: 'high',
      title: 'Unhealthy Air Quality',
      message: `AQI in ${city} is ${Math.round(aqi)}. Everyone may experience health effects.`,
      recommendation: 'Reduce prolonged outdoor exertion. Sensitive groups should stay indoors.',
      created_at: now,
    })
  } else if (aqi > 100) {
    alerts.push({
      id: 'sensitive', severity: 'moderate',
      title: 'Air Quality Alert — Sensitive Groups',
      message: `AQI in ${city} is ${Math.round(aqi)}. Sensitive individuals may experience health effects.`,
      recommendation: 'Children, elderly, and those with respiratory conditions should limit outdoor time.',
      created_at: now,
    })
  } else if (aqi > 50) {
    alerts.push({
      id: 'moderate', severity: 'low',
      title: 'Moderate Air Quality',
      message: `AQI in ${city} is ${Math.round(aqi)}. Air quality is acceptable but may affect very sensitive individuals.`,
      recommendation: 'No special precautions needed for most people. Sensitive groups may want to monitor symptoms.',
      created_at: now,
    })
  } else {
    alerts.push({
      id: 'good', severity: 'low',
      title: 'Good Air Quality',
      message: `AQI in ${city} is ${Math.round(aqi)}. Air quality is satisfactory and poses little or no risk.`,
      recommendation: 'Great conditions for outdoor activities. Enjoy the fresh air!',
      created_at: now,
    })
  }

  // Winter smog advisory
  const month = new Date().getMonth() + 1
  if ([11, 12, 1, 2].includes(month) && aqi > 100) {
    alerts.push({
      id: 'winter-smog', severity: aqi > 200 ? 'high' : 'moderate',
      title: 'Winter Smog Advisory',
      message: 'Atmospheric conditions favour smog formation. Cold air traps pollutants close to ground level.',
      recommendation: 'Monitor air quality frequently. Avoid outdoor burning. Use public transport to reduce emissions.',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    })
  }

  return alerts
}

export default function Alerts() {
  const { location } = useLocation()
  const { data: aqiData } = useCurrentAQI()
  const [apiAlerts, setApiAlerts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await alertsService.getAlerts(location.city)
      setApiAlerts(result.alerts || result)
    } catch {
      setApiAlerts(null)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [location.city])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const alerts = apiAlerts || (aqiData?.aqi != null ? generateAlertsFromAQI(aqiData.aqi, location.city) : [])
  const isLoading = loading && !aqiData

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            Pollution Alerts
          </h1>
          <p className="section-subtitle flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {location.city}
          </p>
        </div>
        <button onClick={fetchAlerts} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
          <SummaryTile
            key={key}
            label={config.label}
            count={alerts.filter(a => a.severity === key).length}
            config={config}
          />
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <SkeletonCard key={i} rows={3} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" aria-hidden="true" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">No active alerts</p>
          <p className="text-sm text-gray-400 mt-1">Air quality conditions are favourable in {location.city}</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Active alerts">
          {alerts.map((alert, i) => (
            <AlertCard key={alert.id || i} alert={alert} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Last updated {formatRelativeTime(lastRefresh)} · Alerts are generated from current AQI data.
        Always follow official health authority guidance during emergencies.
      </p>
    </div>
  )
}
