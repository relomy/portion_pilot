import type { MealInputs, MealMode } from '../hooks/useSavedMeals'

type InputPanelProps = {
  form: MealInputs
  onTextChange: (field: 'mealName', value: string) => void
  onNumberChange: (
    field:
      | 'totalCalories'
      | 'caloriesPerServing'
      | 'servings'
      | 'cookedWeightGrams',
    value: number | null,
  ) => void
  onModeChange: (mode: MealMode) => void
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
  onModeChange,
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

        <label className="field">
          <span>Total calories</span>
          <input
            disabled={form.mode !== 'total'}
            type="number"
            value={toInputValue(form.totalCalories)}
            onChange={(event) =>
              onNumberChange(
                'totalCalories',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </label>

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
          <span>Servings</span>
          <input
            disabled={form.mode !== 'perServing'}
            type="number"
            value={toInputValue(form.servings)}
            onChange={(event) =>
              onNumberChange(
                'servings',
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
