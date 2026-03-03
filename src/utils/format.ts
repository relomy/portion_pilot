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

export function formatTotalCalories(value: number | null): string {
  return value === null ? '0' : value.toFixed(0)
}

export function formatCaloriesPerServing(value: number | null): string {
  return value === null ? '0' : formatFixedRange(value, 0, 1)
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
