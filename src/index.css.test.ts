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
})
