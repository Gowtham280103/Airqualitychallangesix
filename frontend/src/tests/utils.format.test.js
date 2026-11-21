import { describe, it, expect } from 'vitest'
import {
  formatDate, formatDateTime, formatRelativeTime,
  formatNumber, formatDistance, formatDuration
} from '../utils/format'

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
  })
  it('returns unknown date for null', () => {
    expect(formatDate(null)).toBe('Unknown date')
  })
  it('returns unknown date for invalid string', () => {
    expect(formatDate('not-a-date')).toBe('Unknown date')
  })
  it('accepts a Date object', () => {
    expect(formatDate(new Date('2024-06-01'))).toContain('2024')
  })
})

describe('formatNumber', () => {
  it('formats to 1 decimal by default', () => {
    expect(formatNumber(42.567)).toBe('42.6')
  })
  it('formats to specified decimals', () => {
    expect(formatNumber(42.5, 0)).toBe('43')
  })
  it('returns -- for null', () => {
    expect(formatNumber(null)).toBe('--')
  })
  it('returns -- for NaN', () => {
    expect(formatNumber(NaN)).toBe('--')
  })
  it('returns -- for undefined', () => {
    expect(formatNumber(undefined)).toBe('--')
  })
})

describe('formatDistance', () => {
  it('shows metres under 1000', () => {
    expect(formatDistance(500)).toBe('500 m')
  })
  it('shows kilometres at or above 1000', () => {
    expect(formatDistance(1500)).toBe('1.5 km')
  })
  it('returns -- for invalid', () => {
    expect(formatDistance(NaN)).toBe('--')
  })
  it('returns -- for negative', () => {
    expect(formatDistance(-1)).toBe('--')
  })
})

describe('formatDuration', () => {
  it('shows minutes under 60', () => {
    expect(formatDuration(45)).toBe('45 min')
  })
  it('shows hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })
  it('shows hours only when no remainder', () => {
    expect(formatDuration(120)).toBe('2h')
  })
  it('returns -- for invalid', () => {
    expect(formatDuration(NaN)).toBe('--')
  })
})
