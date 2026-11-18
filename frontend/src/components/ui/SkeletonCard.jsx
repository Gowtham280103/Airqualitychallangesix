import React from 'react'

export default function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`card p-6 animate-pulse ${className}`} aria-busy="true" aria-label="Loading content">
      <div className="skeleton h-4 w-32 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`skeleton h-3 mb-2 ${i === rows - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}
