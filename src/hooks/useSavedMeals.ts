import { useEffect, useState } from 'react'
import {
  type CalculationResult,
  calculateMealMetrics,
  ouncesToGrams,
} from '../utils/calculator'

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

type PersistedMealInputs = Partial<MealInputs> & {
  servings?: number | null
}

function toGrams(value: number | null, unit: WeightUnit): number | null {
  if (value === null) {
    return null
  }

  return unit === 'oz' ? ouncesToGrams(value) : value
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
    rawTotalWeight: inputs.rawTotalWeight ?? null,
    rawTotalWeightUnit: inputs.rawTotalWeightUnit ?? 'g',
    packageServingWeight: inputs.packageServingWeight ?? null,
    packageServingWeightUnit: inputs.packageServingWeightUnit ?? 'g',
    packageCaloriesPerServing: inputs.packageCaloriesPerServing ?? null,
  }
}

function calculateFromInputs(inputs: MealInputs): CalculationResult {
  return calculateMealMetrics({
    mode: inputs.mode,
    totalCaloriesSource: inputs.totalCaloriesSource,
    manualTotalCalories:
      inputs.mode === 'total' ? inputs.manualTotalCalories : null,
    totalCalories: inputs.mode === 'total' ? inputs.totalCalories : null,
    cookedWeightGrams: inputs.cookedWeightGrams,
    portionEatenGrams: null,
    yourServings: inputs.yourServings ?? inputs.servings,
    caloriesPerServing:
      inputs.mode === 'perServing' ? inputs.caloriesPerServing : null,
    rawTotalWeightGrams: toGrams(
      inputs.rawTotalWeight,
      inputs.rawTotalWeightUnit,
    ),
    packageServingWeightGrams: toGrams(
      inputs.packageServingWeight,
      inputs.packageServingWeightUnit,
    ),
    packageCaloriesPerServing: inputs.packageCaloriesPerServing,
  })
}

function normalizeSavedMeals(meals: SavedMeal[]): SavedMeal[] {
  return meals.map((meal) => ({
    ...meal,
    inputs: normalizeInputs(meal.inputs),
    cachedResult: calculateFromInputs(normalizeInputs(meal.inputs)),
  }))
}

export function useSavedMeals() {
  const storage = getStorage()
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() =>
    normalizeSavedMeals(parseSavedMeals(storage?.getItem(STORAGE_KEY) ?? null)),
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
