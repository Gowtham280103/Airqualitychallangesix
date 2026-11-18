import React, { useState } from 'react'
import {
  Leaf, Bus, Bike, Zap, ShoppingBag, Recycle,
  CheckCircle2, Circle, TrendingDown, Award, Info
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import clsx from 'clsx'

const CATEGORIES = [
  {
    id: 'transport',
    label: 'Transportation',
    icon: Bus,
    color: 'blue',
    description: 'Switching to lower-emission transport is one of the highest-impact actions you can take.',
    items: [
      { id: 'public_transport', label: 'Use public transport instead of driving',    co2Saving: 2.6, unit: 'kg CO₂/trip' },
      { id: 'cycling',          label: 'Cycle or walk for trips under 3 km',          co2Saving: 1.2, unit: 'kg CO₂/trip' },
      { id: 'carpool',          label: 'Carpool with colleagues',                     co2Saving: 1.8, unit: 'kg CO₂/trip' },
      { id: 'ev',               label: 'Consider an electric or hybrid vehicle',      co2Saving: 2.4, unit: 'kg CO₂/day' },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: Zap,
    color: 'yellow',
    description: 'Energy efficiency at home reduces power-plant emissions and lowers your electricity bill.',
    items: [
      { id: 'led_bulbs',    label: 'Switch to LED lighting',                    co2Saving: 0.4, unit: 'kg CO₂/day' },
      { id: 'energy_star',  label: 'Use energy-efficient appliances (5-star)',   co2Saving: 0.6, unit: 'kg CO₂/day' },
      { id: 'solar',        label: 'Explore rooftop solar options',             co2Saving: 3.2, unit: 'kg CO₂/day (est.)' },
      { id: 'thermostat',   label: 'Set thermostat 2°C lower in winter',        co2Saving: 0.5, unit: 'kg CO₂/day' },
    ],
  },
  {
    id: 'consumption',
    label: 'Consumption',
    icon: ShoppingBag,
    color: 'green',
    description: 'Conscious purchasing reduces manufacturing emissions and packaging waste.',
    items: [
      { id: 'local_produce',  label: 'Buy local and seasonal produce',                  co2Saving: 0.8, unit: 'kg CO₂/week' },
      { id: 'reduce_meat',    label: 'Reduce meat consumption by 1 meal/week',          co2Saving: 1.5, unit: 'kg CO₂/week' },
      { id: 'reusable_bags',  label: 'Use reusable bags and containers',                co2Saving: 0.2, unit: 'kg CO₂/week' },
      { id: 'second_hand',    label: 'Buy second-hand when possible',                   co2Saving: 1.0, unit: 'kg CO₂/item' },
    ],
  },
  {
    id: 'waste',
    label: 'Waste',
    icon: Recycle,
    color: 'teal',
    description: 'Proper waste management prevents open burning — one of the biggest local air polluters.',
    items: [
      { id: 'composting',  label: 'Compost organic waste',                      co2Saving: 0.5, unit: 'kg CO₂/week' },
      { id: 'recycle',     label: 'Recycle paper, plastic, and glass',          co2Saving: 0.3, unit: 'kg CO₂/week' },
      { id: 'no_burn',     label: 'Never burn waste or leaves',                 co2Saving: 2.0, unit: 'kg CO₂/event' },
      { id: 'repair',      label: 'Repair instead of replacing electronics',   co2Saving: 1.5, unit: 'kg CO₂/item' },
    ],
  },
]

const COLOR_MAP = {
  blue:   { icon: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   progress: 'bg-blue-500',   badge: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  yellow: { icon: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', progress: 'bg-yellow-500', badge: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  green:  { icon: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  progress: 'bg-green-500',  badge: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
  teal:   { icon: 'text-teal-600 dark:text-teal-400',   bg: 'bg-teal-50 dark:bg-teal-900/20',   border: 'border-teal-200 dark:border-teal-800',   progress: 'bg-teal-500',   badge: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' },
}

export default function Sustainability() {
  const [adopted, setAdopted] = useLocalStorage('breathewise-adopted', [])

  function toggleAdopted(id) {
    setAdopted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const allItems = CATEGORIES.flatMap(c => c.items)
  const totalItems = allItems.length
  const adoptedCount = adopted.length
  const totalSavingsKg = allItems
    .filter(item => adopted.includes(item.id))
    .reduce((sum, item) => sum + item.co2Saving, 0)
  const scorePercent = totalItems > 0 ? Math.round((adoptedCount / totalItems) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Sustainability Recommendations</h1>
        <p className="section-subtitle">Practical actions to reduce your environmental footprint</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{adoptedCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Actions adopted</div>
          <div className="text-xs text-gray-400 mt-0.5">of {totalItems} available</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
            {totalSavingsKg.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">kg CO₂ potentially saved</div>
          <div className="text-xs text-gray-400 mt-0.5">estimate — varies by circumstance</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{scorePercent}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Sustainability score</div>
          <div
            className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={adoptedCount}
            aria-valuemax={totalItems}
            aria-label={`Sustainability progress: ${scorePercent}%`}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement badge */}
      {adoptedCount >= 8 && (
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border border-green-200 dark:border-green-800 animate-scale-in">
          <div className="text-4xl" aria-hidden="true">🏆</div>
          <div>
            <p className="font-bold text-green-800 dark:text-green-300">
              {adoptedCount >= 12 ? 'Sustainability Champion!' : 'Eco Advocate!'}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              You've adopted {adoptedCount} eco-actions.
              {totalSavingsKg > 0 && ` Potentially saving ~${totalSavingsKg.toFixed(1)} kg CO₂.`}
            </p>
          </div>
        </div>
      )}

      {/* CO₂ disclaimer */}
      <div className="card p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            CO₂ savings are estimates based on published average emission factors. Actual impact
            varies by location, frequency, and specific alternatives used.
          </p>
        </div>
      </div>

      {/* Category cards */}
      {CATEGORIES.map(cat => {
        const colors = COLOR_MAP[cat.color]
        const Icon = cat.icon
        const catAdopted = cat.items.filter(item => adopted.includes(item.id)).length
        const catPct = Math.round((catAdopted / cat.items.length) * 100)

        return (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <div className="card p-6">
              {/* Category header */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                  <Icon className={clsx('w-5 h-5', colors.icon)} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 id={`cat-${cat.id}`} className="font-bold text-gray-900 dark:text-gray-100">
                      {cat.label}
                    </h2>
                    <span className={clsx('badge text-xs', colors.badge)}>
                      {catAdopted}/{cat.items.length} adopted
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{cat.description}</p>
                </div>
                {/* Mini progress bar */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{catPct}%</p>
                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-500', colors.progress)}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <ul className="space-y-2" role="list">
                {cat.items.map(item => {
                  const isAdopted = adopted.includes(item.id)
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleAdopted(item.id)}
                        className={clsx(
                          'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                          isAdopted
                            ? `${colors.bg} ${colors.border}`
                            : 'border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        )}
                        aria-pressed={isAdopted}
                        aria-label={`${item.label} — ${isAdopted ? 'adopted' : 'not yet adopted'}`}
                      >
                        {isAdopted
                          ? <CheckCircle2 className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', colors.icon)} aria-hidden="true" />
                          : <Circle className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className={clsx('text-sm font-medium leading-snug', isAdopted ? colors.icon : 'text-gray-800 dark:text-gray-200')}>
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" aria-hidden="true" />
                            Saves ~{item.co2Saving} {item.unit}
                          </p>
                        </div>
                        {isAdopted && (
                          <span className={clsx('badge text-xs flex-shrink-0', colors.badge)}>✓ Adopted</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )
      })}

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-2">
        * CO₂ savings are estimates based on published averages and vary by individual circumstances.
      </p>
    </div>
  )
}
