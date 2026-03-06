/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('index.html', () => {
  it('defines the meal calorie calculator document metadata and font loading', () => {
    const htmlPath = resolve(process.cwd(), 'index.html')
    const html = readFileSync(htmlPath, 'utf8')

    expect(html).toContain('<title>Meal Calorie Calculator</title>')
    expect(html).toContain(
      'content="Deterministic meal calorie calculator with saved meals and live nutrition density metrics."',
    )
    expect(html).toContain('href="https://fonts.googleapis.com"')
    expect(html).toContain('href="https://fonts.gstatic.com" crossorigin')
    expect(html).toContain('family=DM+Serif+Display')
    expect(html).toContain('family=DM+Mono')
    expect(html).toContain('family=DM+Sans')
  })
})
