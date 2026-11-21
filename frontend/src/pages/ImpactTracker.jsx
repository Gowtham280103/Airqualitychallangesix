import React, { useState } from 'react'
import { Leaf, Bus, Bike, Zap, Award, Info, Plus } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sustainabilityService } from '../services/api'
import { formatDate } from '../utils/format'
import clsx from 'clsx'

const ACTION_TYPES = [
  { id: 'transit',      label: 'Public Transport', icon: Bus,     co2PerAction: 2.6,  unit: 'trip',  color: 'purple' },
  { id: 'cycling',      label: 'Cycling',           icon: Bike,    co2PerAction: 1.2,  unit: 'trip',  color: 'teal' },
  { id: 'eco_purchase', label: 'Eco Purchase',       icon: Leaf,    co2PerAction: 1.0,  unit: 'item',  color: 'green' },
  { id: 'energy_save',  label: 'Energy Saving',      icon: Zap,     co2PerAction: 0.5,  unit: 'day',   color: 'yellow' },
]

const COLOR_MAP = {
  purple: { icon: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', bar: '#8b5cf6' },
  teal:   { icon: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-900/20',     bar: '#14b8a6' },
  green:  { icon: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/20',   bar: '#22c55e' },
  yellow: { icon: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', bar: '#eab308' },
  blue:   { icon: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20',     bar: '#3b82f6' },
}

function StatCard({ icon: Icon, label, value, unit, color, note }) {
  const colors = COLOR_MAP[color] || COLOR_MAP.green
  return (
    <div className="card p-5">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colors.bg)}>
        <Icon className={clsx('w-5 h-5', colors.icon)} aria-hidden="true" />
      </div>
      <p className={clsx('text-2xl font-bold leading-none', colors.icon)}>{value}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{unit}</p>
      {note && <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 italic">{note}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill || p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

function getWeeklyData(actions) {
  const now = Date.now()
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = now - (i + 1) * 7 * 24 * 60 * 60 * 1000
    const end   = now - i       * 7 * 24 * 60 * 60 * 1000
    const weekActions = actions.filter(a => {
      const t = new Date(a.date).getTime()
      return t >= start && t < end
    })
    return {
      week: `Week ${4 - i}`,
      co2: parseFloat(weekActions.reduce((s, a) => s + (a.co2 || 0), 0).toFixed(1)),
      count: weekActions.length,
    }
  })
  return weeks.reverse()
}

const DEMO_WEEKLY = [
  { week: 'Mon', transit: 2, cycling: 1, eco_purchase: 0, energy_save: 1 },
  { week: 'Tue', transit: 1, cycling: 2, eco_purchase: 1, energy_save: 1 },
  { week: 'Wed', transit: 3, cycling: 0, eco_purchase: 0, energy_save: 1 },
  { week: 'Thu', transit: 2, cycling: 1, eco_purchase: 0, energy_save: 1 },
  { week: 'Fri', transit: 1, cycling: 3, eco_purchase: 1, energy_save: 1 },
  { week: 'Sat', transit: 0, cycling: 2, eco_purchase: 2, energy_save: 1 },
  { week: 'Sun', transit: 1, cycling: 1, eco_purchase: 0, energy_save: 1 },
]

export default function ImpactTracker() {
  const [actions, setActions] = useLocalStorage('breathewise-actions', [])
  const [logForm, setLogForm] = useState({ type: 'transit', count: 1 })

  function logAction() {
    const count = Math.max(1, Math.min(99, Number(logForm.count) || 1))
    const co2 = ACTION_TYPES.find(a => a.id === logForm.type)?.co2PerAction || 0
    const newActions = Array.from({ length: count }, () => ({
      type: logForm.type,
      date: new Date().toISOString(),
      co2,
    }))
    setActions(prev => [...prev, ...newActions])

    // Background sync to backend database (gracefully degrades offline)
    sustainabilityService.logAction({
      action_type: logForm.type,
      co2_saved_kg: Number((co2 * count).toFixed(3)),
      user_session: 'breathewise-user',
    }).catch(() => {})
  }

  const totalActions = actions.length
  const totalCO2 = actions.reduce((s, a) => s + (a.co2 || 0), 0)
  const totalTransit = actions.filter(a => a.type === 'transit').length
  const totalCycling = actions.filter(a => a.type === 'cycling').length
  const treesEquiv = (totalCO2 / 21).toFixed(1)
  const weeklyData = getWeeklyData(actions)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Impact Tracker</h1>
        <p className="section-subtitle">Track your sustainable actions and estimated environmental benefits</p>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            All CO₂ savings shown are <strong>estimates</strong> based on average emission factors.
            Actual impact varies by vehicle type, distance, and energy source.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Leaf}  label="CO₂ Avoided"    value={totalCO2.toFixed(1)} unit="kg (estimated)"        color="green" />
        <StatCard icon={Award} label="Total Actions"   value={totalActions}         unit="eco-actions logged"    color="blue" />
        <StatCard icon={Bus}   label="Transit Trips"   value={totalTransit}         unit="public transport uses" color="purple" />
        <StatCard icon={Bike}  label="Cycling Trips"   value={totalCycling}         unit="zero-emission trips"   color="teal" />
      </div>

      {/* Tree equivalent */}
      {totalCO2 > 0 && (
        <div className="card p-5 flex items-center gap-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 animate-scale-in">
          <div className="text-4xl flex-shrink-0" aria-hidden="true">🌳</div>
          <div>
            <p className="font-bold text-green-800 dark:text-green-300">
              Equivalent to planting ~{treesEquiv} trees for a year
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Based on estimated {totalCO2.toFixed(1)} kg CO₂ avoided. This is an illustrative comparison.
            </p>
          </div>
        </div>
      )}

      {/* Log action */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-500" aria-hidden="true" />
          Log a Sustainable Action
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="action-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Action Type
            </label>
            <select
              id="action-type"
              value={logForm.type}
              onChange={e => setLogForm(p => ({ ...p, type: e.target.value }))}
              className="input-field w-auto"
              aria-label="Action type"
            >
              {ACTION_TYPES.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="action-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Count
            </label>
            <input
              id="action-count"
              type="number"
              value={logForm.count}
              onChange={e => setLogForm(p => ({ ...p, count: e.target.value }))}
              className="input-field w-24"
              min={1}
              max={99}
              aria-label="Action count"
            />
          </div>
          <button onClick={logAction} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log Action
          </button>
        </div>
        {/* Estimated CO2 for selected action */}
        {logForm.type && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Estimated CO₂ saved: ~{(ACTION_TYPES.find(a => a.id === logForm.type)?.co2PerAction || 0) * Math.max(1, Number(logForm.count) || 1)} kg
          </p>
        )}
      </div>

      {/* Weekly activity chart — demo data */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Weekly Activity <span className="text-xs font-normal text-gray-400 ml-1">(illustrative)</span>
        </h2>
        <div role="img" aria-label="Weekly sustainable actions bar chart">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEMO_WEEKLY} margin={{ top: 5, right: 10, bottom: 5, left: -20 }} barSize={10} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.07} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="transit"      name="Transit"      fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="cycling"      name="Cycling"      fill="#14b8a6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="eco_purchase" name="Eco Purchase" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="energy_save"  name="Energy Save"  fill="#eab308" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">Weekly bar chart showing transit, cycling, eco purchase, and energy saving activities across 7 days.</p>
      </div>

      {/* Your logged trend */}
      {actions.length >= 4 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your 4-Week CO₂ Savings</h2>
          <div role="img" aria-label="Your 4-week CO₂ savings trend">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weeklyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.07} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="co2"
                  name="CO₂ saved (kg)"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent actions */}
      {actions.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Actions</h2>
          <div className="space-y-1 max-h-56 overflow-y-auto" role="list">
            {[...actions].reverse().slice(0, 20).map((a, i) => {
              const info = ACTION_TYPES.find(t => t.id === a.type)
              const Icon = info?.icon || Leaf
              const colors = COLOR_MAP[info?.color || 'green']
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/60 last:border-0"
                  role="listitem"
                >
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-6 h-6 rounded-lg flex items-center justify-center', colors.bg)}>
                      <Icon className={clsx('w-3.5 h-3.5', colors.icon)} aria-hidden="true" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{info?.label || a.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">−{a.co2} kg CO₂ (est.)</p>
                    <p className="text-xs text-gray-400">{formatDate(a.date)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
