import { describe, expect, it } from 'vitest'
import { hexToNormalizedRGB } from './Silk'

describe('Silk color conversion', () => {
  it('converts the site paper color into normalized shader values', () => {
    expect(hexToNormalizedRGB('#eee6d8')).toEqual([
      238 / 255,
      230 / 255,
      216 / 255,
    ])
  })
})
