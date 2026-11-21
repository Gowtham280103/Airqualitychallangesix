/**
 * AQIScaleReference — displays the standard 6-band AQI scale so users
 * immediately understand what the numeric value means.
 */
import React from 'react'
import { AQI_CATEGORIES } from '../../utils/aqi'
import clsx from 'clsx'

export default function AQIScaleReference({ currentAQI }) {
  return (
    <div className="card p-5" role="complementary" aria-label="AQI scale reference">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        AQI Scale Reference
      </h3>
      <div className="space-y-1.5">
        {AQI_CATEGORIES.map(cat => {
          const isCurrent =
            currentAQI != null &&
            currentAQI >= cat.min &&
            currentAQI <= cat.max
          return (
            <div
              key={cat.label}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                isCurrent
                  ? `${cat.bgColor} ring-1 ring-current ${cat.textColor} font-semibold`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
              )}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {/* Color swatch */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
                aria-hidden="true"
              />
              {/* Range */}
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                {cat.min}–{cat.max === 500 ? '500+' : cat.max}
              </span>
              {/* Label */}
              <span className={clsx(
                'text-xs font-medium flex-1 truncate',
                isCurrent ? cat.textColor : 'text-gray-700 dark:text-gray-300'
              )}>
                {cat.icon} {cat.label}
              </span>
              {isCurrent && (
                <span className="text-xs font-bold flex-shrink-0" style={{ color: cat.color }}>
                  ← now
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Based on US EPA AQI standard breakpoints.
      </p>
    </div>
  )
}
