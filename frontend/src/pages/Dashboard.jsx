import React, { useState } from 'react'
import {
  RefreshCw, AlertTriangle, Thermometer, Eye, Wind, Droplets,
  Info, ArrowRight, MessageSquare, Navigation, Home, Leaf,
  TrendingUp, TrendingDown, Minus, Activity, Shield, Users,
  HeartPulse, Sparkles, CalendarDays
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentAQI, useAQIHistory, useAQIForecast } from '../hooks/useAirQuality'
import { useLocation } from '../context/LocationContext'
import { getAQICategory, compareAQI } from '../utils/aqi'
import { formatRelativeTime } from '../utils/format'
import AQIGauge from '../components/dashboard/AQIGauge'
import AQIScaleReference from '../components/dashboard/AQIScaleReference'
import PollutantCard from '../components/dashboard/PollutantCard'
import AQITrendChart from '../components/dashboard/AQITrendChart'
import SkeletonCard from '../components/ui/SkeletonCard'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import clsx from 'clsx'

const PERSONAS = [
  { id: 'general', label: 'General Public', icon: Users },
  { id: 'children', label: 'Children & Schools', icon: Sparkles },
  { id: 'sensitive', label: 'Elderly & At-Risk', icon: HeartPulse },
  { id: 'active', label: 'Active & Outdoor', icon: Activity },
]

function getPersonaPrecautions(label, persona = 'general') {
  const map = {
    Good: {
      general: [
        'Excellent air quality — enjoy all outdoor activities freely.',
        'Great day for outdoor ventilation and natural air circulation.',
        'No special precautions required for the general population.',
      ],
      children: [
        'Safe for full outdoor playtime, sports, and school activities.',
        'Ideal time to open classroom and bedroom windows for fresh air.',
      ],
      sensitive: [
        'Optimal conditions for walks and outdoor movement.',
        'Low risk of asthma, allergy, or cardiac symptoms.',
      ],
      active: [
        'Peak conditions for marathon training, running, and cycling.',
        'Zero pollution-induced respiratory strain.',
      ],
    },
    Moderate: {
      general: [
        'Acceptable air quality for everyday activities.',
        'People unusually sensitive to ozone or PM2.5 should monitor symptoms.',
        'Ventilate during low-traffic afternoon hours when dispersal is higher.',
      ],
      children: [
        'Children can participate in outdoor sports normally.',
        'Watch for mild coughing in children with known respiratory allergies.',
      ],
      sensitive: [
        'Keep rescue inhalers accessible if diagnosed with asthma or COPD.',
        'Consider reducing long, strenuous outdoor walks along busy avenues.',
      ],
      active: [
        'Safe for standard workouts; prefer parks over major vehicle roads.',
        'Stay well hydrated to help mucous membranes clear particles.',
      ],
    },
    'Unhealthy for Sensitive Groups': {
      general: [
        'General public can still engage in outdoor activities, but reduce prolonged exertion.',
        'Close windows during morning (7–9 AM) and evening (5–8 PM) rush hours.',
        'Consider carpooling or public transit to prevent escalating local pollution.',
      ],
      children: [
        'Limit vigorous outdoor sports; shift strenuous activities indoors.',
        'Children with asthma should have controller medication administered on schedule.',
        'Equip school commuters with well-fitted pediatric N95 masks.',
      ],
      sensitive: [
        'Avoid prolonged outdoor exertion; stay in well-ventilated, filtered indoor spaces.',
        'Take prescribed maintenance inhalers and monitor symptoms.',
        'Elderly residents should avoid high-traffic corridors.',
      ],
      active: [
        'Reduce workout duration and intensity by 30–50%.',
        'Shift high-intensity cardio to filtered indoor gym spaces.',
      ],
    },
    Unhealthy: {
      general: [
        'Health alert: Everyone may begin to experience respiratory irritation.',
        'Wear an N95 or KN95 mask if outdoor activity is unavoidable.',
        'Run HEPA air purifiers continuously indoors and seal gaps in windows.',
        'Avoid all open-air waste burning, incense, and unvented gas cooking.',
      ],
      children: [
        'Schools should suspend all outdoor recess and physical education classes.',
        'Children must wear certified N95 masks when traveling between home and school.',
        'Watch for wheezing, rapid breathing, and eye redness.',
      ],
      sensitive: [
        'Strictly remain indoors in clean-air rooms with HEPA filtration.',
        'Keep rapid-relief bronchodilators immediately at hand.',
        'Contact healthcare provider if shortness of breath occurs.',
      ],
      active: [
        'Cancel all outdoor runs, cycling, and sports competitions.',
        'High ventilation rates during exercise dramatically increase deep-lung PM2.5 intake.',
      ],
    },
    'Very Unhealthy': {
      general: [
        'Serious health advisory: Significant risk of adverse effects for the entire population.',
        'Minimize all non-essential outdoor travel.',
        'N95/FFP3 respirators are strictly recommended outside.',
        'Run indoor air purifiers on highest CADR settings continuously.',
      ],
      children: [
        'Keep infants and children fully indoors with air filtration.',
        'Schools should implement smog remote-learning protocols where available.',
        'Avoid exposing children to outdoor vehicle emissions.',
      ],
      sensitive: [
        'High medical risk: Remain in sealed, air-purified rooms.',
        'Avoid physical strain; monitor pulse and oxygen saturation.',
        'Have emergency transport and doctor contacts prepared.',
      ],
      active: [
        'Zero outdoor physical training under any circumstances.',
        'Exercise strictly indoors in filtered, air-conditioned environments.',
      ],
    },
    Hazardous: {
      general: [
        'EMERGENCY WARNING: Severe health hazard. Immediate physiological damage.',
        'Remain entirely indoors; seal windows, doors, and air vents with damp cloths or tape.',
        'Do not go outside without an industrial-grade respirator (N95/N99).',
        'Follow official city disaster and public health directives.',
      ],
      children: [
        'CRITICAL: Complete indoor quarantine for all children and infants.',
        'Schools must close outdoor facilities immediately.',
        'Seek immediate pediatric care if breathing difficulties or lethargy occur.',
      ],
      sensitive: [
        'EXTREME HAZARD: Individuals with heart or lung disease should prepare for clinical support.',
        'Ensure continuous supplemental oxygen is available if prescribed.',
        'Seek urgent hospital care for chest pain, persistent cough, or cyanosis.',
      ],
      active: [
        'Prohibit all outdoor activity. Heavy respiration in hazardous smog causes acute lung tissue injury.',
      ],
    },
  }
  const byLabel = map[label] || map.Good
  return byLabel[persona] || byLabel.general
}

// ─── Health Advice Panel ───────────────────────────────────────────────────────
function HealthAdvicePanel({ aqi }) {
  const [selectedPersona, setSelectedPersona] = useState('general')
  const category = getAQICategory(aqi)
  const precautions = getPersonaPrecautions(category.label, selectedPersona)

  return (
    <div className={clsx('card p-5 border h-full flex flex-col justify-between', category.borderColor)}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', category.bgColor)}>
              <Shield className={clsx('w-4 h-4', category.textColor)} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-none">Health Guidance</h3>
              <p className={clsx('text-xs mt-0.5', category.textColor)}>{category.label} conditions</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
            US EPA & NAQI Aligned
          </span>
        </div>

        {/* Persona toggle */}
        <div className="flex flex-wrap gap-1.5 mb-3 p-1 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/60">
          {PERSONAS.map(p => {
            const Icon = p.icon
            const isSelected = selectedPersona === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPersona(p.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  isSelected
                    ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                )}
                aria-pressed={isSelected}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {p.label}
              </button>
            )
          })}
        </div>

        <p className={clsx('text-sm font-medium mb-3 leading-relaxed', category.textColor)}>{category.description}</p>
        <ul className="space-y-2">
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

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
        <span>Tailored for: {PERSONAS.find(p => p.id === selectedPersona)?.label}</span>
        <Link to="/assistant" className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-medium">
          Ask AI for custom plan <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
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
function HeroSection({ aqiData, loading, location, refetch, comparison }) {
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
          <AQIComparisonBadge comparison={comparison} />
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

// ─── Forecast Panel ──────────────────────────────────────────────────────────
function ForecastPanel({ entries }) {
  if (!entries || entries.length === 0) return null
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-sky-500 dark:text-sky-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Short-Range Outlook
        </h2>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Illustrative forecast</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {entries.slice(0, 3).map((entry, i) => {
          const cat = getAQICategory(entry.aqi)
          const labels = ['Tomorrow', 'Day 2', 'Day 3']
          return (
            <div
              key={entry.date || i}
              className={clsx('rounded-xl p-3 text-center border', cat.bgColor, cat.borderColor)}
              role="article"
              aria-label={`${labels[i]}: AQI ${Math.round(entry.aqi)}, ${cat.label}`}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{labels[i]}</p>
              <p className="text-2xl font-extrabold" style={{ color: cat.color }}>
                {Math.round(entry.aqi)}
              </p>
              <p className={clsx('text-xs font-semibold mt-0.5', cat.textColor)}>{cat.label}</p>
              <p className="text-lg mt-1" aria-hidden="true">{cat.icon}</p>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Forecast values are illustrative estimates — not meteorological predictions.
      </p>
    </div>
  )
}

// ─── AQI Comparison Badge ────────────────────────────────────────────────────
function AQIComparisonBadge({ comparison }) {
  if (!comparison) return null
  const { direction, delta } = comparison
  if (direction === 'better') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm"
        role="status" aria-label={`AQI improved by ${Math.abs(delta)} since yesterday`}>
        <TrendingDown className="w-4 h-4" aria-hidden="true" />
        <span className="font-semibold">{Math.abs(delta)} better than yesterday</span>
      </div>
    )
  }
  if (direction === 'worse') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
        role="status" aria-label={`AQI worsened by ${delta} since yesterday`}>
        <TrendingUp className="w-4 h-4" aria-hidden="true" />
        <span className="font-semibold">{delta} worse than yesterday</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-sm"
      role="status" aria-label="AQI is stable compared to yesterday">
      <Minus className="w-4 h-4" aria-hidden="true" />
      <span className="font-semibold">Stable vs yesterday</span>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { location } = useLocation()
  const { data: aqiData, loading, error, refetch } = useCurrentAQI()
  const { data: history, loading: histLoading } = useAQIHistory(7)
  const { data: forecastData } = useAQIForecast()

  const isWinterSeason = [11, 12, 1, 2].includes(new Date().getMonth() + 1)
  const isSmogProne = aqiData?.aqi > 100 || isWinterSeason

  // Compute day-over-day AQI comparison using the last 2 history entries
  const historyArr = Array.isArray(history) ? history : []
  const yesterday = historyArr.length >= 2 ? historyArr[historyArr.length - 2]?.aqi : null
  const aqiComparison = aqiData?.aqi != null && yesterday != null
    ? compareAQI(aqiData.aqi, yesterday)
    : null

  // Parse forecast entries from the backend response
  const forecastEntries = forecastData?.forecast ?? []

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
      <HeroSection aqiData={aqiData} loading={loading} location={location} refetch={refetch} comparison={aqiComparison} />

      {/* Winter Smog / Inversion Advisory Banner */}
      {isSmogProne && !loading && (
        <div
          className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3"
          role="region"
          aria-label="Winter Smog and Atmospheric Inversion Advisory"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 text-amber-700 dark:text-amber-300">
            <Wind className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Smog & Atmospheric Inversion Advisory
              </p>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 font-medium">
                {isWinterSeason ? 'Seasonal Inversion Alert' : 'Elevated Smog Risk'}
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              Cold atmospheric layers trap fine particulate matter (PM2.5) close to the surface, especially between 6–9 AM and 6–9 PM.
              Avoid early-morning outdoor jogs and use recirculation mode when driving.
            </p>
          </div>
        </div>
      )}

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
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
            <h2 id="pollutants-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pollutant Breakdown
            </h2>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            6 Core Pollutants · Real-Time & Safe Benchmarks
          </span>
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

      {/* Short-range forecast */}
      {forecastEntries.length > 0 && (
        <ForecastPanel entries={forecastEntries} />
      )}

      {/* AQI Scale Reference */}
      <section aria-labelledby="scale-heading">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          <h2 id="scale-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Understanding AQI
          </h2>
        </div>
        <AQIScaleReference currentAQI={aqiData?.aqi} />
      </section>

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
