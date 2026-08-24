import { lazy, Suspense, useEffect, useState } from 'react'
import { profile, projects, strengths } from './resumeData'

const Silk = lazy(() => import('./Silk'))

const navItems = [
  ['about', 'About'],
  ['work', 'Work'],
  ['strengths', 'Strengths'],
  ['contact', 'Contact'],
]

function SectionHeading({ index, eyebrow, children }) {
  return (
    <header className="section-heading">
      <span className="section-heading__index">{index}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{children}</h2>
      </div>
    </header>
  )
}

function SilkBackground() {
  return (
    <div className="silk-background" aria-hidden="true">
      <Suspense fallback={<div className="silk-loading" />}>
        <Silk speed={5} scale={0.6} color="#eee6d8" noiseIntensity={2.8} rotation={0.16} />
      </Suspense>
    </div>
  )
}

function App() {
  const [isNavFloating, setIsNavFloating] = useState(false)

  useEffect(() => {
    const updateNavigation = () => {
      setIsNavFloating(window.scrollY > window.innerHeight - 120)
    }

    updateNavigation()
    window.addEventListener('scroll', updateNavigation, { passive: true })
    window.addEventListener('resize', updateNavigation)

    return () => {
      window.removeEventListener('scroll', updateNavigation)
      window.removeEventListener('resize', updateNavigation)
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#about">
        跳至主要内容
      </a>

      <nav
        className={`site-nav shell${isNavFloating ? ' site-nav--floating' : ''}`}
        aria-label="主要导航"
      >
        <a className="site-nav__mark" href="#top" aria-label="返回首页">
          QC<span>°</span>
        </a>
        <div className="site-nav__links">
          {navItems.map(([href, label]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </div>
        <a className="button button--light site-nav__contact" href="#contact">
          联系我
        </a>
      </nav>

      <header className="hero" id="top">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/media/hero-geology.mp4" type="video/mp4" />
        </video>
        <div className="hero__shade" />

        <div className="hero__content shell">
          <p className="hero__kicker">Earth Science · ESG · GIS</p>
          <h1 aria-label="崔琪 QI CUI">
            <span className="hero__name-primary">崔琪</span>
            <small className="hero__name-secondary">QI CUI</small>
          </h1>
          <div className="hero__footer">
            <p>
              帝国理工学院地球科学与工程学院学生
              <br />
              研究地球，也研究变化如何真正发生。
            </p>
            <div className="hero__actions">
              <a className="button button--filled" href="#work">
                查看精选经历
              </a>
              <a className="text-link text-link--light" href="#about">
                向下阅读 <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
        <p className="hero__folio">PORTFOLIO / 2026</p>
      </header>

      <main>
        <section className="profile section silk-section" id="about">
          <SilkBackground />
          <div className="shell silk-section__content">
            <SectionHeading index="01" eyebrow="Profile / 个人档案">
              在地球科学与商业问题之间，建立清晰的坐标。
            </SectionHeading>

            <div className="profile__layout">
            <figure className="portrait-frame">
              <img src="/media/portrait.jpg" alt="崔琪个人头像" />
              <figcaption>QI CUI · LONDON / BEIJING</figcaption>
            </figure>

            <div className="profile__copy">
              <p className="profile__lead">{profile.intro}</p>
              <dl className="profile__details">
                <div>
                  <dt>Education</dt>
                  <dd>
                    {profile.schoolZh}
                    <span>{profile.school}</span>
                  </dd>
                </div>
                <div>
                  <dt>Programme</dt>
                  <dd>
                    {profile.degree}
                    <span>{profile.period}</span>
                  </dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    <a href={`tel:${profile.phoneHref}`}>{profile.phone}</a>
                  </dd>
                </div>
              </dl>
              <div className="profile__facts" aria-label="个人数据">
                {profile.facts.map((fact) => (
                  <div key={fact.label}>
                    <strong>{fact.value}</strong>
                    <span>{fact.label}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="work section" id="work">
          <div className="shell">
            <SectionHeading index="02" eyebrow="Selected Work / 精选经历">
              从资源、生态到碳治理，追踪复杂系统中的真实问题。
            </SectionHeading>
          </div>

          <div className="work-list shell">
            {projects.map((project, index) => (
              <article className="work-card" data-testid="work-card" key={project.id}>
                <div className="work-card__image-wrap">
                  <img
                    className="work-card__image"
                    src={project.image}
                    alt={`${project.title}主题视觉，非项目现场照片`}
                  />
                  <span className="work-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="work-card__kind">{project.kind}</span>
                </div>
                <div className="work-card__body">
                  <div className="work-card__meta">
                    <p>{project.organization}</p>
                    <p>{project.period}</p>
                  </div>
                  <h3>{project.title}</h3>
                  <p className="work-card__role">{project.role}</p>
                  <p className="work-card__summary">{project.summary}</p>
                  <ul className="work-card__metrics" aria-label="关键成果">
                    {project.metrics.map((metric) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                  <div className="work-card__tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="strengths section silk-section" id="strengths">
          <SilkBackground />
          <div className="shell silk-section__content">
            <SectionHeading index="03" eyebrow="Strengths / 个人优势">
              不止掌握工具，更知道如何把信息组织成行动。
            </SectionHeading>
            <div className="strength-grid">
              {strengths.map((strength) => (
                <article className="strength-card" key={strength.number}>
                  <span>{strength.number}</span>
                  <h3>{strength.title}</h3>
                  <p>{strength.description}</p>
                </article>
              ))}
            </div>
            <p className="tools-line">
              <span>Tools</span>
              Codex · Python · SQL · ArcGIS · Inkscape · Puffinplots · Excel · PowerPoint
            </p>
          </div>
        </section>
      </main>

      <footer className="contact" id="contact">
        <div className="contact__inner shell">
          <p className="eyebrow">04 / Contact</p>
          <h2>
            Let’s map the
            <br />
            next question.
          </h2>
          <p className="contact__intro">如果你正在寻找兼具研究深度、数据意识与沟通能力的合作者，欢迎联系我。</p>
          <div className="contact__details">
            <div>
              <span>Email</span>
              <p>{profile.email}</p>
            </div>
            <div>
              <span>Phone</span>
              <p>{profile.phone}</p>
            </div>
          </div>
          <div className="contact__actions">
            <a className="button button--filled button--paper" href={`mailto:${profile.email}`}>
              发送邮件 <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link text-link--light" href="#top">
              返回顶部 <span aria-hidden="true">↑</span>
            </a>
          </div>
          <div className="contact__foot">
            <span>QI CUI © 2026</span>
            <span>EARTH SCIENCE · ESG · GIS</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
