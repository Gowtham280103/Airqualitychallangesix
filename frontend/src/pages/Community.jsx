import React, { useState, useEffect } from 'react'
import { Users, PlusCircle, Calendar, Eye, Loader2, AlertTriangle, MapPin, Hash } from 'lucide-react'
import { communityService } from '../services/api'
import { useLocation } from '../context/LocationContext'
import { useAlerts } from '../context/AlertContext'
import { sanitizeText, sanitizeCity } from '../utils/sanitize'
import { formatRelativeTime } from '../utils/format'
import { getAQICategory } from '../utils/aqi'
import EmptyState from '../components/ui/EmptyState'
import SkeletonCard from '../components/ui/SkeletonCard'
import clsx from 'clsx'

function ObservationCard({ obs }) {
  const category = getAQICategory(obs.aqi_estimate)

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200" role="article">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {obs.location_name || obs.location || 'Unknown location'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {obs.created_at ? formatRelativeTime(obs.created_at) : 'Recently'}
            </p>
          </div>
        </div>
        {obs.aqi_estimate != null && (
          <div className={clsx(
            'flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold text-center',
            category.bgColor, category.textColor
          )}>
            <div className="text-base font-extrabold leading-none">{Math.round(obs.aqi_estimate)}</div>
            <div className="text-[10px] opacity-80 leading-none mt-0.5">AQI</div>
          </div>
        )}
      </div>

      {obs.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 pl-9 leading-relaxed">{obs.description}</p>
      )}

      {obs.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-9">
          {obs.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <Hash className="w-2.5 h-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Community() {
  const { location } = useLocation()
  const { addAlert } = useAlerts()
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ location_name: '', aqi_estimate: '', description: '', tags: '' })

  async function fetchObservations() {
    setLoading(true)
    try {
      const result = await communityService.getObservations(location.city)
      setObservations(result.observations || result || [])
    } catch {
      setObservations(DEMO_OBSERVATIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchObservations() }, [location.city])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const aqiNum = form.aqi_estimate ? Number(form.aqi_estimate) : null
    if (aqiNum !== null && (aqiNum < 0 || aqiNum > 500)) {
      addAlert('AQI estimate must be between 0 and 500.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await communityService.submitObservation({
        location_name: sanitizeCity(form.location_name) || location.city,
        aqi_estimate: aqiNum,
        description: sanitizeText(form.description, 300),
        tags: form.tags.split(',').map(t => sanitizeText(t.trim(), 30)).filter(Boolean).slice(0, 5),
        city: location.city,
      })
      addAlert('Observation submitted successfully!', 'success')
      setShowForm(false)
      setForm({ location_name: '', aqi_estimate: '', description: '', tags: '' })
      fetchObservations()
    } catch {
      addAlert('Could not submit observation. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="section-title">Community Insights</h1>
          <p className="section-subtitle">Local pollution observations from your community in {location.city}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-2 text-sm"
          aria-expanded={showForm}
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          Report Observation
        </button>
      </div>

      {/* Submission form */}
      {showForm && (
        <div className="card p-6 animate-slide-up border border-green-100 dark:border-green-800/60">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" aria-hidden="true" />
            Submit a Pollution Observation
          </h2>
          <form onSubmit={handleSubmit} aria-label="Submit pollution observation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="obs-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Location Name
                </label>
                <input
                  id="obs-location"
                  name="location_name"
                  type="text"
                  value={form.location_name}
                  onChange={handleChange}
                  placeholder={`Area in ${location.city}`}
                  className="input-field"
                  maxLength={100}
                  aria-label="Location name"
                />
              </div>
              <div>
                <label htmlFor="obs-aqi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  AQI Estimate <span className="font-normal text-gray-400">(0–500)</span>
                </label>
                <input
                  id="obs-aqi"
                  name="aqi_estimate"
                  type="number"
                  value={form.aqi_estimate}
                  onChange={handleChange}
                  placeholder="e.g. 142"
                  className="input-field"
                  min={0}
                  max={500}
                  aria-label="AQI estimate"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="obs-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                id="obs-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what you observed…"
                className="input-field resize-none"
                rows={3}
                maxLength={300}
                aria-label="Observation description"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/300</p>
            </div>
            <div className="mb-5">
              <label htmlFor="obs-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tags <span className="font-normal text-gray-400">(comma-separated)</span>
              </label>
              <input
                id="obs-tags"
                name="tags"
                type="text"
                value={form.tags}
                onChange={handleChange}
                placeholder="smog, traffic, industrial"
                className="input-field"
                maxLength={150}
              />
            </div>
            <div className="flex gap-2 items-center">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                Submit Observation
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              Do not include personal information. Submissions may be moderated.
            </p>
          </form>
        </div>
      )}

      {/* Observations */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : observations.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No observations yet"
          description={`Be the first to report air quality conditions in ${location.city}.`}
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Report Now
            </button>
          }
        />
      ) : (
        <div className="space-y-3" role="list" aria-label="Community observations">
          {observations.map((obs, i) => (
            <ObservationCard key={obs.id || i} obs={obs} />
          ))}
        </div>
      )}
    </div>
  )
}

const DEMO_OBSERVATIONS = [
  {
    id: 1, location_name: 'Nehru Place',
    aqi_estimate: 178,
    description: 'Heavy smog this morning. Visibility very low, throat irritation noticeable.',
    tags: ['smog', 'low-visibility', 'morning'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2, location_name: 'India Gate',
    aqi_estimate: 142,
    description: 'Moderate haze. Dust from construction visible. Would not recommend outdoor exercise.',
    tags: ['construction', 'dust', 'haze'],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3, location_name: 'Lodi Garden',
    aqi_estimate: 95,
    description: 'Better than expected near the park. Some breeze helping clear the air.',
    tags: ['park', 'moderate', 'breeze'],
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
]
