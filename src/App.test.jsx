import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

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

  it('shows the three Wangju internship photos in an accessible carousel', () => {
    render(<App />)

    const carousel = screen.getByRole('group', { name: '网聚资本实习照片' })
    expect(carousel).toBeInTheDocument()
    expect(carousel.querySelectorAll('img')).toHaveLength(3)
    expect(screen.getByRole('img', { name: '双汇第一工业园实地调研' })).toBeInTheDocument()
    expect(within(carousel).getByRole('button', { name: '下一张照片' })).toBeInTheDocument()
  })

  it('shows the two Xiahe research photos in the same accessible carousel style', () => {
    render(<App />)

    const carousel = screen.getByRole('group', { name: '夏河项目调研照片' })
    expect(carousel).toBeInTheDocument()
    expect(carousel.querySelectorAll('img')).toHaveLength(2)
    expect(screen.getByRole('img', { name: '夏河项目地球化学空间数据处理' })).toBeInTheDocument()
  })

  it('exposes the opening curtain and centralized editorial motion targets', () => {
    render(<App />)

    expect(document.querySelector('.opening-curtain[aria-hidden="true"]')).toBeInTheDocument()
    expect(document.querySelector('[data-motion="hero-title"]')).toHaveTextContent('崔琪')
    expect(document.querySelectorAll('[data-motion="section-heading"]')).toHaveLength(3)
    expect(document.querySelectorAll('[data-motion="work-card"]')).toHaveLength(5)
    expect(document.querySelector('[data-motion="contact"]')).toBeInTheDocument()
  })

  it('marks profile, strength, and contact content for hierarchical scroll entrances', () => {
    render(<App />)

    expect(document.querySelector('[data-motion="portrait"]')).toBeInTheDocument()
    expect(document.querySelector('[data-motion="profile-copy"]')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-motion="profile-fact"]')).toHaveLength(3)
    expect(document.querySelectorAll('[data-motion="strength-card"]')).toHaveLength(4)
    expect(document.querySelector('[data-motion="contact-details"]')).toBeInTheDocument()
    expect(document.querySelector('[data-motion="contact-actions"]')).toBeInTheDocument()
  })

  it('marks only static images and the portrait for parallax', () => {
    render(<App />)

    const parallaxTargets = document.querySelectorAll('[data-motion="parallax-image"]')
    expect(parallaxTargets).toHaveLength(4)
    expect(document.querySelector('.depth-carousel__card [data-motion="parallax-image"]')).toBeNull()
    expect(document.querySelector('.profile__topography [data-motion="parallax-image"]')).toBeNull()
  })
})
