import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../../hooks/useSavedMeals'
import type { CalculationResult } from '../../utils/calculator'
import { DerivedMetricRow } from './DerivedMetricRow'
import { UnitToggle } from './UnitToggle'

type Zone1PackageSectionProps = {
  form: MealInputs
  result: CalculationResult
  totalCaloriesText: string
  rawServingsText: string
  caloriesPerServingText: string
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
}

function toInputValue(value: number | null) {
  return value ?? ''
}

export function Zone1PackageSection({
  form,
  result,
  totalCaloriesText,
  rawServingsText,
  caloriesPerServingText,
  onTextChange,
  onNumberChange,
  onUnitChange,
  onModeChange,
  onTotalSourceChange,
}: Zone1PackageSectionProps) {
  return (
    <section className="zone zone--package" data-testid="zone-package">
      <p className="zone__eyebrow">Zone 1 · Before cooking</p>
      <h2 className="zone__title">Package</h2>

      <div className="field">
        <label className="field__label" htmlFor="meal-name">
          Meal name
        </label>
        <input
          id="meal-name"
          aria-label="Meal name"
          className="field__input"
          type="text"
          value={form.mealName}
          onChange={(event) => onTextChange('mealName', event.target.value)}
        />
      </div>

      <fieldset className="mode-group" aria-label="Calorie mode">
        <legend className="mode-group__label">Calorie mode</legend>
        <label className="mode-group__option">
          <input
            type="radio"
            name="calorie-mode"
            checked={form.mode === 'total'}
            onChange={() => onModeChange('total')}
          />
          Total calories
        </label>
        <label className="mode-group__option">
          <input
            type="radio"
            name="calorie-mode"
            checked={form.mode === 'perServing'}
            onChange={() => onModeChange('perServing')}
          />
          Per serving
        </label>
      </fieldset>

      {form.mode === 'total' ? (
        <fieldset className="mode-group" aria-label="Total source">
          <legend className="mode-group__label">Total source</legend>
          <label className="mode-group__option">
            <input
              type="radio"
              name="total-source"
              checked={form.totalCaloriesSource === 'packageLabel'}
              onChange={() => onTotalSourceChange('packageLabel')}
            />
            Package label
          </label>
          <label className="mode-group__option">
            <input
              type="radio"
              name="total-source"
              checked={form.totalCaloriesSource === 'manualTotal'}
              onChange={() => onTotalSourceChange('manualTotal')}
            />
            Manual total
          </label>
        </fieldset>
      ) : null}

      {form.mode === 'total' && form.totalCaloriesSource === 'packageLabel' ? (
        <>
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

          <div className="field">
            <div className="field__label-row">
              <label className="field__label" htmlFor="package-serving-weight">
                Serving weight
              </label>
              <UnitToggle
                name="serving-weight-unit"
                ariaLabel="Serving weight unit"
                value={form.packageServingWeightUnit}
                onChange={(value) => onUnitChange('packageServingWeightUnit', value)}
              />
            </div>
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
          </div>

          <div className="field">
            <div className="field__label-row">
              <label className="field__label" htmlFor="raw-total-weight">
                Raw total weight
              </label>
              <UnitToggle
                name="raw-total-weight-unit"
                ariaLabel="Raw total weight unit"
                value={form.rawTotalWeightUnit}
                onChange={(value) => onUnitChange('rawTotalWeightUnit', value)}
              />
            </div>
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
          </div>
        </>
      ) : null}

      {form.mode === 'total' && form.totalCaloriesSource === 'manualTotal' ? (
        <div className="field">
          <label className="field__label" htmlFor="manual-total-calories">
            Total calories
          </label>
          <input
            id="manual-total-calories"
            aria-label="Total calories"
            className="field__input"
            type="number"
            value={toInputValue(form.manualTotalCalories)}
            onChange={(event) =>
              onNumberChange(
                'manualTotalCalories',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </div>
      ) : null}

      {form.mode === 'perServing' ? (
        <>
          <div className="field-pair">
            <div className="field">
              <label className="field__label" htmlFor="calories-per-serving">
                Calories per serving
              </label>
              <input
                id="calories-per-serving"
                aria-label="Calories per serving"
                className="field__input"
                type="number"
                value={toInputValue(form.caloriesPerServing)}
                onChange={(event) =>
                  onNumberChange(
                    'caloriesPerServing',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="servings-optional">
                Servings (optional)
              </label>
              <input
                id="servings-optional"
                aria-label="Servings (optional)"
                className="field__input"
                type="number"
                value={toInputValue(form.yourServings)}
                onChange={(event) =>
                  onNumberChange(
                    'yourServings',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </div>
          </div>
          {result.assumptions.servings_assumed ? (
            <p className="assumption-note">Assumed 1 serving because none was provided.</p>
          ) : null}
        </>
      ) : null}

      <div className="derived">
        <DerivedMetricRow
          label="Total cal"
          value={totalCaloriesText}
          testId="derived-total-cal"
        />
        <DerivedMetricRow
          label="Raw servings"
          value={rawServingsText}
          testId="derived-raw-servings"
        />
        <DerivedMetricRow
          label="Cal / serving"
          value={caloriesPerServingText}
          testId="derived-cal-serving"
        />
      </div>
    </section>
  )
}
