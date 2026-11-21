import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AQIGauge from '../components/dashboard/AQIGauge'
import PollutantCard from '../components/dashboard/PollutantCard'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import { Wind } from 'lucide-react'

describe('AQIGauge', () => {
  it('renders AQI value', () => {
    render(<AQIGauge aqi={120} />)
    expect(screen.getByText('120')).toBeInTheDocument()
  })
  it('renders category label', () => {
    render(<AQIGauge aqi={120} />)
    expect(screen.getByText(/Unhealthy for Sensitive Groups/i)).toBeInTheDocument()
  })
  it('renders -- for null AQI', () => {
    render(<AQIGauge aqi={null} />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })
  it('has accessible role', () => {
    render(<AQIGauge aqi={50} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('PollutantCard', () => {
  it('renders pollutant label', () => {
    render(<PollutantCard pollutantKey="pm25" value={15} />)
    expect(screen.getByText('PM2.5')).toBeInTheDocument()
  })
  it('renders value', () => {
    render(<PollutantCard pollutantKey="pm25" value={15} />)
    expect(screen.getByText('15.0')).toBeInTheDocument()
  })
  it('shows -- when no value', () => {
    render(<PollutantCard pollutantKey="pm25" value={null} />)
    expect(screen.getByText('--')).toBeInTheDocument()
  })
  it('returns null for invalid key', () => {
    const { container } = render(<PollutantCard pollutantKey="invalid" value={10} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge variant="green">Good</Badge>)
    expect(screen.getByText('Good')).toBeInTheDocument()
  })
  it('applies variant class', () => {
    const { container } = render(<Badge variant="red">Test</Badge>)
    expect(container.firstChild.className).toContain('red')
  })
})

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Wind} title="No data" description="Nothing here" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })
  it('renders action when provided', () => {
    render(<EmptyState title="Empty" action={<button>Click me</button>} />)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})

describe('LoadingSpinner', () => {
  it('has role status', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  it('has accessible label', () => {
    render(<LoadingSpinner label="Fetching data" />)
    expect(screen.getByRole('status', { name: 'Fetching data' })).toBeInTheDocument()
  })
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><div>Content</div></ErrorBoundary>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders error UI when child throws', () => {
    const ThrowingComponent = () => { throw new Error('Test error') }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><ThrowingComponent /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('allows retry after error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true
    const FlakeyComponent = () => {
      if (shouldThrow) throw new Error('Flaky')
      return <div>Recovered</div>
    }
    render(<ErrorBoundary><FlakeyComponent /></ErrorBoundary>)
    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    spy.mockRestore()
  })
})
