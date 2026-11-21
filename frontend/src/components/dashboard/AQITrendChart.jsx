import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { getAQICategory } from '../../utils/aqi'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const aqi = payload[0]?.value
  const category = getAQICategory(aqi)

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm"
      role="tooltip"
    >
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-extrabold" style={{ color: category.color }}>
          {Math.round(aqi)}
        </span>
        <div>
          <p className="text-xs text-gray-400 leading-none">AQI</p>
          <p className={`text-xs font-medium leading-none mt-0.5 ${category.textColor}`}>{category.label}</p>
        </div>
      </div>
    </div>
  )
}

export default function AQITrendChart({ data = [], height = 200 }) {
  const formatted = data.map(d => ({
    ...d,
    dateLabel: d.date ? format(parseISO(d.date), 'MMM d') : (d.label || ''),
  }))

  if (!formatted.length) {
    return (
      <div
        className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500 gap-2"
        aria-label="No trend data available"
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-lg" aria-hidden="true">📊</span>
        </div>
        <p className="text-sm">No historical data available</p>
      </div>
    )
  }

  // Calculate min/max for sensible Y domain
  const aqiValues = formatted.map(d => d.aqi).filter(Boolean)
  const minAqi = Math.max(0, Math.min(...aqiValues) - 20)
  const maxAqi = Math.max(...aqiValues) + 30

  return (
    <div role="img" aria-label={`AQI trend over the last ${formatted.length} days`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formatted} margin={{ top: 10, right: 16, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="aqiGradientWarm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            strokeOpacity={0.07}
            className="text-gray-500"
            vertical={false}
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: 'currentColor', className: 'text-gray-400' }}
            tickLine={false}
            axisLine={false}
            dy={4}
          />
          <YAxis
            domain={[minAqi, maxAqi]}
            tick={{ fontSize: 11, fill: 'currentColor', className: 'text-gray-400' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }} />

          {/* AQI threshold reference lines */}
          <ReferenceLine
            y={50}
            stroke="#eab308"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: '50', position: 'right', fontSize: 9, fill: '#eab308' }}
          />
          <ReferenceLine
            y={100}
            stroke="#f97316"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: '100', position: 'right', fontSize: 9, fill: '#f97316' }}
          />
          <ReferenceLine
            y={150}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{ value: '150', position: 'right', fontSize: 9, fill: '#ef4444' }}
          />

          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#aqiGradient)"
            dot={{ r: 3, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center flex-wrap" aria-hidden="true">
        {[
          { color: '#eab308', label: 'Moderate (50)' },
          { color: '#f97316', label: 'USG (100)' },
          { color: '#ef4444', label: 'Unhealthy (150)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded-full" style={{ background: color, opacity: 0.7 }} />
            <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Screen-reader summary */}
      <p className="sr-only">
        AQI trend over {formatted.length} days.
        Start: {formatted[0]?.aqi}. Latest: {formatted[formatted.length - 1]?.aqi}.
      </p>
    </div>
  )
}
