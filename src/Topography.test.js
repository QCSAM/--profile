import { describe, expect, it } from 'vitest'
import { colorModeToFloat, hexToRgb } from './Topography'

describe('Topography shader helpers', () => {
  it('converts the selected paper-tone palette to normalized RGB', () => {
    expect(hexToRgb('#8f765e')).toEqual([143 / 255, 118 / 255, 94 / 255])
    expect(hexToRgb('#b9a48a')).toEqual([185 / 255, 164 / 255, 138 / 255])
  })

  it('maps the uniform color mode for the restrained profile background', () => {
    expect(colorModeToFloat('uniform')).toBe(1)
  })
})
