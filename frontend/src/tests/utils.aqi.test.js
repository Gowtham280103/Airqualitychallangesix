import { describe, it, expect } from 'vitest'
import { getAQICategory, getAQIPercent, getPollutantStatus, AQI_CATEGORIES, formatAQI, compareAQI } from '../utils/aqi'

describe('getAQICategory', () => {
  it('returns Good for AQI 0', () => {
    expect(getAQICategory(0).label).toBe('Good')
  })
  it('returns Good for AQI 50', () => {
    expect(getAQICategory(50).label).toBe('Good')
  })
  it('returns Moderate for AQI 51', () => {
    expect(getAQICategory(51).label).toBe('Moderate')
  })
  it('returns Moderate for AQI 100', () => {
    expect(getAQICategory(100).label).toBe('Moderate')
  })
  it('returns Unhealthy for Sensitive Groups for AQI 101', () => {
    expect(getAQICategory(101).label).toBe('Unhealthy for Sensitive Groups')
  })
  it('returns Unhealthy for AQI 151', () => {
    expect(getAQICategory(151).label).toBe('Unhealthy')
  })
  it('returns Very Unhealthy for AQI 201', () => {
    expect(getAQICategory(201).label).toBe('Very Unhealthy')
  })
  it('returns Hazardous for AQI 301', () => {
    expect(getAQICategory(301).label).toBe('Hazardous')
  })
  it('returns Hazardous for AQI 500', () => {
    expect(getAQICategory(500).label).toBe('Hazardous')
  })
  it('returns Good for null', () => {
    expect(getAQICategory(null).label).toBe('Good')
  })
  it('all categories have required fields', () => {
    AQI_CATEGORIES.forEach(c => {
      expect(c).toHaveProperty('label')
      expect(c).toHaveProperty('color')
      expect(c).toHaveProperty('bgColor')
      expect(c).toHaveProperty('textColor')
      expect(c).toHaveProperty('description')
    })
  })
})

describe('getAQIPercent', () => {
  it('returns 0 for AQI 0', () => expect(getAQIPercent(0)).toBe(0))
  it('returns 10 for AQI 50', () => expect(getAQIPercent(50)).toBe(10))
  it('returns 100 for AQI 500', () => expect(getAQIPercent(500)).toBe(100))
  it('caps at 100 for values over 500', () => expect(getAQIPercent(600)).toBe(100))
})

describe('getPollutantStatus', () => {
  it('returns good for safe PM2.5', () => expect(getPollutantStatus('pm25', 10)).toBe('good'))
  it('returns moderate for moderate PM2.5', () => expect(getPollutantStatus('pm25', 20)).toBe('moderate'))
  it('returns poor for high PM2.5', () => expect(getPollutantStatus('pm25', 100)).toBe('poor'))
  it('returns unknown for null value', () => expect(getPollutantStatus('pm25', null)).toBe('unknown'))
  it('returns unknown for invalid key', () => expect(getPollutantStatus('xyz', 10)).toBe('unknown'))
})

describe('formatAQI', () => {
  it('formats good AQI', () => {
    expect(formatAQI(42)).toBe('42 — Good')
  })
  it('formats moderate AQI', () => {
    expect(formatAQI(75)).toBe('75 — Moderate')
  })
  it('formats unhealthy AQI', () => {
    expect(formatAQI(165)).toBe('165 — Unhealthy')
  })
  it('returns N/A for null', () => {
    expect(formatAQI(null)).toBe('N/A')
  })
  it('returns N/A for NaN', () => {
    expect(formatAQI(NaN)).toBe('N/A')
  })
})

describe('compareAQI', () => {
  it('detects improvement', () => {
    expect(compareAQI(80, 100).direction).toBe('better')
  })
  it('detects worsening', () => {
    expect(compareAQI(120, 100).direction).toBe('worse')
  })
  it('detects stable (within 5)', () => {
    expect(compareAQI(102, 100).direction).toBe('stable')
  })
  it('handles null inputs', () => {
    expect(compareAQI(null, 100).direction).toBe('stable')
  })
  it('returns correct delta', () => {
    expect(compareAQI(80, 100).delta).toBe(-20)
  })
})
