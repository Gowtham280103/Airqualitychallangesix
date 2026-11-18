import React from 'react'
import clsx from 'clsx'

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-16 h-16 border-4',
}

export default function LoadingSpinner({ size = 'md', className, label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          sizes[size],
          'rounded-full border-green-200 border-t-green-600 animate-spin'
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
