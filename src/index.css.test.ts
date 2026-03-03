/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('index.css', () => {
  it('styles the live results panel selector', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.results-panel')
    expect(css).toContain('.worksheet-panel,\n.results-panel,\n.saved-meals-placeholder')
    expect(css).toContain('.results-panel {\n  background: var(--label);')
    expect(css).toContain('.app-header h1,\n.panel-heading h2,\n.results-panel h2,')
  })

  it('styles the saved meals shelf and prep cards', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.saved-meals-grid')
    expect(css).toContain('.saved-meals-empty')
    expect(css).toContain('.meal-card')
    expect(css).toContain('.meal-card--prep')
    expect(css).toContain('.meal-card__header')
    expect(css).toContain('.meal-card__metrics')
    expect(css).toContain('.meal-card__actions')
  })

  it('defines motion with a reduced-motion escape hatch and row-based result styling', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('@keyframes rise-in')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('.results-metrics')
    expect(css).toContain('.results-metrics div')
    expect(css).toContain('.dev-panel')
    expect(css).toContain('.assumption-note')
  })
})
