import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'
import {
  formatCaloriesPerServing,
  formatRawPackageServings,
  formatTotalCalories,
} from '../utils/format'

export type ZoneLayoutProps = {
  form: MealInputs
  result: CalculationResult
  hasConflictingCalories: boolean
  targetCalories: number | null
  cookedOutputUnit: WeightUnit
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
  onCookedOutputUnitChange: (value: WeightUnit) => void
  onSave: () => void
  onClear: () => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

function DerivedValue({
  value,
  testId,
}: {
  value: string
  testId: string
}) {
  const isEmpty = value === '—'

  return (
    <span
      className={`derived__value${isEmpty ? ' derived__value--empty' : ''}`}
      data-testid={testId}
    >
      {value}
    </span>
  )
}

export function ZoneLayout({
  form,
  result,
  onNumberChange,
  onUnitChange,
}: ZoneLayoutProps) {
  const totalCaloriesText = formatTotalCalories(
    result.totalCalories,
    result.totalCaloriesDisplaySource,
  )
  const rawServingsText = formatRawPackageServings(result.rawPackageServings)
  const caloriesPerServingText = formatCaloriesPerServing(
    form.packageCaloriesPerServing,
  )

  return (
    <div className="zone-layout">
      <section className="zone zone--package" data-testid="zone-package">
        <p className="zone__eyebrow">Zone 1 · Before cooking</p>
        <h2 className="zone__title">Package</h2>

        <div className="field-pair">
          <div className="field">
            <label className="field__label" htmlFor="package-serving-weight">
              Serving weight
            </label>
            <div className="field-with-unit">
              <input
                id="package-serving-weight"
                aria-label="Serving weight"
                className="field__input"
                type="number"
                value={toInputValue(form.packageServingWeight)}
                onChange={(event) =>
                  onNumberChange(
                    'packageServingWeight',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
              <div className="unit-toggle" role="group" aria-label="Serving weight unit">
                <button
                  type="button"
                  className={`unit-toggle__btn${form.packageServingWeightUnit === 'g' ? ' unit-toggle__btn--active' : ''}`}
                  onClick={() => onUnitChange('packageServingWeightUnit', 'g')}
                >
                  g
                </button>
                <button
                  type="button"
                  className={`unit-toggle__btn${form.packageServingWeightUnit === 'oz' ? ' unit-toggle__btn--active' : ''}`}
                  onClick={() => onUnitChange('packageServingWeightUnit', 'oz')}
                >
                  oz
                </button>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="package-cal-serving">
              Calories / serving
            </label>
            <input
              id="package-cal-serving"
              aria-label="Calories / serving"
              className="field__input"
              type="number"
              value={toInputValue(form.packageCaloriesPerServing)}
              onChange={(event) =>
                onNumberChange(
                  'packageCaloriesPerServing',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="raw-total-weight">
            Raw total weight
          </label>
          <div className="field-with-unit">
            <input
              id="raw-total-weight"
              aria-label="Raw total weight"
              className="field__input"
              type="number"
              value={toInputValue(form.rawTotalWeight)}
              onChange={(event) =>
                onNumberChange(
                  'rawTotalWeight',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
            <div className="unit-toggle" role="group" aria-label="Raw total weight unit">
              <button
                type="button"
                className={`unit-toggle__btn${form.rawTotalWeightUnit === 'g' ? ' unit-toggle__btn--active' : ''}`}
                onClick={() => onUnitChange('rawTotalWeightUnit', 'g')}
              >
                g
              </button>
              <button
                type="button"
                className={`unit-toggle__btn${form.rawTotalWeightUnit === 'oz' ? ' unit-toggle__btn--active' : ''}`}
                onClick={() => onUnitChange('rawTotalWeightUnit', 'oz')}
              >
                oz
              </button>
            </div>
          </div>
        </div>

        <div className="derived">
          <div className="derived__item">
            <span className="derived__label">Total cal</span>
            <DerivedValue value={totalCaloriesText} testId="derived-total-cal" />
          </div>
          <div className="derived__item">
            <span className="derived__label">Raw servings</span>
            <DerivedValue value={rawServingsText} testId="derived-raw-servings" />
          </div>
          <div className="derived__item">
            <span className="derived__label">Cal / serving</span>
            <DerivedValue
              value={caloriesPerServingText}
              testId="derived-cal-serving"
            />
          </div>
        </div>
      </section>

      <section className="zone zone--cooked" data-testid="zone-cooked">
        <p className="zone__eyebrow">Zone 2 · After cooking</p>
        <h2 className="zone__title">Cooked batch</h2>
      </section>

      <section className="zone zone--portion" data-testid="zone-portion">
        <p className="zone__eyebrow">Zone 3 · At the plate</p>
        <h2 className="zone__title">Portion guide</h2>
      </section>
    </div>
  )
}
