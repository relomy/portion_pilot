import type { MealInputs, WeightUnit } from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'
import { DevPanel } from './DevPanel'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatPortionCalories,
  formatRawPackageServings,
  formatTotalCalories,
} from '../utils/format'

const sourceLabels = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

type ResultsPanelProps = {
  result: CalculationResult
  hasConflictingCalories: boolean
  form: MealInputs
  portionEaten?: number | null
  portionEatenUnit?: WeightUnit
  onPortionEatenChange?: (value: number | null) => void
  onPortionEatenUnitChange?: (value: WeightUnit) => void
  targetCalories?: number | null
  onTargetCaloriesChange?: (value: number | null) => void
  cookedOutputUnit?: WeightUnit
  onCookedOutputUnitChange?: (value: WeightUnit) => void
}

function toInputValue(value: number | null | undefined) {
  return value ?? ''
}

function TotalModeResults({
  form,
  result,
  portionEaten,
  portionEatenUnit,
  onPortionEatenChange,
  onPortionEatenUnitChange,
  targetCalories,
  onTargetCaloriesChange,
}: Pick<
  ResultsPanelProps,
  | 'form'
  | 'result'
  | 'portionEaten'
  | 'portionEatenUnit'
  | 'onPortionEatenChange'
  | 'onPortionEatenUnitChange'
  | 'targetCalories'
  | 'onTargetCaloriesChange'
>) {
  const batchHelper =
    form.totalCaloriesSource === 'packageLabel'
      ? 'Based on raw package weight and label serving size'
      : 'Based on entered batch calories'

  return (
    <>
      <section className="results-section results-section--batch">
        <header data-testid="results-section-batch">
          <h3>Batch calorie stats</h3>
          <p>{batchHelper}</p>
        </header>

        <dl className="results-metrics">
          <div>
            <dt>Total calories</dt>
            <dd>
              {formatTotalCalories(
                result.totalCalories,
                result.totalCaloriesDisplaySource,
              )}
            </dd>
          </div>
          {form.totalCaloriesSource === 'packageLabel' ? (
            <>
              <div>
                <dt>Raw package servings</dt>
                <dd>{formatRawPackageServings(result.rawPackageServings)}</dd>
              </div>
              <div>
                <dt>Package calories per serving</dt>
                <dd>{formatCaloriesPerServing(form.packageCaloriesPerServing)}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      <section className="results-section results-section--cooked">
        <header data-testid="results-section-cooked">
          <h3>Cooked batch stats</h3>
          <p>Based on cooked batch weight and portion eaten</p>
        </header>

        {form.cookedWeightGrams === null || form.cookedWeightGrams <= 0 ? (
          <p className="results-unavailable">Needs cooked batch weight</p>
        ) : null}

        <dl className="results-metrics">
          <div>
            <dt>Calories per gram</dt>
            <dd>{formatCaloriesPerGram(result.caloriesPerGram)}</dd>
          </div>
          <div>
            <dt>Calories per ounce</dt>
            <dd>{formatCaloriesPerOunce(result.caloriesPerOunce)}</dd>
          </div>
          <div>
            <dt>Calories per 100g</dt>
            <dd>{formatCaloriesPer100Grams(result.caloriesPer100Grams)}</dd>
          </div>
          <div>
            <dt>Portion calories</dt>
            <dd>{formatPortionCalories(result.portionCalories)}</dd>
          </div>
        </dl>
      </section>

      {form.mode === 'total' ? (
        <section
          className="results-section results-section--portion-guide"
          data-testid="results-section-portion-guide"
        >
          <header>
            <h3>Portion guide</h3>
          </header>

          <div className="field-grid">
            <label className="field">
              <span>Portion eaten (cooked weight)</span>
              <div className="input-with-unit">
                <input
                  aria-label="Portion eaten (cooked weight)"
                  type="number"
                  value={toInputValue(portionEaten)}
                  onChange={(event) =>
                    onPortionEatenChange?.(
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
                <fieldset
                  className="unit-segmented"
                  aria-label="Portion eaten (cooked weight) unit"
                >
                  <label>
                    <input
                      checked={portionEatenUnit !== 'oz'}
                      name="portion-eaten-unit"
                      type="radio"
                      value="g"
                      onChange={() => onPortionEatenUnitChange?.('g')}
                    />
                    <span>g</span>
                  </label>
                  <label>
                    <input
                      checked={portionEatenUnit === 'oz'}
                      name="portion-eaten-unit"
                      type="radio"
                      value="oz"
                      onChange={() => onPortionEatenUnitChange?.('oz')}
                    />
                    <span>oz</span>
                  </label>
                </fieldset>
              </div>
            </label>

            <label className="field">
              <span>Target calories</span>
              <input
                aria-label="Target calories"
                type="number"
                value={targetCalories ?? ''}
                onChange={(event) =>
                  onTargetCaloriesChange?.(
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </label>
          </div>
        </section>
      ) : null}
    </>
  )
}

function PerServingResults({
  result,
}: Pick<ResultsPanelProps, 'result'>) {
  return (
    <>
      {result.assumptions.servings_assumed ? (
        <p className="assumption-note">Assumed 1 serving because none was provided.</p>
      ) : null}

      <dl className="results-metrics" data-testid="results-metrics">
        <div>
          <dt>Raw package servings</dt>
          <dd>{formatRawPackageServings(result.rawPackageServings)}</dd>
        </div>
        <div>
          <dt>Calories per serving</dt>
          <dd>{formatCaloriesPerServing(result.caloriesPerServing)}</dd>
        </div>
        <div>
          <dt>Calories per gram</dt>
          <dd>{formatCaloriesPerGram(result.caloriesPerGram)}</dd>
        </div>
        <div>
          <dt>Calories per ounce</dt>
          <dd>{formatCaloriesPerOunce(result.caloriesPerOunce)}</dd>
        </div>
        <div>
          <dt>Calories per 100g</dt>
          <dd>{formatCaloriesPer100Grams(result.caloriesPer100Grams)}</dd>
        </div>
      </dl>
    </>
  )
}

export function ResultsPanel({
  result,
  hasConflictingCalories,
  form,
  portionEaten,
  portionEatenUnit,
  onPortionEatenChange,
  onPortionEatenUnitChange,
  targetCalories,
  onTargetCaloriesChange,
  cookedOutputUnit: _cookedOutputUnit,
  onCookedOutputUnitChange: _onCookedOutputUnitChange,
}: ResultsPanelProps) {
  return (
    <section className="results-panel" data-testid="nutrition-label">
      <p className="eyebrow">Nutrition label</p>
      <h2>Live results</h2>
      <p className="placeholder-value">
        {formatTotalCalories(
          result.totalCalories,
          result.totalCaloriesDisplaySource,
        )}
      </p>
      <p className="placeholder-copy">
        {sourceLabels[result.calorie_source_used]}
      </p>

      <DevPanel
        hasConflictingCalories={hasConflictingCalories}
        form={form}
        result={result}
      />

      {form.mode === 'total' ? (
        <TotalModeResults
          form={form}
          result={result}
          portionEaten={portionEaten}
          portionEatenUnit={portionEatenUnit}
          onPortionEatenChange={onPortionEatenChange}
          onPortionEatenUnitChange={onPortionEatenUnitChange}
          targetCalories={targetCalories}
          onTargetCaloriesChange={onTargetCaloriesChange}
        />
      ) : (
        <PerServingResults result={result} />
      )}
    </section>
  )
}
