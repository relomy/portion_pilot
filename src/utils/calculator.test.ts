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
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 500,
      totalCalories: null,
      cookedWeightGrams: 250,
      portionEatenGrams: null,
      yourServings: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: null,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.calorie_source_used).toBe('total')
    expect(result.caloriesPerServing).toBeNull()
    expect(result.caloriesPerGram).toBeCloseTo(2, 10)
    expect(result.totalCaloriesDisplaySource).toBe('manualTotal')
    expect(result.assumptions.servings_assumed).toBe(false)
  })

  it('derives package-label totals in grams', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      manualTotalCalories: null,
      totalCalories: null,
      caloriesPerServing: null,
      portionEatenGrams: null,
      yourServings: null,
      cookedWeightGrams: null,
      rawTotalWeightGrams: 458,
      packageServingWeightGrams: 130,
      packageCaloriesPerServing: 370,
    })

    expect(result.rawPackageServings).toBeCloseTo(3.5230769, 6)
    expect(result.totalCalories).toBeCloseTo(1303.5384615, 6)
    expect(result.totalCaloriesDisplaySource).toBe('packageLabel')
    expect(result.calorie_source_used).toBe('total')
    expect(result.caloriesPerServing).toBeNull()
  })

  it('derives package-label totals in ounces', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      manualTotalCalories: null,
      totalCalories: null,
      caloriesPerServing: null,
      portionEatenGrams: null,
      yourServings: null,
      cookedWeightGrams: null,
      rawTotalWeightGrams: ouncesToGrams(16.155),
      packageServingWeightGrams: ouncesToGrams(4.586),
      packageCaloriesPerServing: 370,
    })

    expect(result.rawPackageServings).toBeCloseTo(3.5229, 3)
    expect(result.totalCalories).toBeCloseTo(1303.3907544, 6)
    expect(result.totalCaloriesDisplaySource).toBe('packageLabel')
  })

  it('derives displayed calories per serving from package-label totals when user servings are known', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      manualTotalCalories: null,
      totalCalories: null,
      caloriesPerServing: null,
      portionEatenGrams: null,
      yourServings: 4,
      cookedWeightGrams: 600,
      rawTotalWeightGrams: 458,
      packageServingWeightGrams: 130,
      packageCaloriesPerServing: 370,
    })

    expect(result.totalCalories).toBeCloseTo(1303.5384615, 6)
    expect(result.caloriesPerServing).toBeCloseTo(325.8846153, 6)
  })

  it('derives calories per serving from the chosen total source when servings are known', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 500,
      totalCalories: null,
      cookedWeightGrams: 250,
      portionEatenGrams: null,
      yourServings: 4,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: 300,
    })

    expect(result.calorie_source_used).toBe('total')
    expect(result.totalCalories).toBe(500)
    expect(result.caloriesPerServing).toBe(125)
  })

  it('uses manual totals without package-label output', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 900,
      totalCalories: null,
      caloriesPerServing: null,
      portionEatenGrams: null,
      yourServings: 3,
      cookedWeightGrams: 450,
      rawTotalWeightGrams: 458,
      packageServingWeightGrams: 130,
      packageCaloriesPerServing: 370,
    })

    expect(result.totalCalories).toBe(900)
    expect(result.rawPackageServings).toBeNull()
    expect(result.totalCaloriesDisplaySource).toBe('manualTotal')
    expect(result.caloriesPerServing).toBe(300)
  })

  it('derives total calories from per-serving calories and servings', () => {
    const result = calculateMealMetrics({
      mode: 'perServing',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: null,
      totalCalories: null,
      cookedWeightGrams: 300,
      portionEatenGrams: null,
      yourServings: 4,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: 125,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.calorie_source_used).toBe('per_serving')
    expect(result.totalCaloriesDisplaySource).toBe('perServing')
    expect(result.caloriesPerServing).toBe(125)
  })

  it('marks servings as assumed when per-serving calories exist without servings', () => {
    const result = calculateMealMetrics({
      mode: 'perServing',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: null,
      totalCalories: null,
      cookedWeightGrams: 300,
      portionEatenGrams: null,
      yourServings: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: 125,
    })

    expect(result.totalCalories).toBe(125)
    expect(result.assumptions.servings_assumed).toBe(true)
  })

  it('returns null per-weight values when cooked weight is missing', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: 500,
      totalCalories: null,
      cookedWeightGrams: null,
      portionEatenGrams: null,
      yourServings: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: null,
    })

    expect(result.totalCalories).toBe(500)
    expect(result.caloriesPerGram).toBeNull()
    expect(result.caloriesPerOunce).toBeNull()
    expect(result.caloriesPer100Grams).toBeNull()
  })

  it('reports insufficient inputs when neither calorie source is usable', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'manualTotal',
      manualTotalCalories: null,
      totalCalories: null,
      cookedWeightGrams: 250,
      portionEatenGrams: null,
      yourServings: null,
      rawTotalWeightGrams: null,
      packageServingWeightGrams: null,
      packageCaloriesPerServing: null,
      caloriesPerServing: null,
    })

    expect(result.calorie_source_used).toBe('insufficient')
    expect(result.totalCalories).toBeNull()
  })

  it('treats invalid package-label inputs as insufficient', () => {
    const result = calculateMealMetrics({
      mode: 'total',
      totalCaloriesSource: 'packageLabel',
      manualTotalCalories: null,
      totalCalories: null,
      caloriesPerServing: null,
      portionEatenGrams: null,
      yourServings: null,
      cookedWeightGrams: null,
      rawTotalWeightGrams: 458,
      packageServingWeightGrams: 0,
      packageCaloriesPerServing: 370,
    })

    expect(result.totalCalories).toBeNull()
    expect(result.rawPackageServings).toBeNull()
    expect(result.totalCaloriesDisplaySource).toBeNull()
    expect(result.calorie_source_used).toBe('insufficient')
  })

  it('derives portion calories in total manual mode from cooked batch weight and portion eaten', () => {
    expect(
      calculateMealMetrics({
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 600,
        totalCalories: 600,
        cookedWeightGrams: 300,
        portionEatenGrams: 150,
        yourServings: null,
        caloriesPerServing: null,
        rawTotalWeightGrams: null,
        packageServingWeightGrams: null,
        packageCaloriesPerServing: null,
      }),
    ).toMatchObject({
      totalCalories: 600,
      caloriesPerGram: 2,
      portionCalories: 300,
      caloriesPerServing: null,
    })
  })

  it('leaves total-mode portion calories unavailable without cooked batch weight', () => {
    expect(
      calculateMealMetrics({
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 600,
        totalCalories: 600,
        cookedWeightGrams: null,
        portionEatenGrams: 150,
        yourServings: null,
        caloriesPerServing: null,
        rawTotalWeightGrams: null,
        packageServingWeightGrams: null,
        packageCaloriesPerServing: null,
      }).portionCalories,
    ).toBeNull()
  })

  it('keeps per-serving mode unchanged when servings are missing', () => {
    expect(
      calculateMealMetrics({
        mode: 'perServing',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: null,
        totalCalories: null,
        cookedWeightGrams: null,
        portionEatenGrams: null,
        yourServings: null,
        caloriesPerServing: 125,
        rawTotalWeightGrams: null,
        packageServingWeightGrams: null,
        packageCaloriesPerServing: null,
      }),
    ).toMatchObject({
      totalCalories: 125,
      caloriesPerServing: 125,
      portionCalories: null,
      assumptions: { servings_assumed: true },
    })
  })
})
