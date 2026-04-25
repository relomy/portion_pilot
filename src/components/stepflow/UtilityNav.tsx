export type UtilityKey = 'calculator' | 'saved' | 'settings'
export type UtilityNavLayout = 'rail' | 'bottom-bar'

export type UtilityNavProps = {
  selectedUtility: UtilityKey
  onUtilityChange: (utility: UtilityKey) => void
  utilities?: UtilityKey[]
  layout?: UtilityNavLayout
}

const DEFAULT_UTILITIES: UtilityKey[] = ['calculator', 'saved']

const UTILITY_LABELS: Record<UtilityKey, string> = {
  calculator: 'Calculator',
  saved: 'Saved',
  settings: 'Settings',
}

export function UtilityNav({
  selectedUtility,
  onUtilityChange,
  utilities = DEFAULT_UTILITIES,
  layout = 'rail',
}: UtilityNavProps) {
  const activeUtility = utilities.includes(selectedUtility)
    ? selectedUtility
    : utilities[0]

  return (
    <nav
      className="utility-nav"
      data-layout={layout}
      aria-label="Utility navigation"
    >
      <ul className="utility-nav__list">
        {utilities.map((utility) => {
          const label = UTILITY_LABELS[utility]
          const isSelected = activeUtility === utility

          return (
            <li key={utility} className="utility-nav__item">
              <button
                type="button"
                className="utility-nav__button"
                aria-pressed={isSelected}
                onClick={() => onUtilityChange(utility)}
              >
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
