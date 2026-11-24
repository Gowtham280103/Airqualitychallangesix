import React, { useState } from 'react'
import { Home, Wind, Filter, Flame, Trash2, Droplets, CheckCircle, Loader2, Sparkles, Leaf } from 'lucide-react'
import { aiService } from '../services/api'
import { useCurrentAQI } from '../hooks/useAirQuality'
import { useLocation } from '../context/LocationContext'
import { getAQICategory } from '../utils/aqi'
import clsx from 'clsx'
const HOUSE_TYPES = [
  { id: 'apartment', label: 'Apartment', emoji: '🏢' },
  { id: 'house',     label: 'House',     emoji: '🏠' },
  { id: 'studio',    label: 'Studio',    emoji: '🛋️' },
  { id: 'office',    label: 'Office',    emoji: '🏢' },
]

const CONCERNS = [
  { id: 'ventilation', label: 'Ventilation',    icon: Wind,     color: 'sky'    },
  { id: 'filtration',  label: 'Air Filtration', icon: Filter,   color: 'blue'   },
  { id: 'cooking',     label: 'Cooking Fumes',  icon: Flame,    color: 'orange' },
  { id: 'dust',        label: 'Dust & Allergens', icon: Trash2, color: 'yellow' },
  { id: 'humidity',    label: 'Humidity',        icon: Droplets, color: 'teal'  },
]

const CONCERN_COLOR = {
  sky:    { bg: 'bg-sky-50 dark:bg-sky-900/20',    border: 'border-sky-300 dark:border-sky-700',    text: 'text-sky-600 dark:text-sky-400' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',  border: 'border-blue-300 dark:border-blue-700',  text: 'text-blue-600 dark:text-blue-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-600 dark:text-orange-400' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-600 dark:text-yellow-400' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',  border: 'border-teal-300 dark:border-teal-700',  text: 'text-teal-600 dark:text-teal-400' },
}

const STATIC_TIPS = {
  ventilation: [
    'Open windows when outdoor AQI is below 50 to flush indoor pollutants.',
    'Cross-ventilate by opening windows on opposite sides of your home.',
    'Use trickle vents or controlled ventilation during high pollution periods.',
    'Avoid ventilating during morning rush (7–9 AM) and evening (5–8 PM) peak pollution times.',
  ],
  filtration: [
    'Use HEPA air purifiers rated for your room size (check CADR rating on the box).',
    'Replace HEPA filters every 6–12 months or as the manufacturer recommends.',
    'Keep purifiers running on auto mode in occupied rooms.',
    'Consider an activated carbon filter to remove VOCs and odors.',
    'Ensure the purifier is not blocked by furniture — place it in open space.',
  ],
  cooking: [
    'Always use the exhaust fan or range hood while cooking.',
    'Prefer induction cooktops over gas — they produce far fewer indoor pollutants.',
    'Keep cooking times short and use lids to reduce steam and particles.',
    'Avoid frying at very high temperatures, which generates ultrafine particles.',
    'Open a window (if outdoor AQI permits) while cooking to aid ventilation.',
  ],
  dust: [
    'Vacuum floors and surfaces at least twice a week using a HEPA-filter vacuum.',
    'Use damp microfiber cloths for dusting — dry dusting recirculates particles.',
    'Wash bedding weekly in hot water to reduce dust mites.',
    'Minimize carpets and rugs which trap allergens; prefer hard flooring.',
    'Groom pets regularly and wash pet bedding frequently.',
  ],
  humidity: [
    'Maintain indoor humidity between 40–60% to inhibit mold and dust mites.',
    'Use a dehumidifier in damp areas like bathrooms and basements.',
    'Fix leaks and condensation sources promptly to prevent mold growth.',
    'Use exhaust fans in bathrooms and kitchens to control moisture.',
    'Avoid overwatering indoor plants, which can raise humidity levels.',
  ],
}

const PLANTS = [
  { name: 'Spider Plant',  emoji: '🌿', benefit: 'Removes formaldehyde & carbon monoxide' },
  { name: 'Peace Lily',    emoji: '🌸', benefit: 'Absorbs VOCs and mold spores' },
  { name: 'Aloe Vera',     emoji: '🌵', benefit: 'Clears benzene & formaldehyde' },
  { name: 'Snake Plant',   emoji: '🌱', benefit: 'Produces oxygen at night' },
  { name: 'Boston Fern',   emoji: '🌾', benefit: 'Removes xylene and formaldehyde' },
  { name: 'Bamboo Palm',   emoji: '🌴', benefit: 'Excellent VOC and CO₂ absorber' },
]

function TipList({ tips, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-400 py-6" aria-live="polite">
        <Loader2 className="w-5 h-5 animate-spin text-green-500" aria-hidden="true" />
        <div>
          <p className="font-medium text-gray-600 dark:text-gray-300">Generating personalised advice…</p>
          <p className="text-xs text-gray-400">This takes a few seconds</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {tips.map((tip, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
        </li>
      ))}
    </ul>
  )
}

export default function IndoorAdvisor() {
  const { location } = useLocation()
  const { data: aqiData } = useCurrentAQI()
  const [houseType, setHouseType] = useState('apartment')
  const [selectedConcerns, setSelectedConcerns] = useState(['ventilation'])
  const [aiTips, setAiTips] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [usedAI, setUsedAI] = useState(false)

  const category = getAQICategory(aqiData?.aqi)

  function toggleConcern(id) {
    setSelectedConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function generatePlan() {
    setAiLoading(true)
    setGenerated(true)
    setAiTips(null)
    setUsedAI(false)
    try {
      const result = await aiService.getIndoorAdvice({
        house_type: houseType,
        concerns: selectedConcerns,
        location: location.city,
        aqi: aqiData?.aqi,
        aqi_category: category.label,
      })
      const tips = result.tips || result.advice
      if (tips && Array.isArray(tips) && tips.length > 0) {
        setAiTips(tips)
        setUsedAI(!result.fallback)
      }
    } catch {
      // Fall through to static tips
    } finally {
      setAiLoading(false)
    }
  }

  const displayTips = aiTips
    ? aiTips
    : selectedConcerns.flatMap(c => STATIC_TIPS[c] || [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Indoor Air Quality Advisor</h1>
        <p className="section-subtitle">Personalised strategies for a healthier home environment</p>
      </div>

      {/* AQI context banner */}
      <div className={clsx('card p-4 border flex items-start gap-3', category.borderColor)}>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', category.bgColor)}>
          <Home className={clsx('w-5 h-5', category.textColor)} aria-hidden="true" />
        </div>
        <div>
          <p className={clsx('font-semibold text-sm', category.textColor)}>
            {category.icon} Outdoor AQI is {category.label} ({aqiData?.aqi != null ? Math.round(aqiData.aqi) : '--'})
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{category.advice}</p>
          {aqiData?.aqi > 100 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              With elevated outdoor pollution, indoor air quality management is especially important.
            </p>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-500" aria-hidden="true" />
          Configure Your Space
        </h2>

        {/* Dwelling type */}
        <div className="mb-5">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
              Dwelling Type
            </legend>
            <div className="flex flex-wrap gap-2">
              {HOUSE_TYPES.map(ht => (
                <button
                  key={ht.id}
                  onClick={() => setHouseType(ht.id)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5',
                    houseType === ht.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                  aria-pressed={houseType === ht.id}
                >
                  <span aria-hidden="true">{ht.emoji}</span>
                  {ht.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Concerns */}
        <div className="mb-5">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
              Areas of Concern <span className="font-normal text-gray-400">(select all that apply)</span>
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CONCERNS.map(({ id, label, icon: Icon, color }) => {
                const colors = CONCERN_COLOR[color]
                const isSelected = selectedConcerns.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleConcern(id)}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm transition-all',
                      isSelected
                        ? `${colors.bg} ${colors.border}`
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    )}
                    aria-pressed={isSelected}
                  >
                    <Icon className={clsx('w-5 h-5', isSelected ? colors.text : 'text-gray-400')} aria-hidden="true" />
                    <span className={clsx('text-xs font-medium text-center leading-tight', isSelected ? colors.text : '')}>{label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        <button
          onClick={generatePlan}
          disabled={selectedConcerns.length === 0 || aiLoading}
          className="btn-primary flex items-center gap-2"
        >
          {aiLoading
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <Sparkles className="w-4 h-4" aria-hidden="true" />
          }
          Generate Action Plan
        </button>
      </div>

      {/* Tips output */}
      {generated && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Indoor Air Quality Action Plan
            </h2>
            {!aiLoading && (
              <span className={clsx(
                'badge text-xs',
                usedAI
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-500 bg-gray-100 dark:bg-gray-700'
              )}>
                {usedAI ? '✦ AI-personalised' : 'Standard advice'}
              </span>
            )}
          </div>
          <TipList tips={displayTips} loading={aiLoading} />
        </div>
      )}

      {/* Plant guide */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-500" aria-hidden="true" />
          Air-Purifying Plants
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          These plants can help improve indoor air quality by absorbing common pollutants and VOCs.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLANTS.map(p => (
            <div
              key={p.name}
              className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center border border-green-100 dark:border-green-800/60"
            >
              <div className="text-2xl mb-1.5" aria-hidden="true">{p.emoji}</div>
              <p className="font-semibold text-xs text-green-800 dark:text-green-300">{p.name}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 leading-tight">{p.benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
