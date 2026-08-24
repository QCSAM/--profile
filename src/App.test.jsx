import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

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
})
