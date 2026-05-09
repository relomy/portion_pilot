import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'
import { getStorageAdapter, resetStorageAdapterForTests } from './storageAdapter'

export const ACTIVE_DRAFT_STORAGE_KEY = 'meal-calorie-calculator.active-draft'

export type AppDraft = {
  form: MealInputs
  targetCalories: number | null
  cookedInputUnit: WeightUnit
  cookedOutputUnit: WeightUnit
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWeightUnit(value: unknown): value is WeightUnit {
  return value === 'g' || value === 'oz'
}

function isMealMode(value: unknown): value is MealMode {
  return value === 'total' || value === 'perServing'
}

function isTotalCaloriesSource(value: unknown): value is TotalCaloriesSource {
  return value === 'manualTotal' || value === 'packageLabel'
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeDraftForm(value: unknown, defaults: MealInputs): MealInputs {
  if (!isRecord(value)) {
    return defaults
  }

  const yourServings = asNumberOrNull(value.yourServings ?? value.servings)
  const manualTotalCalories = asNumberOrNull(
    value.manualTotalCalories ?? value.totalCalories,
  )

  return {
    mealName: typeof value.mealName === 'string' ? value.mealName : defaults.mealName,
    mode: isMealMode(value.mode) ? value.mode : defaults.mode,
    totalCaloriesSource: isTotalCaloriesSource(value.totalCaloriesSource)
      ? value.totalCaloriesSource
      : defaults.totalCaloriesSource,
    manualTotalCalories,
    totalCalories: manualTotalCalories,
    caloriesPerServing: asNumberOrNull(value.caloriesPerServing),
    yourServings,
    servings: yourServings,
    cookedWeightGrams: asNumberOrNull(value.cookedWeightGrams),
    portionEaten: asNumberOrNull(value.portionEaten),
    portionEatenUnit: isWeightUnit(value.portionEatenUnit)
      ? value.portionEatenUnit
      : defaults.portionEatenUnit,
    rawTotalWeight: asNumberOrNull(value.rawTotalWeight),
    rawTotalWeightUnit: isWeightUnit(value.rawTotalWeightUnit)
      ? value.rawTotalWeightUnit
      : defaults.rawTotalWeightUnit,
    packageServingWeight: asNumberOrNull(value.packageServingWeight),
    packageServingWeightUnit: isWeightUnit(value.packageServingWeightUnit)
      ? value.packageServingWeightUnit
      : defaults.packageServingWeightUnit,
    packageCaloriesPerServing: asNumberOrNull(value.packageCaloriesPerServing),
  }
}

export function createDefaultDraft(defaultForm: MealInputs): AppDraft {
  return {
    form: defaultForm,
    targetCalories: null,
    cookedInputUnit: 'g',
    cookedOutputUnit: 'g',
  }
}

export function loadDraft(defaultForm: MealInputs): AppDraft {
  const storage = getStorageAdapter()
  const defaults = createDefaultDraft(defaultForm)

  try {
    const parsed = JSON.parse(storage.getItem(ACTIVE_DRAFT_STORAGE_KEY) ?? 'null')

    if (!isRecord(parsed)) {
      return defaults
    }

    return {
      form: normalizeDraftForm(parsed.form, defaultForm),
      targetCalories: asNumberOrNull(parsed.targetCalories),
      cookedInputUnit: isWeightUnit(parsed.cookedInputUnit)
        ? parsed.cookedInputUnit
        : defaults.cookedInputUnit,
      cookedOutputUnit: isWeightUnit(parsed.cookedOutputUnit)
        ? parsed.cookedOutputUnit
        : defaults.cookedOutputUnit,
    }
  } catch {
    return defaults
  }
}

export function persistDraft(draft: AppDraft) {
  getStorageAdapter().setItem(ACTIVE_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function resetActiveDraftStorageForTests() {
  resetStorageAdapterForTests()
}
