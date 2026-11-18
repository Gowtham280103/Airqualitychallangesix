import React, { useState } from 'react'
import { Menu, Sun, Moon, MapPin, Search, Wind } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from '../../context/LocationContext'
import { sanitizeCity } from '../../utils/sanitize'

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { location, updateLocation } = useLocation()
  const [editing, setEditing] = useState(false)
  const [cityInput, setCityInput] = useState('')

  function handleCitySubmit(e) {
    e.preventDefault()
    const clean = sanitizeCity(cityInput)
    if (clean) {
      updateLocation({ city: clean, country: location.country })
    }
    setEditing(false)
    setCityInput('')
  }

  function startEditing() {
    setEditing(true)
    setCityInput(location.city)
  }

  return (
    <header className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 btn-primary text-sm z-50"
        >
          Skip to main content
        </a>

        {/* Mobile brand (only visible on small screens) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)' }}
            aria-hidden="true"
          >
            <Wind className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">BreatheWise</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Location selector */}
        <div className="flex items-center">
          {editing ? (
            <form onSubmit={handleCitySubmit} className="flex gap-2 items-center">
              <label htmlFor="city-input" className="sr-only">Enter city name</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-green-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="city-input"
                  type="text"
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  placeholder="City name…"
                  className="input-field pl-8 py-1.5 text-sm w-36 sm:w-48 h-8"
                  autoFocus
                  maxLength={100}
                  aria-label="City name"
                />
              </div>
              <button type="submit" className="btn-primary py-1 px-3 text-xs h-8">Set</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary py-1 px-3 text-xs h-8">Cancel</button>
            </form>
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                         transition-all duration-150 group"
              aria-label={`Current location: ${location.city}. Click to change.`}
            >
              <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
              <span className="max-w-24 sm:max-w-none truncate">{location.city}</span>
              <Search className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-xl"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            : <Moon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          }
        </button>
      </div>
    </header>
  )
}
