import { describe, expect, it } from 'vitest'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatTotalCalories,
} from './format'

describe('formatters', () => {
  it('formats total calories with zero decimals', () => {
    expect(formatTotalCalories(500.49)).toBe('500')
  })

  it('shows unavailable totals instead of zero for null values', () => {
    expect(formatTotalCalories(null)).toBe('—')
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
})
