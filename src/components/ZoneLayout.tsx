import type {
  MealInputs,
  MealMode,
  SavedMeal,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'
import { type CalculationResult } from '../utils/calculator'
import { DevPanel } from './DevPanel'
import { SavedMealsList } from './SavedMealsList'
import {
  toCanonicalCookedWeightGrams,
  toCookedInputDisplayValue,
} from './zones/cookedWeightInputMapping'
import { Zone1PackageSection } from './zones/Zone1PackageSection'
import { Zone2CookedSection } from './zones/Zone2CookedSection'
import { Zone3PortionSection } from './zones/Zone3PortionSection'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatCookedWeightValue,
  formatEquivalentPackageServings,
  formatPortionCalories,
  formatWeightChange,
  getWeightChangeCopy,
  formatRawPackageServings,
  formatTotalCalories,
} from '../utils/format'

const sourceLabels = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

export type ZoneLayoutProps = {
  form: MealInputs
  result: CalculationResult
  hasConflictingCalories: boolean
  targetCalories: number | null
  cookedInputUnit: WeightUnit
  cookedOutputUnit: WeightUnit
  savedMeals: SavedMeal[]
  onTextChange: (field: 'mealName', value: string) => void
  onNumberChange: (
    field:
      | 'manualTotalCalories'
      | 'caloriesPerServing'
      | 'yourServings'
      | 'cookedWeightGrams'
      | 'portionEaten'
      | 'rawTotalWeight'
      | 'packageServingWeight'
      | 'packageCaloriesPerServing',
    value: number | null,
  ) => void
  onUnitChange: (
    field:
      | 'rawTotalWeightUnit'
      | 'packageServingWeightUnit'
      | 'portionEatenUnit',
    value: WeightUnit,
  ) => void
  onModeChange: (mode: MealMode) => void
  onTotalSourceChange: (value: TotalCaloriesSource) => void
  onTargetCaloriesChange: (value: number | null) => void
  onCookedInputUnitChange: (value: WeightUnit) => void
  onCookedOutputUnitChange: (value: WeightUnit) => void
  onLoadMeal: (id: string) => void
  onDeleteMeal: (id: string) => void
  onSave: () => void
  onClear: () => void
}

export function ZoneLayout({
  form,
  result,
  hasConflictingCalories,
  targetCalories,
  cookedInputUnit,
  cookedOutputUnit,
  savedMeals,
  onTextChange,
  onNumberChange,
  onModeChange,
  onTotalSourceChange,
  onTargetCaloriesChange,
  onCookedInputUnitChange,
  onCookedOutputUnitChange,
  onLoadMeal,
  onDeleteMeal,
  onUnitChange,
  onSave,
  onClear,
}: ZoneLayoutProps) {
  const totalCaloriesText = formatTotalCalories(
    result.totalCalories,
    result.totalCaloriesDisplaySource,
  )
  const rawServingsText = formatRawPackageServings(result.rawPackageServings)
  const caloriesPerServingText = formatCaloriesPerServing(
    form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
      ? form.packageCaloriesPerServing
      : result.caloriesPerServing,
  )
  const sourceLabel = sourceLabels[result.calorie_source_used]
  const activeOutputUnit = cookedOutputUnit
  const cookedInputValue = toCookedInputDisplayValue(
    form.cookedWeightGrams,
    cookedInputUnit,
  )
  const primaryDensityLabel =
    activeOutputUnit === 'oz' ? 'Calories per ounce' : 'Calories per gram'
  const primaryDensityValue =
    activeOutputUnit === 'oz'
      ? formatCaloriesPerOunce(result.caloriesPerOunce)
      : formatCaloriesPerGram(result.caloriesPerGram)
  const secondaryDensityValue =
    activeOutputUnit === 'oz'
      ? formatCaloriesPerGram(result.caloriesPerGram)
      : formatCaloriesPerOunce(result.caloriesPerOunce)
  const secondaryDensityLabel =
    activeOutputUnit === 'oz' ? 'Calories per gram' : 'Calories per ounce'
  const caloriesPer100GramsValue = formatCaloriesPer100Grams(
    result.caloriesPer100Grams,
  )
  const weightChangeText = formatWeightChange(
    result.weightChangeGrams,
    result.weightChangePercent,
    activeOutputUnit,
  )
  const weightChangeCopy = getWeightChangeCopy(result.weightChangeDirection)
  const hasWeightChange = weightChangeText !== '—'
  const targetPortionGrams =
    targetCalories !== null && result.caloriesPerGram !== null
      ? targetCalories / result.caloriesPerGram
      : null
  const referenceServingText = formatCookedWeightValue(
    result.cookedWeightPerPackageServingGrams,
    activeOutputUnit,
  )
  const targetPortionText = formatCookedWeightValue(
    targetPortionGrams,
    activeOutputUnit,
  )
  const servingsEatenText = formatEquivalentPackageServings(
    result.equivalentPackageServingsEaten,
  )
  const portionCaloriesText = formatPortionCalories(result.portionCalories)
  const isPrimaryDensityMuted =
    primaryDensityValue === '—' || primaryDensityValue === 'Need cooked weight'
  const handleCookedWeightChange = (value: number | null) => {
    onNumberChange('cookedWeightGrams', toCanonicalCookedWeightGrams(value, cookedInputUnit))
  }

  return (
    <div className="zone-layout" data-testid="zone-layout-root">
      <header className="masthead">
        <p className="masthead__kicker">Meal calorie calculator</p>
        <h1 className="masthead__title">Cook once, keep the numbers straight.</h1>
        <p className="masthead__sub">
          A kitchen worksheet for home cooks who still want disciplined calorie
          math.
        </p>
      </header>

      <div className="zone-layout__diagnostics">
        <p>{sourceLabel}</p>
        <DevPanel
          hasConflictingCalories={hasConflictingCalories}
          form={form}
          result={result}
        />
      </div>

      <Zone1PackageSection
        form={form}
        result={result}
        totalCaloriesText={totalCaloriesText}
        rawServingsText={rawServingsText}
        caloriesPerServingText={caloriesPerServingText}
        onTextChange={onTextChange}
        onNumberChange={onNumberChange}
        onUnitChange={onUnitChange}
        onModeChange={onModeChange}
        onTotalSourceChange={onTotalSourceChange}
      />

      <Zone2CookedSection
        cookedInputUnit={cookedInputUnit}
        cookedInputValue={cookedInputValue}
        primaryDensityLabel={primaryDensityLabel}
        primaryDensityValue={primaryDensityValue}
        secondaryDensityLabel={secondaryDensityLabel}
        secondaryDensityValue={secondaryDensityValue}
        caloriesPer100GramsValue={caloriesPer100GramsValue}
        isPrimaryDensityMuted={isPrimaryDensityMuted}
        weightChangeText={weightChangeText}
        weightChangeCopy={weightChangeCopy}
        hasWeightChange={hasWeightChange}
        onCookedInputUnitChange={onCookedInputUnitChange}
        onCookedWeightChange={handleCookedWeightChange}
      />

      <Zone3PortionSection
        form={form}
        targetCalories={targetCalories}
        activeOutputUnit={activeOutputUnit}
        referenceServingText={referenceServingText}
        targetPortionText={targetPortionText}
        servingsEatenText={servingsEatenText}
        portionCaloriesText={portionCaloriesText}
        onUnitChange={onUnitChange}
        onCookedOutputUnitChange={onCookedOutputUnitChange}
        onNumberChange={onNumberChange}
        onTargetCaloriesChange={onTargetCaloriesChange}
      />

      <SavedMealsList
        meals={savedMeals}
        onLoad={onLoadMeal}
        onDelete={onDeleteMeal}
      />

      <footer className="action-row zone-layout__actions">
        <button type="button" onClick={onSave}>
          Save meal
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </footer>
    </div>
  )
}
