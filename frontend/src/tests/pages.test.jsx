import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { LocationProvider } from '../context/LocationContext'
import { AlertProvider } from '../context/AlertContext'

// ── Mock API services ─────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  airQualityService: {
    getCurrent: vi.fn().mockResolvedValue({
      aqi: 85,
      source: 'Demo',
      updated_at: new Date().toISOString(),
      pollutants: { pm25: 22, pm10: 45, no2: 32, so2: 8, co: 1.2, o3: 40 },
      weather: { temp: 18, humidity: 65, wind_speed: 12, visibility: 8 },
    }),
    getHistory: vi.fn().mockResolvedValue([
      { date: '2024-01-01', aqi: 80 },
      { date: '2024-01-02', aqi: 95 },
    ]),
  },
  aiService: {
    chat: vi.fn().mockResolvedValue({ message: 'AI response', fallback: false }),
    getIndoorAdvice: vi.fn().mockResolvedValue({ tips: ['Use HEPA filter', 'Ventilate daily'] }),
  },
  routeService: { plan: vi.fn().mockRejectedValue(new Error('no api')) },
  alertsService: { getAlerts: vi.fn().mockRejectedValue(new Error('no api')) },
  communityService: {
    getObservations: vi.fn().mockResolvedValue({ observations: [] }),
    submitObservation: vi.fn().mockResolvedValue({ id: 1 }),
  },
}))

// ── Mock hooks that use setInterval (prevents timer leaks in jsdom) ────────────
vi.mock('../hooks/useAirQuality', () => ({
  useCurrentAQI: vi.fn(() => ({
    data: {
      aqi: 85,
      source: 'Demo',
      updated_at: new Date().toISOString(),
      pollutants: { pm25: 22, pm10: 45, no2: 32, so2: 8, co: 1.2, o3: 40 },
      weather: { temp: 18, humidity: 65, wind_speed: 12, visibility: 8 },
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useAQIHistory: vi.fn(() => ({
    data: [
      { date: '2024-01-01', aqi: 80 },
      { date: '2024-01-02', aqi: 95 },
      { date: '2024-01-03', aqi: 110 },
      { date: '2024-01-04', aqi: 75 },
      { date: '2024-01-05', aqi: 90 },
      { date: '2024-01-06', aqi: 130 },
      { date: '2024-01-07', aqi: 85 },
    ],
    loading: false,
    error: null,
  })),
}))

function Wrapper({ children }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <LocationProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </LocationProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

import Dashboard from '../pages/Dashboard'
import AIAssistant from '../pages/AIAssistant'
import RoutePlanner from '../pages/RoutePlanner'
import IndoorAdvisor from '../pages/IndoorAdvisor'
import Sustainability from '../pages/Sustainability'
import Alerts from '../pages/Alerts'
import Community from '../pages/Community'
import ImpactTracker from '../pages/ImpactTracker'

// ─────────────────────────────────────────────────────────────────────────────
describe('Dashboard', () => {
  it('renders heading', () => {
    render(<Wrapper><Dashboard /></Wrapper>)
    // The dashboard now shows "Air Quality in Delhi" as the main h1
    expect(screen.getByRole('heading', { name: /Air Quality in/i })).toBeInTheDocument()
  })

  it('renders pollutants section heading', () => {
    render(<Wrapper><Dashboard /></Wrapper>)
    expect(screen.getByText(/Pollutant Breakdown/i)).toBeInTheDocument()
  })

  it('renders refresh button', () => {
    render(<Wrapper><Dashboard /></Wrapper>)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })

  it('displays AQI value', () => {
    render(<Wrapper><Dashboard /></Wrapper>)
    // AQI 85 from mock — appears in multiple places (hero strip + gauge), use getAllByText
    expect(screen.getAllByText('85').length).toBeGreaterThan(0)
  })

  it('renders 7-day AQI trend section', () => {
    render(<Wrapper><Dashboard /></Wrapper>)
    expect(screen.getByText(/7-Day AQI Trend/i)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AIAssistant', () => {
  it('renders heading', () => {
    render(<Wrapper><AIAssistant /></Wrapper>)
    expect(screen.getByRole('heading', { name: /AI Pollution Assistant/i })).toBeInTheDocument()
  })

  it('renders chat input', () => {
    render(<Wrapper><AIAssistant /></Wrapper>)
    expect(screen.getByRole('textbox', { name: /Message input/i })).toBeInTheDocument()
  })

  it('renders welcome message from AI', () => {
    render(<Wrapper><AIAssistant /></Wrapper>)
    expect(screen.getByText(/BreatheWise AI/i)).toBeInTheDocument()
  })

  it('suggested questions are present', () => {
    render(<Wrapper><AIAssistant /></Wrapper>)
    expect(screen.getByRole('button', { name: /safe to go outside/i })).toBeInTheDocument()
  })

  it('send button is disabled when input empty', () => {
    render(<Wrapper><AIAssistant /></Wrapper>)
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('RoutePlanner', () => {
  it('renders heading', () => {
    render(<Wrapper><RoutePlanner /></Wrapper>)
    expect(screen.getByRole('heading', { name: /Route Planner/i })).toBeInTheDocument()
  })

  it('renders origin and destination inputs', () => {
    render(<Wrapper><RoutePlanner /></Wrapper>)
    expect(screen.getByLabelText(/Starting Point/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Destination/i)).toBeInTheDocument()
  })

  it('submit button is disabled when destination is empty', () => {
    render(<Wrapper><RoutePlanner /></Wrapper>)
    const btn = screen.getByRole('button', { name: /Find Low-Emission Routes/i })
    expect(btn).toBeDisabled()
  })

  it('submit button enabled when destination filled', () => {
    render(<Wrapper><RoutePlanner /></Wrapper>)
    const dest = screen.getByLabelText(/Destination/i)
    fireEvent.change(dest, { target: { value: 'India Gate' } })
    expect(screen.getByRole('button', { name: /Find Low-Emission Routes/i })).not.toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('IndoorAdvisor', () => {
  it('renders heading', () => {
    render(<Wrapper><IndoorAdvisor /></Wrapper>)
    expect(screen.getByRole('heading', { name: /Indoor Air Quality Advisor/i })).toBeInTheDocument()
  })

  it('renders dwelling type options', () => {
    render(<Wrapper><IndoorAdvisor /></Wrapper>)
    expect(screen.getByRole('button', { name: /Apartment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /House/i })).toBeInTheDocument()
  })

  it('concern buttons have aria-pressed', () => {
    render(<Wrapper><IndoorAdvisor /></Wrapper>)
    const ventBtn = screen.getByRole('button', { name: /Ventilation/i })
    expect(ventBtn).toHaveAttribute('aria-pressed')
  })

  it('generate plan button is present', () => {
    render(<Wrapper><IndoorAdvisor /></Wrapper>)
    expect(screen.getByRole('button', { name: /Generate Action Plan/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Sustainability', () => {
  it('renders heading', () => {
    render(<Wrapper><Sustainability /></Wrapper>)
    expect(screen.getByRole('heading', { name: /Sustainability Recommendations/i })).toBeInTheDocument()
  })

  it('renders category sections', () => {
    render(<Wrapper><Sustainability /></Wrapper>)
    expect(screen.getByText('Transportation')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Waste')).toBeInTheDocument()
  })

  it('action items are toggleable', () => {
    render(<Wrapper><Sustainability /></Wrapper>)
    const items = screen.getAllByRole('button', { name: /Use public transport/i })
    expect(items.length).toBeGreaterThan(0)
    fireEvent.click(items[0])
    // After click it should be pressed
    expect(items[0]).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows sustainability score', () => {
    render(<Wrapper><Sustainability /></Wrapper>)
    expect(screen.getByText(/Sustainability score/i)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Alerts', () => {
  it('renders heading', () => {
    render(<Wrapper><Alerts /></Wrapper>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders severity summary labels', () => {
    render(<Wrapper><Alerts /></Wrapper>)
    // Use getAllByText since "Low" can appear in both the summary card and an alert badge
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getAllByText('Low').length).toBeGreaterThan(0)
  })

  it('renders refresh button', () => {
    render(<Wrapper><Alerts /></Wrapper>)
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Community', () => {
  it('renders heading', () => {
    render(<Wrapper><Community /></Wrapper>)
    expect(screen.getByRole('heading', { name: /Community Insights/i })).toBeInTheDocument()
  })

  it('report button opens form', () => {
    render(<Wrapper><Community /></Wrapper>)
    const btn = screen.getByRole('button', { name: /Report Observation/i })
    fireEvent.click(btn)
    // aria-label is "Submit pollution observation" (lowercase 'p')
    expect(screen.getByRole('form', { name: /submit pollution observation/i })).toBeInTheDocument()
  })

  it('form has location and description inputs', () => {
    render(<Wrapper><Community /></Wrapper>)
    fireEvent.click(screen.getByRole('button', { name: /Report Observation/i }))
    expect(screen.getByLabelText(/Location name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Observation description/i)).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ImpactTracker', () => {
  it('renders heading', () => {
    render(<Wrapper><ImpactTracker /></Wrapper>)
    expect(screen.getByRole('heading', { name: /Impact Tracker/i })).toBeInTheDocument()
  })

  it('renders log action button', () => {
    render(<Wrapper><ImpactTracker /></Wrapper>)
    expect(screen.getByRole('button', { name: /Log Action/i })).toBeInTheDocument()
  })

  it('disclaimer is present', () => {
    render(<Wrapper><ImpactTracker /></Wrapper>)
    expect(screen.getByText(/estimates/i)).toBeInTheDocument()
  })

  it('action type selector is present', () => {
    render(<Wrapper><ImpactTracker /></Wrapper>)
    expect(screen.getByRole('combobox', { name: /Action Type/i })).toBeInTheDocument()
  })

  it('shows CO2 stats card', () => {
    render(<Wrapper><ImpactTracker /></Wrapper>)
    expect(screen.getByText(/CO₂ Avoided/i)).toBeInTheDocument()
  })
})
