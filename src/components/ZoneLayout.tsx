export function ZoneLayout() {
  return (
    <div className="zone-layout">
      <section className="zone zone--package" data-testid="zone-package">
        <p className="zone__eyebrow">Zone 1 · Before cooking</p>
        <h2 className="zone__title">Package</h2>
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
