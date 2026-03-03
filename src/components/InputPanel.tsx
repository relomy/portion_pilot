import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'

type InputPanelProps = {
  form: MealInputs
  onTextChange: (field: 'mealName', value: string) => void
  onNumberChange: (
    field:
      | 'manualTotalCalories'
      | 'caloriesPerServing'
      | 'yourServings'
      | 'cookedWeightGrams'
      | 'rawTotalWeight'
      | 'packageServingWeight'
      | 'packageCaloriesPerServing',
    value: number | null,
  ) => void
  onUnitChange: (
    field: 'rawTotalWeightUnit' | 'packageServingWeightUnit',
    value: WeightUnit,
  ) => void
  onModeChange: (mode: MealMode) => void
  onTotalSourceChange: (value: TotalCaloriesSource) => void
  onSave: () => void
  onClear: () => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

export function InputPanel({
  form,
  onTextChange,
  onNumberChange,
  onUnitChange,
  onModeChange,
  onTotalSourceChange,
  onSave,
  onClear,
}: InputPanelProps) {
  return (
    <section className="worksheet-panel" data-testid="input-worksheet">
      <header className="panel-heading">
        <p className="eyebrow">Recipe worksheet</p>
        <h2>Build your meal</h2>
      </header>

      <label className="field">
        <span>Meal name</span>
        <input
          type="text"
          value={form.mealName}
          onChange={(event) => onTextChange('mealName', event.target.value)}
          placeholder="Chicken bowl, chili, stir-fry..."
        />
      </label>

      <fieldset className="mode-group">
        <legend>Calorie mode</legend>

        <label className="mode-option">
          <input
            checked={form.mode === 'total'}
            name="mode"
            type="radio"
            onChange={() => onModeChange('total')}
          />
          <span>Total calories mode</span>
        </label>

        <label className="mode-option">
          <input
            checked={form.mode === 'perServing'}
            name="mode"
            type="radio"
            onChange={() => onModeChange('perServing')}
          />
          <span>Per serving</span>
        </label>
      </fieldset>

      {form.mode === 'total' ? (
        <fieldset className="mode-group">
          <legend>Total source</legend>

          <label className="mode-option">
            <input
              checked={form.totalCaloriesSource === 'packageLabel'}
              name="total-source"
              type="radio"
              onChange={() => onTotalSourceChange('packageLabel')}
            />
            <span>Package label</span>
          </label>

          <label className="mode-option">
            <input
              checked={form.totalCaloriesSource === 'manualTotal'}
              name="total-source"
              type="radio"
              onChange={() => onTotalSourceChange('manualTotal')}
            />
            <span>Manual total</span>
          </label>
        </fieldset>
      ) : null}

      <div className="field-grid">
        <label className="field">
          <span>Cooked weight (g)</span>
          <input
            type="number"
            value={toInputValue(form.cookedWeightGrams)}
            onChange={(event) =>
              onNumberChange(
                'cookedWeightGrams',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </label>

        {form.mode === 'total' && form.totalCaloriesSource === 'manualTotal' ? (
          <label className="field">
            <span>Total calories</span>
            <input
              type="number"
              value={toInputValue(form.manualTotalCalories)}
              onChange={(event) =>
                onNumberChange(
                  'manualTotalCalories',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
          </label>
        ) : null}

        {form.mode === 'total' && form.totalCaloriesSource === 'packageLabel' ? (
          <>
            <label className="field">
              <span>Raw total weight</span>
              <input
                type="number"
                value={toInputValue(form.rawTotalWeight)}
                onChange={(event) =>
                  onNumberChange(
                    'rawTotalWeight',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </label>

            <label className="field">
              <span>Raw total weight unit</span>
              <select
                value={form.rawTotalWeightUnit}
                onChange={(event) =>
                  onUnitChange(
                    'rawTotalWeightUnit',
                    event.target.value as WeightUnit,
                  )
                }
              >
                <option value="g">g</option>
                <option value="oz">oz</option>
              </select>
            </label>

            <label className="field">
              <span>Package serving weight</span>
              <input
                type="number"
                value={toInputValue(form.packageServingWeight)}
                onChange={(event) =>
                  onNumberChange(
                    'packageServingWeight',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </label>

            <label className="field">
              <span>Package serving weight unit</span>
              <select
                value={form.packageServingWeightUnit}
                onChange={(event) =>
                  onUnitChange(
                    'packageServingWeightUnit',
                    event.target.value as WeightUnit,
                  )
                }
              >
                <option value="g">g</option>
                <option value="oz">oz</option>
              </select>
            </label>

            <label className="field">
              <span>Package calories per serving</span>
              <input
                type="number"
                value={toInputValue(form.packageCaloriesPerServing)}
                onChange={(event) =>
                  onNumberChange(
                    'packageCaloriesPerServing',
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
            </label>
          </>
        ) : null}

        <label className="field">
          <span>Calories per serving</span>
          <input
            disabled={form.mode !== 'perServing'}
            type="number"
            value={toInputValue(form.caloriesPerServing)}
            onChange={(event) =>
              onNumberChange(
                'caloriesPerServing',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </label>

        <label className="field">
          <span>Your servings (optional)</span>
          <input
            type="number"
            value={toInputValue(form.yourServings)}
            onChange={(event) =>
              onNumberChange(
                'yourServings',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </label>
      </div>

      <div className="action-row">
        <button type="button" onClick={onSave}>
          Save meal
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>
    </section>
  )
}
