import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Navigation, Home,
  Leaf, Bell, Users, TrendingUp, Wind, X, Sparkles
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Live AQI overview' },
  { path: '/assistant', label: 'AI Assistant', icon: MessageSquare, description: 'Ask about air quality' },
  { path: '/routes', label: 'Route Planner', icon: Navigation, description: 'Low-emission routes' },
  { path: '/indoor', label: 'Indoor Advisor', icon: Home, description: 'Indoor air quality' },
  { path: '/sustainability', label: 'Sustainability', icon: Leaf, description: 'Eco actions' },
  { path: '/alerts', label: 'Alerts', icon: Bell, description: 'Pollution alerts' },
  { path: '/community', label: 'Community', icon: Users, description: 'Local insights' },
  { path: '/impact', label: 'Impact Tracker', icon: TrendingUp, description: 'Your eco impact' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full"
        aria-label="Main navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
          'transform transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}
        aria-label="Main navigation"
        aria-hidden={!open}
      >
        <div className="flex justify-end p-4 pb-2">
          <button
            onClick={onClose}
            className="btn-ghost p-2 rounded-lg"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  )
}

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #0d9488 100%)' }}
          aria-hidden="true"
        >
          <Wind className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-gray-900 dark:text-white text-base leading-none tracking-tight">
            BreatheWise
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
            Urban Air Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto min-h-0"
        role="navigation"
        aria-label="Application sections"
      >
        {navItems.map(({ path, label, icon: Icon, description }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                'focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none',
                isActive
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  isActive
                    ? 'bg-green-100 dark:bg-green-800/40'
                    : 'group-hover:bg-gray-100 dark:group-hover:bg-gray-700/60'
                )}>
                  <Icon
                    className={clsx(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    )}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate leading-none mb-0.5">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate leading-none">{description}</p>
                </div>
                {isActive && (
                  <div className="w-1.5 h-5 rounded-full bg-green-500 flex-shrink-0" aria-hidden="true" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Hack2Skill PromptWars Challenge 6
          </p>
        </div>
      </div>
    </div>
  )
}
