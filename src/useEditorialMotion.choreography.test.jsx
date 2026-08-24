import { cleanup, render } from '@testing-library/react'
import { createElement, useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const motion = vi.hoisted(() => {
  const records = {
    froms: [],
    fromTos: [],
    mediaQueries: [],
    conditions: { desktop: true, narrow: false },
    sets: [],
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
      fromTo(target, fromVars, vars) {
        const animation = {
          kill() {},
          scrollTrigger: vars.scrollTrigger && { ...vars.scrollTrigger, kill() {} },
        }
        records.fromTos.push({ fromVars, target, vars })
        return animation
      },
      matchMedia() {
        return {
          add(queries, callback) {
            records.mediaQueries.push(queries)
            callback({ conditions: records.conditions })
          },
          revert() {},
        }
      },
      registerPlugin() {},
      set(target, vars) {
        records.sets.push({ target, vars })
      },
      timeline,
      utils: {
        toArray(selector) {
          return Array.from(document.querySelectorAll(selector))
        },
      },
    },
    records,
    setViewport(viewport) {
      records.conditions = {
        desktop: viewport === 'desktop',
        narrow: viewport === 'narrow',
      }
    },
    reset() {
      records.froms.length = 0
      records.fromTos.length = 0
      records.mediaQueries.length = 0
      records.conditions = { desktop: true, narrow: false }
      records.sets.length = 0
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
    <>
      <div ref={rootRef}>
      <div className="opening-curtain"><span className="opening-curtain__rule" /></div>
      <section className="profile">
        <SectionHeading section="profile" />
        <div className="profile__layout">
          <figure className="portrait-frame" data-motion="portrait">
            <img data-motion="parallax-image" alt="portrait" />
          </figure>
          <div data-motion="profile-copy"><p>copy</p></div>
          <div data-motion="profile-fact">fact</div>
        </div>
        <div className="profile__topography"><canvas /></div>
      </section>
      <section className="strengths">
        <SectionHeading section="strengths" />
        <div className="strength-grid"><article data-motion="strength-card">strength</article></div>
      </section>
      <section className="work">
        <SectionHeading section="work" />
        {[0, 1, 2, 3, 4].map((index) => {
          const isCarousel = index === 1 || index === 3

          return (
            <article data-motion="work-card" key={index}>
              <div className={`work-card__image-wrap${isCarousel ? ' work-card__image-wrap--carousel' : ''}`}>
                {isCarousel ? (
                  <div className="depth-carousel__card"><img alt={`carousel-${index}`} /></div>
                ) : (
                  <img className="work-card__image" data-motion="parallax-image" alt={`static-${index}`} />
                )}
              </div>
              <div className="work-card__body">
                <div className="work-card__meta" />
                <h3>work {index}</h3>
                <p className="work-card__role" />
                <p className="work-card__summary" />
                <ul className="work-card__metrics" />
                <div className="work-card__tags" />
              </div>
            </article>
          )
        })}
      </section>
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
      <img data-motion="parallax-image" alt="outside-root" />
    </>
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

    const allowedEases = new Set(['none', 'power3.out', 'power4.inOut', 'expo.out'])
    const scrollTweenSteps = motion.records.timelines
      .filter(({ scrollTrigger }) => scrollTrigger)
      .flatMap(({ steps }) => steps)
    const standaloneScrollTweens = [...motion.records.froms, ...motion.records.fromTos]
      .filter(({ vars }) => vars.scrollTrigger)
      .map(({ target, vars }) => ({ target, vars }))

    expect([...scrollTweenSteps, ...standaloneScrollTweens]).not.toHaveLength(0)
    expect([...scrollTweenSteps, ...standaloneScrollTweens].every(({ vars }) => allowedEases.has(vars.ease))).toBe(true)
  })

  it('reveals five work cards and parallaxes only root-scoped static images on desktop', () => {
    const { container } = render(<MotionHarness />)
    const root = container.firstElementChild
    const cards = Array.from(root.querySelectorAll('[data-motion="work-card"]'))
    const workTimelines = motion.records.timelines.filter(({ scrollTrigger }) => cards.includes(scrollTrigger?.trigger))
    const parallaxImages = Array.from(root.querySelectorAll('[data-motion="parallax-image"]'))

    expect(workTimelines).toHaveLength(5)
    expect(workTimelines.map(({ scrollTrigger }) => scrollTrigger)).toEqual(cards.map(card => ({
      trigger: card,
      start: 'top 72%',
      once: true,
      kill: expect.any(Function),
    })))
    expect(workTimelines.map(({ steps }) => steps[0].vars.clipPath)).toEqual([
      'inset(0 100% 0 0)',
      'inset(0 0 0 100%)',
      'inset(0 100% 0 0)',
      'inset(0 0 0 100%)',
      'inset(0 100% 0 0)',
    ])
    expect(motion.records.mediaQueries).toEqual([{
      desktop: '(min-width: 901px)',
      narrow: '(max-width: 900px)',
    }])
    expect(motion.records.fromTos).toHaveLength(4)
    expect(motion.records.fromTos.map(({ target }) => target)).toEqual(parallaxImages)
    expect(motion.records.fromTos).toEqual(parallaxImages.map(image => expect.objectContaining({
      target: image,
      fromVars: { '--parallax-y': '-3.5%', '--parallax-scale': 1.055 },
      vars: expect.objectContaining({
        '--parallax-y': '3.5%',
        '--parallax-scale': 1.055,
        ease: 'none',
        scrollTrigger: {
          trigger: image.closest('.work-card__image-wrap, .portrait-frame'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      }),
    })))
    expect(root.querySelector('.depth-carousel__card [data-motion="parallax-image"]')).toBeNull()
    expect(root.querySelector('.profile__topography [data-motion="parallax-image"]')).toBeNull()
  })

  it('gives the hero opening transform to its wrapper while the video keeps its independent breathe animation', () => {
    render(<MotionHarness />)

    expect(motion.records.sets).toContainEqual({
      target: '.hero__media',
      vars: { scale: 1.08, scaleY: 0.92, filter: 'brightness(0.62)' },
    })
    const opening = motion.records.timelines.find(({ scrollTrigger }) => !scrollTrigger)
    expect(opening.steps).toContainEqual(expect.objectContaining({
      target: '.hero__media',
      vars: expect.objectContaining({ scale: 1, scaleY: 1 }),
    }))
    expect(motion.records.sets.some(({ target }) => target === '.hero__video')).toBe(false)
  })

  it('uses shorter, lower-travel choreography and no parallax on narrow screens', () => {
    motion.setViewport('narrow')
    const { container } = render(<MotionHarness />)
    const root = container.firstElementChild
    const firstCard = root.querySelector('[data-motion="work-card"]')
    const opening = motion.records.timelines.find(({ scrollTrigger }) => !scrollTrigger)
    const titleSet = motion.records.sets.find(({ target }) => target === '[data-motion="hero-title"]')
    const titleEntrance = opening.steps.find(({ target }) => target === '[data-motion="hero-title"]')
    const workTimeline = motion.records.timelines.find(({ scrollTrigger }) => scrollTrigger?.trigger === firstCard)
    const workCopyEntrance = workTimeline.steps[1]

    expect(titleSet.vars.yPercent).toBe(72)
    expect(titleEntrance.vars).toMatchObject({ duration: 0.65, yPercent: 0 })
    expect(workTimeline.steps[0].vars).toMatchObject({ duration: 0.82, scale: 1.025 })
    expect(workCopyEntrance.vars).toMatchObject({ duration: 0.55, stagger: 0.055, y: 32 })
    expect(motion.records.fromTos).toHaveLength(0)
  })
})
