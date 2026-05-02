import { useState } from 'react'
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
import { StepNavigation } from './stepflow/StepNavigation'
import { UtilityNav, type UtilityKey } from './stepflow/UtilityNav'
import { getStepStates, type StepKey } from './stepflow/stepState'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatCookedWeightValue,
  formatEquivalentPackageServings,
  formatRawPerCookedMultiplier,
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

const STEP_LABELS: Record<StepKey, string> = {
  step1: 'Step 1 · Package',
  step2: 'Step 2 · Cooked batch',
  step3: 'Step 3 · Portion',
}

const STEP_FIELDS: Record<StepKey, string[]> = {
  step1: ['Raw total weight', 'Serving weight', 'Calories / serving'],
  step2: ['Cooked weight'],
  step3: ['Portion eaten'],
}
const NAV_UTILITIES = ['calculator', 'saved'] as const
type NavUtilityKey = (typeof NAV_UTILITIES)[number]

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
  onClearVariableFields: () => void
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
  onClearVariableFields,
}: ZoneLayoutProps) {
  const [activeStep, setActiveStep] = useState<StepKey>('step1')
  const [selectedUtility, setSelectedUtility] =
    useState<NavUtilityKey>('calculator')
  const stepStates = getStepStates({ result, activeStep })
  const activeStepState = stepStates[activeStep]
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
  const rawEquivalentEatenText = formatCookedWeightValue(
    result.rawEquivalentEatenGrams,
    activeOutputUnit,
  )
  const rawPerCookedMultiplierText = formatRawPerCookedMultiplier(
    result.rawPerCookedMultiplier,
  )
  const portionCaloriesText = formatPortionCalories(result.portionCalories)
  const isPrimaryDensityMuted =
    primaryDensityValue === '—' || primaryDensityValue === 'Need cooked weight'
  const handleCookedWeightChange = (value: number | null) => {
    onNumberChange('cookedWeightGrams', toCanonicalCookedWeightGrams(value, cookedInputUnit))
  }
  const activeStepGuidance =
    selectedUtility === 'calculator' && !activeStepState.isComplete
      ? activeStepState.missingPrerequisites.length > 0
        ? activeStepState.missingPrerequisites.map((stepKey) => ({
            key: stepKey,
            label: STEP_LABELS[stepKey],
            fields: STEP_FIELDS[stepKey],
          }))
        : [
            {
              key: activeStep,
              label: STEP_LABELS[activeStep],
              fields: STEP_FIELDS[activeStep],
            },
          ]
      : []
  const handleStepChange = (step: StepKey) => {
    setActiveStep(step)
  }
  const handleUtilityChange = (utility: UtilityKey) => {
    if (utility === 'calculator' || utility === 'saved') {
      setSelectedUtility(utility)
    }
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

      <div
        className="zone-layout__stepflow-shell"
        data-active-step={activeStep}
        data-selected-utility={selectedUtility}
      >
        <aside className="zone-layout__stepflow-rail" data-testid="desktop-stepflow-rail">
          <StepNavigation
            steps={[
              {
                key: 'step1',
                indexLabel: 'Step 1',
                titleLabel: 'Package',
                state: stepStates.step1.state,
              },
              {
                key: 'step2',
                indexLabel: 'Step 2',
                titleLabel: 'Cooked batch',
                state: stepStates.step2.state,
              },
              {
                key: 'step3',
                indexLabel: 'Step 3',
                titleLabel: 'Portion',
                state: stepStates.step3.state,
              },
            ]}
            activeStep={activeStep}
            onStepChange={handleStepChange}
          />
          <UtilityNav
            selectedUtility={selectedUtility}
            onUtilityChange={handleUtilityChange}
            utilities={[...NAV_UTILITIES]}
            layout="rail"
          />
        </aside>

        <main className="zone-layout__stepflow-main">
          <div
            className="zone-layout__mobile-step-pills-hook"
            data-mobile-structure="step-pills"
            data-active-step={activeStep}
            data-testid="mobile-step-pills"
          >
            <div className="zone-layout__mobile-step-pills" role="group" aria-label="Step pills">
              {(['step1', 'step2', 'step3'] as const).map((stepKey) => (
                <button
                  key={stepKey}
                  type="button"
                  className="zone-layout__mobile-step-pill"
                  data-state={stepStates[stepKey].state}
                  aria-pressed={activeStep === stepKey}
                  onClick={() => handleStepChange(stepKey)}
                >
                  {stepKey === 'step1'
                    ? 'Step 1 · Package'
                    : stepKey === 'step2'
                      ? 'Step 2 · Cooked batch'
                      : 'Step 3 · Portion'}
                </button>
              ))}
            </div>
          </div>

          {selectedUtility === 'calculator' ? (
            <section className="zone-layout__calculator-surface" data-testid="calculator-surface">
              {activeStepGuidance.length > 0 ? (
                <section className="step-guidance" data-testid="active-step-guidance">
                  <p className="step-guidance__title">
                    {STEP_LABELS[activeStep]} is incomplete.
                  </p>
                  {activeStepGuidance.map((guidance) => (
                    <p key={guidance.key} className="step-guidance__detail">
                      Missing data from {guidance.label}: {guidance.fields.join(', ')}.
                    </p>
                  ))}
                </section>
              ) : null}

              <div className="zone-layout__step-panels">
                {activeStep === 'step1' ? (
                  <section
                    className="zone-layout__step-panel"
                    data-step-key="step1"
                    data-step-active
                  >
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
                  </section>
                ) : null}

                {activeStep === 'step2' ? (
                  <section
                    className="zone-layout__step-panel"
                    data-step-key="step2"
                    data-step-active
                  >
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
                      rawPerCookedMultiplierText={rawPerCookedMultiplierText}
                      weightChangeCopy={weightChangeCopy}
                      hasWeightChange={hasWeightChange}
                      onCookedInputUnitChange={onCookedInputUnitChange}
                      onCookedWeightChange={handleCookedWeightChange}
                    />
                  </section>
                ) : null}

                {activeStep === 'step3' ? (
                  <section
                    className="zone-layout__step-panel"
                    data-step-key="step3"
                    data-step-active
                  >
                    <Zone3PortionSection
                      form={form}
                      targetCalories={targetCalories}
                      activeOutputUnit={activeOutputUnit}
                      referenceServingText={referenceServingText}
                      targetPortionText={targetPortionText}
                      servingsEatenText={servingsEatenText}
                      rawEquivalentEatenText={rawEquivalentEatenText}
                      portionCaloriesText={portionCaloriesText}
                      onUnitChange={onUnitChange}
                      onCookedOutputUnitChange={onCookedOutputUnitChange}
                      onNumberChange={onNumberChange}
                      onTargetCaloriesChange={onTargetCaloriesChange}
                    />
                  </section>
                ) : null}
              </div>

              <footer className="action-row zone-layout__actions">
                <button type="button" onClick={onSave}>
                  Save meal
                </button>
                <button type="button" onClick={onClearVariableFields}>
                  Clear variable fields
                </button>
                <button type="button" onClick={onClear}>
                  Clear
                </button>
              </footer>
            </section>
          ) : (
            <SavedMealsList
              meals={savedMeals}
              onLoad={onLoadMeal}
              onDelete={onDeleteMeal}
              surface="utility"
            />
          )}
          <div
            className="zone-layout__mobile-utility-bar-hook"
            data-mobile-structure="utility-bar"
            data-selected-utility={selectedUtility}
            data-testid="mobile-utility-bar"
          >
            <UtilityNav
              selectedUtility={selectedUtility}
              onUtilityChange={handleUtilityChange}
              utilities={[...NAV_UTILITIES]}
              layout="bottom-bar"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
