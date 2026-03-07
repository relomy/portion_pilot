type DerivedMetricRowProps = {
  label: string
  value: string
  testId?: string
}

export function DerivedMetricRow({
  label,
  value,
  testId,
}: DerivedMetricRowProps) {
  const isEmpty = value === '—'

  return (
    <div className="derived__item">
      <span className="derived__label">{label}</span>
      <span
        className={`derived__value${isEmpty ? ' derived__value--empty' : ''}`}
        data-testid={testId}
      >
        {value}
      </span>
    </div>
  )
}
