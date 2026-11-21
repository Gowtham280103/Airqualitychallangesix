import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── localStorage mock ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ── matchMedia mock ───────────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ── ResizeObserver mock (required by Recharts ResponsiveContainer) ─────────────
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// ── scrollIntoView mock ───────────────────────────────────────────────────────
Element.prototype.scrollIntoView = vi.fn()

// ── Suppress noisy console output in tests ───────────────────────────────────
// Use restorableSpy — do NOT call the original to avoid recursion
vi.spyOn(console, 'warn').mockImplementation((...args) => {
  const msg = args[0]
  // Suppress React act() warnings and recharts deprecation noise
  if (typeof msg === 'string' && (
    msg.includes('recharts') ||
    msg.includes('act(') ||
    msg.includes('not wrapped in act')
  )) return
})

const originalError = console.error.bind(console)
vi.spyOn(console, 'error').mockImplementation((...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : ''
  // Suppress known React test noise but keep real errors visible
  if (
    msg.includes('inside a test was not wrapped') ||
    msg.includes('ReactDOM.render') ||
    msg.includes('act(...)') ||
    msg.includes('Consider adding an error boundary')
  ) return
  originalError(...args)
})
