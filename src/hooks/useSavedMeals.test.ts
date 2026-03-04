import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, useSavedMeals } from './useSavedMeals'

function createStorageMock() {
  let store = new Map<string, string>()

  return {
    clear() {
      store = new Map<string, string>()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
    get length() {
      return store.size
    },
  }
}

const storage = createStorageMock()

beforeEach(() => {
  vi.stubGlobal('localStorage', storage)
  storage.clear()
})

describe('useSavedMeals', () => {
  it('hydrates existing saved meals without wiping storage on mount', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'seeded-meal',
          createdAt: '2026-03-03T12:00:00.000Z',
          inputs: {
            mealName: 'Seeded Bowl',
            mode: 'total',
            totalCalories: 450,
            caloriesPerServing: null,
            servings: null,
            cookedWeightGrams: 225,
          },
          cachedResult: {
            totalCalories: 450,
            caloriesPerServing: 450,
            caloriesPerGram: 2,
            caloriesPerOunce: 56.69904625,
            caloriesPer100Grams: 200,
            rawPackageServings: null,
            portionCalories: null,
            cookedWeightPerPackageServingGrams: null,
            equivalentPackageServingsEaten: null,
            weightChangeGrams: null,
            weightChangePercent: null,
            weightChangeDirection: null,
            totalCaloriesDisplaySource: 'manualTotal',
            calorie_source_used: 'total',
            assumptions: { servings_assumed: false },
          },
        },
      ]),
    )

    const { result } = renderHook(() => useSavedMeals())

    expect(result.current.savedMeals).toHaveLength(1)
    expect(result.current.savedMeals[0].id).toBe('seeded-meal')
    expect(result.current.savedMeals[0].cachedResult.totalCalories).toBe(450)
    expect(result.current.savedMeals[0].cachedResult.caloriesPerServing).toBeNull()
    expect(result.current.savedMeals[0].cachedResult.totalCaloriesDisplaySource).toBe(
      'manualTotal',
    )
    expect(
      JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]'),
    ).toHaveLength(1)
    expect(
      JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')[0].cachedResult
        .caloriesPerServing,
    ).toBeNull()
  })

  it('maps legacy total calories into manualTotalCalories on hydration', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'legacy-meal',
          createdAt: '2026-03-03T12:00:00.000Z',
          inputs: {
            mealName: 'Legacy Bowl',
            mode: 'total',
            totalCalories: 500,
            caloriesPerServing: null,
            servings: 4,
            cookedWeightGrams: 250,
          },
          cachedResult: {
            totalCalories: 500,
            caloriesPerServing: 125,
            caloriesPerGram: 2,
            caloriesPerOunce: 56.7,
            caloriesPer100Grams: 200,
            rawPackageServings: null,
            portionCalories: null,
            cookedWeightPerPackageServingGrams: null,
            equivalentPackageServingsEaten: null,
            weightChangeGrams: null,
            weightChangePercent: null,
            weightChangeDirection: null,
            totalCaloriesDisplaySource: null,
            calorie_source_used: 'total',
            assumptions: { servings_assumed: false },
          },
        },
      ]),
    )

    const { result } = renderHook(() => useSavedMeals())

    expect(result.current.savedMeals[0].inputs.totalCaloriesSource).toBe(
      'manualTotal',
    )
    expect(result.current.savedMeals[0].inputs.manualTotalCalories).toBe(500)
    expect(result.current.savedMeals[0].inputs.yourServings).toBe(4)
  })

  it('hydrates missing portion fields to null and g for legacy meals', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'legacy-meal',
          createdAt: '2026-03-03T12:00:00.000Z',
          inputs: {
            mealName: 'Legacy Bowl',
            mode: 'total',
            totalCalories: 500,
            servings: 4,
          },
          cachedResult: {
            totalCalories: 500,
            caloriesPerServing: 125,
            caloriesPerGram: null,
            caloriesPerOunce: null,
            caloriesPer100Grams: null,
            rawPackageServings: null,
            portionCalories: null,
            cookedWeightPerPackageServingGrams: null,
            equivalentPackageServingsEaten: null,
            weightChangeGrams: null,
            weightChangePercent: null,
            weightChangeDirection: null,
            totalCaloriesDisplaySource: 'manualTotal',
            calorie_source_used: 'total',
            assumptions: { servings_assumed: false },
          },
        },
      ]),
    )

    const { result } = renderHook(() => useSavedMeals())

    expect(result.current.savedMeals[0].inputs.portionEaten).toBeNull()
    expect(result.current.savedMeals[0].inputs.portionEatenUnit).toBe('g')
  })

  it('saves a meal with cached computed results', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Chicken Bowl',
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 500,
        totalCalories: 500,
        caloriesPerServing: null,
        yourServings: null,
        servings: null,
        cookedWeightGrams: 250,
        portionEaten: null,
        portionEatenUnit: 'g',
        rawTotalWeight: null,
        rawTotalWeightUnit: 'g',
        packageServingWeight: null,
        packageServingWeightUnit: 'g',
        packageCaloriesPerServing: null,
      })
    })

    expect(result.current.savedMeals).toHaveLength(1)
    expect(result.current.savedMeals[0].cachedResult.totalCalories).toBe(500)
  })

  it('preserves entered ounce values and units for package-label meals', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Ravioli',
        mode: 'total',
        totalCaloriesSource: 'packageLabel',
        manualTotalCalories: null,
        totalCalories: 1303.5384,
        caloriesPerServing: null,
        yourServings: null,
        servings: null,
        cookedWeightGrams: null,
        portionEaten: null,
        portionEatenUnit: 'g',
        rawTotalWeight: 16.155,
        rawTotalWeightUnit: 'oz',
        packageServingWeight: 4.586,
        packageServingWeightUnit: 'oz',
        packageCaloriesPerServing: 370,
      })
    })

    expect(result.current.savedMeals[0].inputs.rawTotalWeightUnit).toBe('oz')
    expect(result.current.savedMeals[0].inputs.rawTotalWeight).toBe(16.155)
  })

  it('saves and reloads total-mode portion-eaten value and unit', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Ravioli',
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 600,
        totalCalories: 600,
        caloriesPerServing: null,
        yourServings: null,
        servings: null,
        cookedWeightGrams: 300,
        portionEaten: 5,
        portionEatenUnit: 'oz',
        rawTotalWeight: null,
        rawTotalWeightUnit: 'g',
        packageServingWeight: null,
        packageServingWeightUnit: 'g',
        packageCaloriesPerServing: null,
      })
    })

    expect(result.current.savedMeals[0].inputs.portionEaten).toBe(5)
    expect(result.current.savedMeals[0].inputs.portionEatenUnit).toBe('oz')
  })

  it('recomputes from inputs when loading a saved meal', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Chicken Bowl',
        mode: 'total',
        totalCaloriesSource: 'manualTotal',
        manualTotalCalories: 500,
        totalCalories: 500,
        caloriesPerServing: null,
        yourServings: null,
        servings: null,
        cookedWeightGrams: 250,
        portionEaten: null,
        portionEatenUnit: 'g',
        rawTotalWeight: null,
        rawTotalWeightUnit: 'g',
        packageServingWeight: null,
        packageServingWeightUnit: 'g',
        packageCaloriesPerServing: null,
      })
    })

    const loaded = result.current.loadMeal(result.current.savedMeals[0].id)
    expect(loaded?.result.totalCalories).toBe(500)
    expect(loaded?.inputs.mealName).toBe('Chicken Bowl')
  })
})
