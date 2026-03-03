import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSavedMeals } from './useSavedMeals'

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
      'meal-calorie-calculator.saved-meals',
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
    expect(
      JSON.parse(storage.getItem('meal-calorie-calculator.saved-meals') ?? '[]'),
    ).toHaveLength(1)
    expect(
      JSON.parse(storage.getItem('meal-calorie-calculator.saved-meals') ?? '[]')[0]
        .cachedResult.caloriesPerServing,
    ).toBeNull()
  })

  it('saves a meal with cached computed results', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Chicken Bowl',
        mode: 'total',
        totalCalories: 500,
        caloriesPerServing: null,
        servings: null,
        cookedWeightGrams: 250,
      })
    })

    expect(result.current.savedMeals).toHaveLength(1)
    expect(result.current.savedMeals[0].cachedResult.totalCalories).toBe(500)
  })

  it('recomputes from inputs when loading a saved meal', () => {
    const { result } = renderHook(() => useSavedMeals())

    act(() => {
      result.current.saveMeal({
        mealName: 'Chicken Bowl',
        mode: 'total',
        totalCalories: 500,
        caloriesPerServing: null,
        servings: null,
        cookedWeightGrams: 250,
      })
    })

    const loaded = result.current.loadMeal(result.current.savedMeals[0].id)
    expect(loaded?.result.totalCalories).toBe(500)
    expect(loaded?.inputs.mealName).toBe('Chicken Bowl')
  })
})
