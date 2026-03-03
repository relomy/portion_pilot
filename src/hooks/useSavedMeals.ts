import { useEffect, useState } from 'react'
import {
  type CalculationResult,
  calculateMealMetrics,
} from '../utils/calculator'

export type MealMode = 'total' | 'perServing'

export type MealInputs = {
  mealName: string
  mode: MealMode
  totalCalories: number | null
  caloriesPerServing: number | null
  servings: number | null
  cookedWeightGrams: number | null
}

export type SavedMeal = {
  id: string
  createdAt: string
  inputs: MealInputs
  cachedResult: CalculationResult
}

export const STORAGE_KEY = 'meal-calorie-calculator.saved-meals'

function getStorage() {
  if (
    typeof localStorage === 'undefined' ||
    typeof localStorage.getItem !== 'function' ||
    typeof localStorage.setItem !== 'function'
  ) {
    return null
  }

  return localStorage
}

function parseSavedMeals(rawValue: string | null): SavedMeal[] {
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? (parsed as SavedMeal[]) : []
  } catch {
    return []
  }
}

function calculateFromInputs(inputs: MealInputs): CalculationResult {
  return calculateMealMetrics({
    totalCalories: inputs.mode === 'total' ? inputs.totalCalories : null,
    cookedWeightGrams: inputs.cookedWeightGrams,
    servings: inputs.servings,
    caloriesPerServing:
      inputs.mode === 'perServing' ? inputs.caloriesPerServing : null,
  })
}

export function useSavedMeals() {
  const storage = getStorage()
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() =>
    parseSavedMeals(storage?.getItem(STORAGE_KEY) ?? null),
  )

  useEffect(() => {
    storage?.setItem(STORAGE_KEY, JSON.stringify(savedMeals))
  }, [savedMeals, storage])

  function saveMeal(inputs: MealInputs) {
    const nextMeal: SavedMeal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      inputs,
      cachedResult: calculateFromInputs(inputs),
    }

    setSavedMeals((current) => [nextMeal, ...current])
  }

  function deleteMeal(id: string) {
    setSavedMeals((current) => current.filter((meal) => meal.id !== id))
  }

  function loadMeal(id: string) {
    const match = savedMeals.find((meal) => meal.id === id)

    if (!match) {
      return null
    }

    return {
      inputs: match.inputs,
      result: calculateFromInputs(match.inputs),
    }
  }

  return {
    savedMeals,
    saveMeal,
    deleteMeal,
    loadMeal,
  }
}
