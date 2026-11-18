import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeCity, isValidCoord, isValidAQI } from '../utils/sanitize'

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert(1)</script>hello')).not.toContain('<script>')
  })
  it('limits length', () => {
    expect(sanitizeText('a'.repeat(1000), 100)).toHaveLength(100)
  })
  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(123)).toBe('')
  })
  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
  })
})

describe('sanitizeCity', () => {
  it('removes special characters', () => {
    expect(sanitizeCity('Delhi<script>')).not.toContain('<')
  })
  it('allows letters, spaces, hyphens, commas', () => {
    // sanitizeCity allows commas — verify comma is preserved
    expect(sanitizeCity('New Delhi, India')).toBe('New Delhi, India')
  })
  it('limits length to 100', () => {
    expect(sanitizeCity('a'.repeat(200))).toHaveLength(100)
  })
  it('returns empty string for non-string input', () => {
    expect(sanitizeCity(null)).toBe('')
  })
})

describe('isValidCoord', () => {
  it('validates valid coordinates', () => {
    expect(isValidCoord(28.6, 77.2)).toBe(true)
  })
  it('rejects out-of-range lat', () => {
    expect(isValidCoord(100, 77)).toBe(false)
  })
  it('rejects out-of-range lon', () => {
    expect(isValidCoord(28, 200)).toBe(false)
  })
  it('rejects non-numbers', () => {
    expect(isValidCoord('lat', 'lon')).toBe(false)
  })
})

describe('isValidAQI', () => {
  it('accepts valid AQI values', () => {
    expect(isValidAQI(0)).toBe(true)
    expect(isValidAQI(250)).toBe(true)
    expect(isValidAQI(500)).toBe(true)
  })
  it('rejects negative values', () => {
    expect(isValidAQI(-1)).toBe(false)
  })
  it('rejects values over 500', () => {
    expect(isValidAQI(501)).toBe(false)
  })
  it('rejects non-numbers', () => {
    expect(isValidAQI('abc')).toBe(false)
  })
})
