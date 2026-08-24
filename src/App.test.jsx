import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('resume site', () => {
  it('renders identity, five work cards, strengths, and public contacts', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /QI CUI/i })).toBeInTheDocument()
    expect(screen.getAllByTestId('work-card')).toHaveLength(5)
    expect(screen.getByText('中国内蒙古矿业有限公司')).toBeInTheDocument()
    expect(screen.getByText('中国网聚资本有限公司')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cq030317@gmail.com/i })).toHaveAttribute(
      'href',
      'mailto:cq030317@gmail.com',
    )
    expect(screen.getByRole('link', { name: /185-1913-1780/i })).toHaveAttribute(
      'href',
      'tel:18519131780',
    )
  })

  it('uses the Chinese name as the hero title and English name as the smaller label', () => {
    render(<App />)

    const heading = screen.getByRole('heading', { level: 1, name: /崔琪 QI CUI/i })
    expect(heading.querySelector('.hero__name-primary')).toHaveTextContent('崔琪')
    expect(heading.querySelector('.hero__name-secondary')).toHaveTextContent('QI CUI')
  })

  it('turns the navigation into a floating kraft-paper bar after the hero', () => {
    render(<App />)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 900 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 })

    fireEvent.scroll(window)

    expect(screen.getByRole('navigation', { name: '主要导航' })).toHaveClass(
      'site-nav--floating',
    )
  })

  it('mounts the restrained topography effect only in the profile section', () => {
    render(<App />)

    const profile = document.querySelector('#about')
    expect(profile.querySelector('.profile__topography')).toBeInTheDocument()
    expect(document.querySelectorAll('.profile__topography')).toHaveLength(1)
  })
})
