import { describe, expect, it } from 'vitest'
import {
  calculateMealMetrics,
  gramsToOunces,
  ouncesToGrams,
} from './calculator'

describe('weight conversions', () => {
  it('converts ounces to grams with full precision', () => {
    expect(ouncesToGrams(8)).toBeCloseTo(226.796185, 6)
  })

  it('converts grams to ounces with full precision', () => {
    expect(gramsToOunces(250)).toBeCloseTo(8.81849049, 6)
  })
})

describe('calculateMealMetrics', () => {
  it('uses total calories when provided', () => {
    const result = calculateMealMetrics({
      totalCalories: 500,
      cookedWeightGrams: 250,
      servings: null,
      caloriesPerServing: null,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.calorie_source_used).toBe('total')
    expect(result.caloriesPerGram).toBeCloseTo(2, 10)
    expect(result.assumptions.servings_assumed).toBe(false)
  })

  it('derives total calories from per-serving calories and servings', () => {
    const result = calculateMealMetrics({
      totalCalories: null,
      cookedWeightGrams: 300,
      servings: 4,
      caloriesPerServing: 125,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.calorie_source_used).toBe('per_serving')
    expect(result.caloriesPerServing).toBe(125)
  })

  it('marks servings as assumed when per-serving calories exist without servings', () => {
    const result = calculateMealMetrics({
      totalCalories: null,
      cookedWeightGrams: 300,
      servings: null,
      caloriesPerServing: 125,
    })

    expect(result.totalCalories).toBe(125)
    expect(result.assumptions.servings_assumed).toBe(true)
  })

  it('returns null per-weight values when cooked weight is missing', () => {
    const result = calculateMealMetrics({
      totalCalories: 500,
      cookedWeightGrams: null,
      servings: null,
      caloriesPerServing: null,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.caloriesPerGram).toBeNull()
    expect(result.caloriesPerOunce).toBeNull()
    expect(result.caloriesPer100Grams).toBeNull()
  })

  it('reports insufficient inputs when neither calorie source is usable', () => {
    const result = calculateMealMetrics({
      totalCalories: null,
      cookedWeightGrams: 250,
      servings: null,
      caloriesPerServing: null,
    })

    expect(result.calorie_source_used).toBe('insufficient')
    expect(result.totalCalories).toBeNull()
  })
})
