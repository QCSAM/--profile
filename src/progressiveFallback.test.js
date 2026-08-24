import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const indexMarkup = readFileSync('index.html', 'utf8')

describe('static progressive fallback', () => {
  it('provides useful identity, résumé navigation, and contact content without JavaScript', () => {
    const page = new DOMParser().parseFromString(indexMarkup, 'text/html')
    const fallback = page.querySelector('noscript .noscript-resume')
    const heading = fallback?.querySelector('h1')

    expect(fallback).not.toBeNull()
    expect(heading.textContent).toContain('崔琪')
    expect(heading.textContent).toContain('QI CUI')
    expect(fallback.querySelector('a[href="mailto:cq030317@gmail.com"]')).toBeTruthy()
    expect(fallback.querySelector('a[href="#work"]').textContent).toContain('精选经历')
  })

  it('preloads the hero poster rather than the full video payload', () => {
    const page = new DOMParser().parseFromString(indexMarkup, 'text/html')
    const preload = page.querySelector('link[rel="preload"]')

    expect(preload.getAttribute('as')).toBe('image')
    expect(preload.getAttribute('href')).toBe('/media/hero-poster.jpg')
    expect(page.querySelector('link[rel="preload"][as="video"]')).toBeNull()
  })
})
