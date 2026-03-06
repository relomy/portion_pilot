import { gramsToOunces } from './calculator'

const UNAVAILABLE = '—'

function formatFixedRange(value: number, min: number, max: number): string {
  if (max === 0) {
    return value.toFixed(0)
  }

  const rounded = value.toFixed(max)
  const [whole, fractional = ''] = rounded.split('.')
  let trimmed = fractional

  while (trimmed.length > min && trimmed.endsWith('0')) {
    trimmed = trimmed.slice(0, -1)
  }

  return trimmed.length > 0 ? `${whole}.${trimmed}` : whole
}

export function formatTotalCalories(
  value: number | null,
  displaySource: 'manualTotal' | 'packageLabel' | 'perServing' | null = 'manualTotal',
): string {
  if (value === null) {
    return UNAVAILABLE
  }

  return displaySource === 'packageLabel'
    ? formatFixedRange(value, 0, 1)
    : value.toFixed(0)
}

export function formatCaloriesPerServing(value: number | null): string {
  return value === null ? UNAVAILABLE : formatFixedRange(value, 0, 1)
}

export function formatCaloriesPerGram(value: number | null): string {
  return value === null ? 'Need cooked weight' : formatFixedRange(value, 2, 3)
}

export function formatCaloriesPerOunce(value: number | null): string {
  return value === null ? 'Need cooked weight' : formatFixedRange(value, 1, 2)
}

export function formatCaloriesPer100Grams(value: number | null): string {
  return value === null ? 'Need cooked weight' : formatFixedRange(value, 0, 1)
}

export function formatRawPackageServings(value: number | null): string {
  return value === null ? UNAVAILABLE : formatFixedRange(value, 2, 3)
}

export function formatPortionCalories(value: number | null): string {
  return value === null ? UNAVAILABLE : value.toFixed(0)
}

export function formatCookedWeightValue(
  grams: number | null,
  unit: 'g' | 'oz',
): string {
  if (grams === null) {
    return UNAVAILABLE
  }

  return unit === 'oz'
    ? `${formatFixedRange(gramsToOunces(grams), 0, 1)} oz`
    : `${formatFixedRange(grams, 0, 1)} g`
}

export function formatEquivalentPackageServings(value: number | null): string {
  return value === null ? UNAVAILABLE : formatFixedRange(value, 0, 2)
}

export function formatWeightChange(
  weightChangeGrams: number | null,
  weightChangePercent: number | null,
  unit: 'g' | 'oz',
): string {
  if (weightChangeGrams === null || weightChangePercent === null) {
    return UNAVAILABLE
  }

  const convertedWeight =
    unit === 'oz' ? gramsToOunces(weightChangeGrams) : weightChangeGrams
  const weightText = formatFixedRange(Math.abs(convertedWeight), 0, 1)
  const percentText = formatFixedRange(Math.abs(weightChangePercent), 0, 1)
  const sign = weightChangeGrams > 0 ? '+' : weightChangeGrams < 0 ? '-' : ''

  return `${sign}${weightText} ${unit} (${sign}${percentText}%)`
}

export function getWeightChangeCopy(
  direction: 'gain' | 'loss' | 'none' | null,
): string {
  if (direction === 'gain') {
    return 'Gained during cooking'
  }

  if (direction === 'loss') {
    return 'Lost during cooking'
  }

  if (direction === 'none') {
    return 'No weight change during cooking'
  }

  return UNAVAILABLE
}
