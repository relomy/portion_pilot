import { useEffect, useState } from 'react'
import { type CalculationResult } from '../utils/calculator'
import { calculateFromForm } from '../utils/mealMetrics'
import { getStorageAdapter } from '../utils/storageAdapter'

export type MealMode = 'total' | 'perServing'
export type TotalCaloriesSource = 'manualTotal' | 'packageLabel'
export type WeightUnit = 'g' | 'oz'

export type MealInputs = {
  mealName: string
  mode: MealMode
  totalCaloriesSource: TotalCaloriesSource
  manualTotalCalories: number | null
  totalCalories: number | null
  caloriesPerServing: number | null
  yourServings: number | null
  servings: number | null
  cookedWeightGrams: number | null
  portionEaten: number | null
  portionEatenUnit: WeightUnit
  rawTotalWeight: number | null
  rawTotalWeightUnit: WeightUnit
  packageServingWeight: number | null
  packageServingWeightUnit: WeightUnit
  packageCaloriesPerServing: number | null
}

export type SavedMeal = {
  id: string
  createdAt: string
  inputs: MealInputs
  cachedResult: CalculationResult
}

export const STORAGE_KEY = 'meal-calorie-calculator.saved-meals'

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

type PersistedMealInputs = Partial<MealInputs> & {
  servings?: number | null
}

function normalizeInputs(inputs: PersistedMealInputs): MealInputs {
  const normalizedServings = inputs.yourServings ?? inputs.servings ?? null
  const manualTotalCalories =
    inputs.manualTotalCalories ?? inputs.totalCalories ?? null

  return {
    mealName: inputs.mealName ?? '',
    mode: inputs.mode ?? 'total',
    totalCaloriesSource: inputs.totalCaloriesSource ?? 'manualTotal',
    manualTotalCalories,
    totalCalories: inputs.totalCalories ?? manualTotalCalories,
    caloriesPerServing: inputs.caloriesPerServing ?? null,
    yourServings: normalizedServings,
    servings: normalizedServings,
    cookedWeightGrams: inputs.cookedWeightGrams ?? null,
    portionEaten: inputs.portionEaten ?? null,
    portionEatenUnit: inputs.portionEatenUnit ?? 'g',
    rawTotalWeight: inputs.rawTotalWeight ?? null,
    rawTotalWeightUnit: inputs.rawTotalWeightUnit ?? 'g',
    packageServingWeight: inputs.packageServingWeight ?? null,
    packageServingWeightUnit: inputs.packageServingWeightUnit ?? 'g',
    packageCaloriesPerServing: inputs.packageCaloriesPerServing ?? null,
  }
}

function normalizeSavedMeals(meals: SavedMeal[]): SavedMeal[] {
  return meals.map((meal) => ({
    ...meal,
    inputs: normalizeInputs(meal.inputs),
    cachedResult: calculateFromForm(normalizeInputs(meal.inputs)),
  }))
}

export function useSavedMeals() {
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() =>
    normalizeSavedMeals(parseSavedMeals(getStorageAdapter().getItem(STORAGE_KEY))),
  )

  useEffect(() => {
    getStorageAdapter().setItem(STORAGE_KEY, JSON.stringify(savedMeals))
  }, [savedMeals])

  function saveMeal(inputs: MealInputs) {
    const nextMeal: SavedMeal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      inputs,
      cachedResult: calculateFromForm(inputs),
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
      result: calculateFromForm(match.inputs),
    }
  }

  return {
    savedMeals,
    saveMeal,
    deleteMeal,
    loadMeal,
  }
}
