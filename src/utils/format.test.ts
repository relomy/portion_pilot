import { describe, expect, it } from 'vitest'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatPortionCalories,
  formatRawPackageServings,
  formatTotalCalories,
} from './format'

describe('formatters', () => {
  it('formats manual total calories as integers', () => {
    expect(formatTotalCalories(500.49, 'manualTotal')).toBe('500')
  })

  it('formats package-label total calories with up to one decimal place', () => {
    expect(formatTotalCalories(1303.5384, 'packageLabel')).toBe('1303.5')
    expect(formatTotalCalories(1304, 'packageLabel')).toBe('1304')
  })

  it('formats per-serving-derived total calories as integers', () => {
    expect(formatTotalCalories(500.49, 'perServing')).toBe('500')
  })

  it('shows unavailable totals for null values regardless of source', () => {
    expect(formatTotalCalories(null, null)).toBe('—')
  })

  it('formats calories per serving with up to one decimal place', () => {
    expect(formatCaloriesPerServing(125)).toBe('125')
    expect(formatCaloriesPerServing(125.25)).toBe('125.3')
  })

  it('shows unavailable calories per serving instead of zero for null values', () => {
    expect(formatCaloriesPerServing(null)).toBe('—')
  })

  it('formats calories per gram with 2 to 3 decimals', () => {
    expect(formatCaloriesPerGram(2)).toBe('2.00')
    expect(formatCaloriesPerGram(2.3456)).toBe('2.346')
  })

  it('formats calories per ounce with 1 to 2 decimals', () => {
    expect(formatCaloriesPerOunce(56.1)).toBe('56.1')
    expect(formatCaloriesPerOunce(56.155)).toBe('56.16')
  })

  it('formats calories per 100g with 0 to 1 decimals', () => {
    expect(formatCaloriesPer100Grams(200)).toBe('200')
    expect(formatCaloriesPer100Grams(200.44)).toBe('200.4')
  })

  it('returns the cooked-weight placeholder for null values', () => {
    expect(formatCaloriesPerGram(null)).toBe('Need cooked weight')
  })

  it('formats raw package servings with 2 to 3 decimals', () => {
    expect(formatRawPackageServings(3.5)).toBe('3.50')
    expect(formatRawPackageServings(3.5230769)).toBe('3.523')
  })

  it('formats portion calories as integers', () => {
    expect(formatPortionCalories(299.9)).toBe('300')
  })

  it('shows a neutral unavailable marker when portion calories are unavailable', () => {
    expect(formatPortionCalories(null)).toBe('—')
  })
})
