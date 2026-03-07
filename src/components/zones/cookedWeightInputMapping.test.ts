import { describe, expect, it } from 'vitest'
import {
  toCanonicalCookedWeightGrams,
  toCookedInputDisplayValue,
} from './cookedWeightInputMapping'

describe('cookedWeightInputMapping', () => {
  it('maps ounce input values to canonical grams', () => {
    expect(toCanonicalCookedWeightGrams(10, 'oz')).toBeCloseTo(283.49523125, 6)
    expect(toCanonicalCookedWeightGrams(10, 'g')).toBe(10)
    expect(toCanonicalCookedWeightGrams(null, 'oz')).toBeNull()
  })

  it('maps canonical grams to stable ounce display values', () => {
    expect(toCookedInputDisplayValue(2.8349523125, 'oz')).toBe(0.1)
    expect(toCookedInputDisplayValue(250, 'g')).toBe(250)
    expect(toCookedInputDisplayValue(null, 'oz')).toBeNull()
  })
})
