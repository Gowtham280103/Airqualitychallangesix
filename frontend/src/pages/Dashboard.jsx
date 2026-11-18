import React from 'react'
import {
  RefreshCw, AlertTriangle, Thermometer, Eye, Wind, Droplets,
  Info, ArrowRight, MessageSquare, Navigation, Home, Leaf,
  TrendingUp, Activity, Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentAQI, useAQIHistory } from '../hooks/useAirQuality'
import { useLocation } from '../context/LocationContext'
import { getAQICategory } from '../utils/aqi'
import { formatRelativeTime } from '../utils/format'
import AQIGauge from '../components/dashboard/AQIGauge'
import PollutantCard from '../components/dashboard/PollutantCard'
import AQITrendChart from '../components/dashboard/AQITrendChart'
import SkeletonCard from '../components/ui/SkeletonCard'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import clsx from 'clsx'

// ─── Health Advice Panel ───────────────────────────────────────────────────────
function HealthAdvicePanel({ aqi }) {
  const category = getAQICategory(aqi)
  const precautions = getPrecautions(category.label)

  return (
    <div className={clsx('card p-5 border h-full', category.borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', category.bgColor)}>
          <Shield className={clsx('w-4 h-4', category.textColor)} aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-none">Health Guidance</h3>
          <p className={clsx('text-xs mt-0.5', category.textColor)}>{category.label} conditions</p>
        </div>
      </div>
      <p className={clsx('text-sm font-medium mb-3 leading-relaxed', category.textColor)}>{category.description}</p>
      <ul className="space-y-2" role="list">
        {precautions.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span
              className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', category.textColor.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-'))}
              aria-hidden="true"
            />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function getPrecautions(label) {
  const map = {
    Good: [
      'Excellent conditions — enjoy outdoor activities freely.',
      'No special precautions required for anyone.',
      'Great day for walking, cycling, or outdoor exercise.',
    ],
    Moderate: [
      'Unusually sensitive individuals may want to reduce prolonged outdoor exertion.',
      'People with respiratory conditions should monitor symptoms.',
      'General public can continue normal outdoor activities without restriction.',
    ],
    'Unhealthy for Sensitive Groups': [
      'Children, elderly, and those with asthma should reduce prolonged outdoor exertion.',
      'Everyone else can enjoy outdoor activities, but be cautious.',
      'Consider keeping windows closed during peak pollution hours.',
      'Keep quick-relief asthma medication easily accessible.',
    ],
    Unhealthy: [
      'Avoid prolonged outdoor exertion — especially children and elderly.',
      'Wear an N95 mask if outdoor activity is necessary.',
      'Use HEPA air purifiers indoors and keep windows closed.',
      'Limit indoor pollution sources (cooking smoke, candles).',
    ],
    'Very Unhealthy': [
      'Stay indoors as much as possible — health alert for everyone.',
      'Use N95 or higher-rated masks if going outside is unavoidable.',
      'Run air purifiers continuously on high settings.',
      'Seek medical advice if you experience breathing difficulties.',
    ],
    Hazardous: [
      'Emergency conditions — remain indoors, seal windows and doors.',
      'N95 masks are essential if outdoor movement is unavoidable.',
      'Contact medical services for chest pain or difficulty breathing.',
      'Follow official government emergency guidelines immediately.',
    ],
  }
  return map[label] || map.Good
}

// ─── Weather Row ──────────────────────────────────────────────────────────────
function WeatherRow({ icon: Icon, label, value, unit }) {
  if (value == null) return null
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700/60 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {value} <span className="font-normal text-gray-400 text-xs">{unit}</span>
      </span>
    </div>
  )
}

// ─── Quick Nav Card ───────────────────────────────────────────────────────────
function QuickNavCard({ to, icon: Icon, label, description, color }) {
  const colorMap = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/60',
    blue: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800/60',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800/60',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/60',
  }

  return (
    <Link
      to={to}
      className={clsx(
        'card border flex items-center gap-3 p-4 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 group',
        colorMap[color]
      )}
      aria-label={`Go to ${label}`}
    >
      <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-none">{label}</p>
        <p className="text-xs opacity-70 mt-0.5 truncate">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
    </Link>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ aqiData, loading, location, refetch }) {
  const category = getAQICategory(aqiData?.aqi)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/90 p-6">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight mt-0.5">
            Air Quality in{' '}
            <span className="text-green-600 dark:text-green-400">{location.city}</span>
          </h1>
          {!loading && aqiData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <span
                className={clsx('inline-block w-2 h-2 rounded-full', aqiData.demo ? 'bg-orange-400' : 'bg-green-500')}
                aria-hidden="true"
              />
              {aqiData.demo ? 'Demo data' : `Live — ${aqiData.source}`}
              {aqiData.updated_at && ` · Updated ${formatRelativeTime(aqiData.updated_at)}`}
            </p>
          )}
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0"
          aria-label="Refresh air quality data"
        >
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </div>

      {/* AQI summary strip */}
      {!loading && aqiData && (
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <div
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl', category.bgColor, category.borderColor, 'border')}
            role="status"
            aria-live="polite"
          >
            <span className="text-lg" aria-hidden="true">{category.icon}</span>
            <div>
              <p className={clsx('text-xs font-medium', category.textColor)}>Current AQI</p>
              <p className={clsx('text-2xl font-extrabold leading-none', category.textColor)}>
                {Math.round(aqiData.aqi)}
              </p>
            </div>
            <div className="ml-2 pl-2 border-l border-current/20">
              <p className={clsx('text-sm font-semibold', category.textColor)}>{category.label}</p>
              <p className={clsx('text-xs opacity-70', category.textColor)}>{category.advice}</p>
            </div>
          </div>

          {aqiData.weather?.temp != null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-sm">
              <Thermometer className="w-4 h-4" aria-hidden="true" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">{aqiData.weather.temp}°C</span>
            </div>
          )}
          {aqiData.weather?.humidity != null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-sm">
              <Droplets className="w-4 h-4" aria-hidden="true" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">{aqiData.weather.humidity}%</span>
            </div>
          )}
          {aqiData.weather?.wind_speed != null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-sm">
              <Wind className="w-4 h-4" aria-hidden="true" />
              <span className="font-semibold text-gray-700 dark:text-gray-200">{aqiData.weather.wind_speed} km/h</span>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-4 flex gap-3">
          <div className="skeleton h-16 w-56 rounded-xl" aria-busy="true" />
          <div className="skeleton h-16 w-24 rounded-xl" />
          <div className="skeleton h-16 w-24 rounded-xl" />
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { location } = useLocation()
  const { data: aqiData, loading, error, refetch } = useCurrentAQI()
  const { data: history, loading: histLoading } = useAQIHistory(7)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo data notice */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">Backend not connected</p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Showing plausible demo data. Start the backend server to see live AQI data.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <HeroSection aqiData={aqiData} loading={loading} location={location} refetch={refetch} />

      {/* Main grid: Gauge + Health Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AQI Gauge */}
        <div className="card p-6 flex flex-col items-center justify-center gap-4">
          {loading ? (
            <>
              <div className="skeleton w-44 h-24 rounded-xl" aria-busy="true" />
              <div className="skeleton w-28 h-8 rounded-full" />
            </>
          ) : (
            <>
              <AQIGauge aqi={aqiData?.aqi} size="lg" />
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Source: <span className="font-medium">{aqiData?.source || 'Demo'}</span>
                </p>
                {aqiData?.updated_at && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Updated {formatRelativeTime(aqiData.updated_at)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Health advice — spans 2 cols */}
        <div className="lg:col-span-2">
          {loading ? (
            <SkeletonCard rows={6} className="h-full" />
          ) : (
            <HealthAdvicePanel aqi={aqiData?.aqi ?? 0} />
          )}
        </div>
      </div>

      {/* Pollutants grid */}
      <section aria-labelledby="pollutants-heading">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          <h2 id="pollutants-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pollutant Breakdown
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={3} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'].map(key => (
              <ErrorBoundary key={key}>
                <PollutantCard pollutantKey={key} value={aqiData?.pollutants?.[key]} />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </section>

      {/* Chart + Weather in a 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 7-day trend */}
        <section className="lg:col-span-2" aria-labelledby="trend-heading">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              <h2 id="trend-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                7-Day AQI Trend
              </h2>
            </div>
            {histLoading ? (
              <div className="skeleton h-48 w-full" />
            ) : (
              <AQITrendChart data={history} height={200} />
            )}
          </div>
        </section>

        {/* Weather context */}
        {(aqiData?.weather || loading) && (
          <section aria-labelledby="weather-heading">
            <div className="card p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                <h2 id="weather-heading" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Weather Context
                </h2>
              </div>
              {loading ? (
                <SkeletonCard rows={4} />
              ) : (
                <>
                  <WeatherRow icon={Thermometer} label="Temperature" value={aqiData.weather?.temp} unit="°C" />
                  <WeatherRow icon={Droplets} label="Humidity" value={aqiData.weather?.humidity} unit="%" />
                  <WeatherRow icon={Wind} label="Wind Speed" value={aqiData.weather?.wind_speed} unit="km/h" />
                  <WeatherRow icon={Eye} label="Visibility" value={aqiData.weather?.visibility} unit="km" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Weather affects how pollutants disperse. High wind speeds improve air quality.
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Quick navigation to other features */}
      <section aria-labelledby="features-heading">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          <h2 id="features-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Explore Features
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickNavCard
            to="/assistant"
            icon={MessageSquare}
            label="AI Assistant"
            description="Ask anything about air quality"
            color="green"
          />
          <QuickNavCard
            to="/routes"
            icon={Navigation}
            label="Route Planner"
            description="Find low-emission routes"
            color="blue"
          />
          <QuickNavCard
            to="/indoor"
            icon={Home}
            label="Indoor Advisor"
            description="Improve home air quality"
            color="teal"
          />
          <QuickNavCard
            to="/sustainability"
            icon={Leaf}
            label="Sustainability"
            description="Eco actions and impact"
            color="purple"
          />
        </div>
      </section>
    </div>
  )
}
