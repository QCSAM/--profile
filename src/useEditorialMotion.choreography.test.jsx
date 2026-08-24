import { cleanup, render } from '@testing-library/react'
import { createElement, useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const motion = vi.hoisted(() => {
  const records = {
    froms: [],
    timelines: [],
  }

  const timeline = (config = {}) => {
    const controllerTrigger = config.scrollTrigger && { ...config.scrollTrigger, kill() {} }
    const record = {
      scrollTrigger: controllerTrigger,
      steps: [],
    }
    const animation = {
      kill() {},
      scrollTrigger: controllerTrigger,
      from(target, vars, position) {
        record.steps.push({ target, vars, position })
        return animation
      },
      fromTo(target, fromVars, toVars, position) {
        record.steps.push({ fromVars, position, target, vars: toVars })
        return animation
      },
      set(target, vars, position) {
        record.steps.push({ position, target, vars })
        return animation
      },
      to(target, vars, position) {
        record.steps.push({ position, target, vars })
        return animation
      },
    }
    records.timelines.push(record)
    return animation
  }

  return {
    gsap: {
      context(callback) {
        callback()
        return { revert() {} }
      },
      from(target, vars) {
        const animation = {
          kill() {},
          scrollTrigger: vars.scrollTrigger && { ...vars.scrollTrigger, kill() {} },
        }
        records.froms.push({ target, vars })
        return animation
      },
      matchMedia() {
        return {
          add() {},
          revert() {},
        }
      },
      registerPlugin() {},
      set() {},
      timeline,
      utils: {
        toArray(selector) {
          return Array.from(document.querySelectorAll(selector))
        },
      },
    },
    records,
    reset() {
      records.froms.length = 0
      records.timelines.length = 0
    },
  }
})

vi.mock('gsap', () => ({ default: motion.gsap }))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

import useEditorialMotion from './useEditorialMotion'

afterEach(() => {
  cleanup()
  motion.reset()
})

function SectionHeading({ section }) {
  return (
    <header data-motion="section-heading" data-section={section}>
      <span className="section-heading__index">01</span>
      <div>
        <p className="eyebrow">{section}</p>
        <h2>{section}</h2>
      </div>
    </header>
  )
}

function MotionHarness() {
  const rootRef = useRef(null)
  useEditorialMotion(rootRef)

  return (
    <div ref={rootRef}>
      <div className="opening-curtain"><span className="opening-curtain__rule" /></div>
      <section className="profile">
        <SectionHeading section="profile" />
        <div className="profile__layout">
          <figure data-motion="portrait" />
          <div data-motion="profile-copy"><p>copy</p></div>
          <div data-motion="profile-fact">fact</div>
        </div>
      </section>
      <section className="strengths">
        <SectionHeading section="strengths" />
        <div className="strength-grid"><article data-motion="strength-card">strength</article></div>
      </section>
      <section className="work"><SectionHeading section="work" /></section>
      <footer className="contact" data-motion="contact">
        <div className="contact__inner">
          <p className="eyebrow">contact</p>
          <h2>contact</h2>
          <p className="contact__intro">intro</p>
          <div data-motion="contact-details">details</div>
          <div data-motion="contact-actions">actions</div>
          <div className="contact__foot">foot</div>
        </div>
      </footer>
    </div>
  )
}

describe('editorial section choreography', () => {
  it('starts profile and strengths content from their heading timelines at 35% progress', () => {
    const { container } = render(<MotionHarness />)
    const profileHeading = container.querySelector('[data-section="profile"]')
    const strengthsHeading = container.querySelector('[data-section="strengths"]')
    const profileTimeline = motion.records.timelines.find(
      ({ scrollTrigger }) => scrollTrigger?.trigger === profileHeading,
    )
    const strengthsTimeline = motion.records.timelines.find(
      ({ scrollTrigger }) => scrollTrigger?.trigger === strengthsHeading,
    )

    expect(profileTimeline.scrollTrigger).toMatchObject({ once: true, start: 'top 72%' })
    expect(strengthsTimeline.scrollTrigger).toMatchObject({ once: true, start: 'top 72%' })
    expect(profileTimeline.steps.find(({ target }) => target === '[data-motion="portrait"]')).toMatchObject({
      position: 0.4725,
    })
    expect(strengthsTimeline.steps.find(({ target }) => target === '[data-motion="strength-card"]')).toMatchObject({
      position: 0.4725,
    })
    expect(motion.records.timelines.map(({ scrollTrigger }) => scrollTrigger?.trigger)).not.toContain('.profile__layout')
    expect(motion.records.froms.map(({ vars }) => vars.scrollTrigger?.trigger)).not.toContain('.strength-grid')
  })

  it('uses an approved explicit ease for every section scroll tween', () => {
    render(<MotionHarness />)

    const allowedEases = new Set(['power3.out', 'power4.inOut', 'expo.out'])
    const scrollTweenSteps = motion.records.timelines
      .filter(({ scrollTrigger }) => scrollTrigger)
      .flatMap(({ steps }) => steps)
    const standaloneScrollTweens = motion.records.froms
      .filter(({ vars }) => vars.scrollTrigger)
      .map(({ target, vars }) => ({ target, vars }))

    expect([...scrollTweenSteps, ...standaloneScrollTweens]).not.toHaveLength(0)
    expect([...scrollTweenSteps, ...standaloneScrollTweens].every(({ vars }) => allowedEases.has(vars.ease))).toBe(true)
  })
})
