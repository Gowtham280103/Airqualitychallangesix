import React from 'react'
import { getAQICategory, getAQIPercent } from '../../utils/aqi'
import clsx from 'clsx'

// Color stops that map AQI to gauge color
const AQI_COLORS = [
  { max: 50, color: '#22c55e' },
  { max: 100, color: '#eab308' },
  { max: 150, color: '#f97316' },
  { max: 200, color: '#ef4444' },
  { max: 300, color: '#8b5cf6' },
  { max: 500, color: '#991b1b' },
]

function getGaugeColor(aqi) {
  if (aqi == null) return '#d1d5db'
  for (const { max, color } of AQI_COLORS) {
    if (aqi <= max) return color
  }
  return AQI_COLORS[AQI_COLORS.length - 1].color
}

export default function AQIGauge({ aqi, size = 'lg' }) {
  const category = getAQICategory(aqi)
  const percent = getAQIPercent(aqi)
  const isLarge = size === 'lg'

  const radius = isLarge ? 72 : 50
  const stroke = isLarge ? 11 : 8
  const cx = radius + stroke + 2
  const cy = radius + stroke + 2
  const svgW = cx * 2
  const svgH = cy + 4
  const circumference = Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const gaugeColor = getGaugeColor(aqi)

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="img"
      aria-label={`Air Quality Index: ${aqi != null ? Math.round(aqi) : 'Unknown'}. Category: ${category.label}`}
    >
      <div className="relative">
        {/* Glow behind active arc */}
        {aqi != null && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-20 ring-pulse pointer-events-none"
            style={{ background: gaugeColor }}
          />
        )}

        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          aria-hidden="true"
          className="overflow-visible"
        >
          {/* AQI color band ticks */}
          {isLarge && [50, 100, 150, 200, 300].map((mark) => {
            const p = (mark / 500) * 100
            const angle = (p / 100) * Math.PI
            const x = cx - radius * Math.cos(angle)
            const y = cy - radius * Math.sin(angle)
            return (
              <circle
                key={mark}
                cx={x}
                cy={y}
                r={2}
                fill="white"
                opacity={0.6}
              />
            )
          })}

          {/* Track (grey half-circle) */}
          <path
            d={`M ${stroke + 2} ${cy} A ${radius} ${radius} 0 0 1 ${svgW - stroke - 2} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-gray-100 dark:text-gray-700"
          />

          {/* Progress arc */}
          <path
            d={`M ${stroke + 2} ${cy} A ${radius} ${radius} 0 0 1 ${svgW - stroke - 2} ${cy}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
          <span
            className={clsx('font-extrabold leading-none tracking-tight', isLarge ? 'text-5xl' : 'text-3xl')}
            style={{ color: gaugeColor }}
          >
            {aqi != null ? Math.round(aqi) : '--'}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">
            AQI
          </span>
        </div>
      </div>

      {/* Category pill */}
      <div
        className={clsx('px-4 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5', category.bgColor, category.textColor)}
        role="status"
      >
        <span aria-hidden="true">{category.icon}</span>
        <span>{category.label}</span>
      </div>

      {/* AQI scale labels */}
      {isLarge && (
        <div className="flex gap-1 items-center" role="presentation" aria-hidden="true">
          {['Good', 'Mod', 'USG', 'Bad', 'V.Bad', 'Haz'].map((l, i) => {
            const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-600', 'bg-red-900']
            return (
              <div key={l} className="flex flex-col items-center gap-0.5">
                <div className={`w-6 h-1.5 rounded-full ${colors[i]}`} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
