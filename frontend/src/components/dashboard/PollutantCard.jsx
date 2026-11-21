import React from 'react'
import { POLLUTANT_INFO, getPollutantStatus } from '../../utils/aqi'
import clsx from 'clsx'

const statusConfig = {
  good: {
    label: 'Good',
    bar: 'bg-green-500',
    badge: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
    dot: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate',
    bar: 'bg-yellow-500',
    badge: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30',
    dot: 'bg-yellow-500',
  },
  poor: {
    label: 'Poor',
    bar: 'bg-red-500',
    badge: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
    dot: 'bg-red-500',
  },
  unknown: {
    label: 'N/A',
    bar: 'bg-gray-300 dark:bg-gray-600',
    badge: 'text-gray-500 bg-gray-50 dark:bg-gray-700',
    dot: 'bg-gray-300',
  },
}

export default function PollutantCard({ pollutantKey, value }) {
  const info = POLLUTANT_INFO[pollutantKey]
  if (!info) return null

  const status = getPollutantStatus(pollutantKey, value)
  const config = statusConfig[status]
  const displayValue = value != null ? Number(value).toFixed(1) : '--'

  // Progress bar width — 0% at 0, 100% at 2× moderate threshold
  const maxRef = info.moderate * 2
  const barWidth = value != null ? Math.min(100, (value / maxRef) * 100) : 0

  return (
    <div
      className="card-hover p-4 group flex flex-col justify-between"
      role="article"
      aria-label={`${info.label}: ${displayValue} ${info.unit}, status ${config.label}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">
            {info.label}
          </p>
          <span className={clsx('badge text-xs', config.badge)}>
            <span className={clsx('w-1.5 h-1.5 rounded-full mr-1', config.dot)} aria-hidden="true" />
            {config.label}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">
            {displayValue}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{info.unit}</span>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={value ?? 0}
          aria-valuemin={0}
          aria-valuemax={maxRef}
          aria-label={`${info.label} level indicator`}
        >
          <div
            className={clsx('h-full rounded-full transition-all duration-700', config.bar)}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* Description & safe limit */}
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{info.description}</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Safe threshold: {info.safe} {info.unit}</p>
      </div>

      {info.healthImpact && (
        <p
          className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 leading-tight"
          title={info.healthImpact}
        >
          <span className="font-semibold text-gray-600 dark:text-gray-300">Health impact: </span>
          {info.healthImpact}
        </p>
      )}
    </div>
  )
}
