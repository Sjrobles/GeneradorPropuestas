import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  MessagesSquare,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { useSkillsQuery } from '@/features/skills/hooks/use-skills-query'

import { AssemblyStepDemo } from './AssemblyStepDemo'
import { ContextStepDemo } from './ContextStepDemo'
import { LandingSkillCard } from './LandingSkillCard'
import { ReviewStepDemo } from './ReviewStepDemo'

import './landing.css'
import './landing-catalog.css'
import './how-scroll.css'

const steps = [
  {
    label: 'Idea',
    prompt: '¿Cuál es el problema que quieres resolver?',
  },
  {
    label: 'Diagnóstico',
    prompt: '¿Qué evidencia demuestra que este problema es prioritario?',
  },
  {
    label: 'Diseño',
    prompt: '¿Qué solución propones y cómo la pondrás en marcha?',
  },
  {
    label: 'Presupuesto',
    prompt: '¿Qué recursos necesita el proyecto para ser viable?',
  },
  {
    label: 'Impacto',
    prompt: '¿Qué cambio esperas generar en la población beneficiaria?',
  },
] as const

const STEP_DURATION = 4_400
const TYPE_SPEED = 34
function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0)
  const [displayedPrompt, setDisplayedPrompt] = useState('')

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const cycle = window.setInterval(() => {
      setActiveStep((currentStep) => (currentStep + 1) % steps.length)
    }, STEP_DURATION)

    return () => window.clearInterval(cycle)
  }, [])

  useEffect(() => {
    const prompt = steps[activeStep].prompt

    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false
    ) {
      const showPrompt = window.setTimeout(() => setDisplayedPrompt(prompt), 0)
      return () => window.clearTimeout(showPrompt)
    }

    const clearPrompt = window.setTimeout(() => setDisplayedPrompt(''), 0)
    let characterIndex = 0
    const typing = window.setInterval(() => {
      characterIndex += 1
      setDisplayedPrompt(prompt.slice(0, characterIndex))

      if (characterIndex >= prompt.length) {
        window.clearInterval(typing)
      }
    }, TYPE_SPEED)

    return () => {
      window.clearTimeout(clearPrompt)
      window.clearInterval(typing)
    }
  }, [activeStep])

  return (
    <div className="agora-image-assistant" data-ui>
      <div className="agora-image-assistant-heading">
        <MessagesSquare size={17} aria-hidden="true" />
        <span>Asistente Ágora · {steps[activeStep].label}</span>
      </div>
      <p className="agora-image-question">
        <span className="sr-only">{steps[activeStep].prompt}</span>
        <span aria-hidden="true">
          {displayedPrompt}
          <span className="agora-typing-cursor agora-image-cursor" />
        </span>
      </p>
      <div
        className="agora-image-progress"
        role="group"
        aria-label="Etapas de formulación"
      >
        {steps.map((step, index) => (
          <button
            key={step.label}
            type="button"
            aria-pressed={index === activeStep}
            aria-label={`Mostrar etapa: ${step.label}`}
            onClick={() => setActiveStep(index)}
            className={index <= activeStep ? 'is-complete' : ''}
          >
            <span />
            <span className="sr-only">{step.label}</span>
          </button>
        ))}
      </div>
      <div className="agora-image-thinking" aria-hidden="true">
        <span className="agora-thinking-dot" />
        <span className="agora-thinking-dot" />
        <span className="agora-thinking-dot" />
        <span>Construyendo tu proyecto</span>
      </div>
    </div>
  )
}

export function LandingPage() {
  const skillsQuery = useSkillsQuery()
  const heroRef = useRef<HTMLElement>(null)
  const howRef = useRef<HTMLElement>(null)
  const productImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = howRef.current
    if (!section) return
    const steps = Array.from(
      section.querySelectorAll<HTMLElement>('.agora-context-step'),
    )
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const bounds = section.getBoundingClientRect()
      const positions = steps.map((step) => {
        const heading = step
          .querySelector('.agora-step-heading')!
          .getBoundingClientRect()
        return heading.top + heading.height / 2
      })
      const start = positions[0]
      const end = positions[positions.length - 1]
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight * 0.55 - start) / Math.max(1, end - start),
        ),
      )
      section.style.setProperty('--route-top', `${start - bounds.top}px`)
      section.style.setProperty('--route-height', `${end - start}px`)
      section.style.setProperty('--route-progress', String(progress))
      section.style.setProperty(
        '--route-drift',
        motion?.matches
          ? '0px'
          : `${Math.max(-40, Math.min(40, -bounds.top * 0.035))}px`,
      )
      let active = 0
      positions.forEach((position, index) => {
        if (position <= window.innerHeight * 0.6) active = index
      })
      steps.forEach((step, index) =>
        step.classList.toggle('is-route-active', index === active),
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resize =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : undefined
    resize?.observe(section)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion?.addEventListener('change', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      resize?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion?.removeEventListener('change', schedule)
    }
  }, [])

  useEffect(() => {
    const shell = heroRef.current?.closest('.agora-landing-shell')
    if (!shell || typeof IntersectionObserver === 'undefined') return
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (motion?.matches) return

    const cards = Array.from(
      shell.querySelectorAll<HTMLElement>(
        '#producto .agora-float, #producto .agora-image-assistant, .agora-context-demo, .agora-review-demo, .agora-assembly-demo, .agora-catalog-card',
      ),
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-scroll-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' },
    )

    cards.forEach((card, index) => {
      card.style.setProperty(
        '--reveal-delay',
        card.closest('#producto') ? `${index * 120}ms` : '0ms',
      )
      card.classList.add('agora-scroll-reveal')
      observer.observe(card)
    })
    const showAll = () => {
      if (motion?.matches)
        cards.forEach((card) => card.classList.add('is-scroll-visible'))
    }
    motion?.addEventListener('change', showAll)
    return () => {
      observer.disconnect()
      motion?.removeEventListener('change', showAll)
      cards.forEach((card) => card.classList.remove('agora-scroll-reveal'))
    }
  }, [skillsQuery.data])

  useEffect(() => {
    const hero = heroRef.current
    const image = productImageRef.current
    const shell = hero?.closest<HTMLElement>('.agora-landing-shell')
    if (!hero || !image || !shell) return

    const updateBackground = () => {
      const shellBounds = shell.getBoundingClientRect()
      const imageBounds = image.getBoundingClientRect()
      shell.style.setProperty(
        '--landing-background-height',
        `${imageBounds.top - shellBounds.top + imageBounds.height / 2}px`,
      )
    }
    updateBackground()
    hero.addEventListener('animationend', updateBackground)
    if (typeof ResizeObserver === 'undefined') {
      return () => hero.removeEventListener('animationend', updateBackground)
    }
    const observer = new ResizeObserver(updateBackground)
    observer.observe(shell)
    observer.observe(hero)
    observer.observe(image)
    return () => {
      observer.disconnect()
      hero.removeEventListener('animationend', updateBackground)
    }
  }, [])

  return (
    <>
      <section
        id="producto"
        ref={heroRef}
        className="agora-landing agora-hero"
        aria-labelledby="landing-title"
      >
        <div className="agora-hero-copy">
          <h1 id="landing-title">
            Formula proyectos CTeI
            <br className="agora-title-break" /> de alto impacto con IA
          </h1>
          <p>
            Ágora te acompaña en cada etapa de la formulación de proyectos de
            Ciencia, Tecnología e Innovación, integrando inteligencia artificial
            y conocimiento especializado.
          </p>
          <div className="agora-hero-actions">
            <Link className="agora-primary-action" to="/skills">
              Comenzar gratis <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <a className="agora-secondary-action" href="#como-funciona">
              Conoce cómo funciona <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>
          <p className="agora-hero-note">
            <ShieldCheck size={16} aria-hidden="true" /> Conocimiento
            especializado. Tu criterio en cada decisión.
          </p>
        </div>
        <div className="agora-product-stage" data-ui>
          <div className="agora-product-image" ref={productImageRef}>
            <img
              src="/images/agora/inicio.png"
              width="1063"
              height="594"
              fetchPriority="high"
              alt="Ágora: editor de marco teórico, diez componentes del proyecto y sugerencias de mejora con IA"
            />
          </div>
          <WorkflowDemo />
          <img
            className="agora-float agora-float-left"
            src="/images/agora/inicio2.svg"
            width="304"
            height="138"
            alt="Formulación segura: completa y aprueba todos los componentes"
          />
          <img
            className="agora-float agora-float-right"
            src="/images/agora/inicio3.svg"
            width="421"
            height="74"
            alt="Soporte de traducción al inglés"
          />
        </div>
        <div className="agora-principles">
          <span>
            <Check size={17} aria-hidden="true" /> Rigor académico
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Revisión humana
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Contexto de tu proyecto
          </span>
        </div>
      </section>

      <section
        id="como-funciona"
        ref={howRef}
        className="agora-how-section"
        aria-labelledby="how-title"
      >
        <svg
          className="agora-how-depth"
          viewBox="0 0 1400 1800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="agora-how-grain"
              width="19"
              height="19"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="5" r="0.6" fill="#577bb8" opacity="0.16" />
              <circle cx="14" cy="14" r="0.45" fill="#577bb8" opacity="0.12" />
            </pattern>
          </defs>
          <g fill="#e8effc">
            <rect
              x="-210"
              y="180"
              width="460"
              height="560"
              rx="90"
              transform="rotate(-16 20 460)"
            />
            <rect
              x="1180"
              y="720"
              width="430"
              height="600"
              rx="100"
              transform="rotate(14 1395 1020)"
            />
          </g>
          <g fill="none" stroke="#d8e4f8" strokeWidth="1.5">
            <rect
              x="-180"
              y="215"
              width="460"
              height="560"
              rx="90"
              transform="rotate(-16 50 495)"
            />
            <rect
              x="1150"
              y="755"
              width="430"
              height="600"
              rx="100"
              transform="rotate(14 1365 1055)"
            />
          </g>
          <path d="M-90 1380Q170 1270 260 1530L330 1800H-90Z" fill="#e2f2eb" />
          <rect width="1400" height="1800" fill="url(#agora-how-grain)" />
        </svg>
        <svg
          className="agora-how-backdrop"
          viewBox="0 0 1400 1800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M-120 80H110Q190 80 190 160V480Q190 560 110 560H-120M1520 660H1320Q1240 660 1240 740V1120Q1240 1200 1320 1200H1520M-100 1300H100Q180 1300 180 1380V1720" />
        </svg>
        <div className="agora-how-route" aria-hidden="true">
          <span />
        </div>
        <div className="agora-how-heading">
          <span className="agora-how-label">Cómo funciona</span>
          <h2 id="how-title">Tu idea toma forma</h2>
          <p>
            Un recorrido guiado para convertir lo que imaginas en un proyecto
            bien estructurado.
          </p>
        </div>
        <div className="agora-context-step">
          <div className="agora-context-copy">
            <div className="agora-step-heading">
              <span
                className="agora-context-step-number"
                role="img"
                aria-label="Paso 1"
              >
                1
              </span>
              <h3>Construye el contexto</h3>
            </div>
            <p>
              Ágora identifica vacíos y te hace preguntas concretas para
              complementar mejor tu idea de forma guiada.
            </p>
            <p className="agora-context-detail">
              Cada respuesta ayuda a comprender el problema, a quiénes afecta y
              qué quieres transformar.
            </p>
          </div>
          <ContextStepDemo />
        </div>
        <div className="agora-context-step" id="revisa-borrador">
          <div className="agora-context-copy">
            <div className="agora-step-heading">
              <span
                className="agora-context-step-number"
                role="img"
                aria-label="Paso 2"
              >
                2
              </span>
              <h3>Revisa el borrador hecho con Ágora</h3>
            </div>
            <p>
              Edita, valida y aprueba cada componente antes de consolidar el
              documento final.
            </p>
          </div>
          <ReviewStepDemo />
        </div>
        <div className="agora-context-step" id="documento-ensamblado">
          <div className="agora-context-copy">
            <div className="agora-step-heading">
              <span
                className="agora-context-step-number"
                role="img"
                aria-label="Paso 3"
              >
                3
              </span>
              <h3>Un documento completo y ensamblado</h3>
            </div>
            <p>
              Una vez hayas revisado y aprobado cada componente, Ágora consolida
              el documento final.
            </p>
          </div>
          <AssemblyStepDemo />
        </div>
      </section>

      <section
        id="skills"
        className="agora-catalog"
        aria-labelledby="catalog-title"
      >
        <div className="agora-catalog-inner">
          <div className="agora-catalog-heading">
            <div>
              <p className="agora-catalog-label">Skills especializadas</p>
              <h2 id="catalog-title">Un acompañamiento para cada reto</h2>
              <p className="agora-catalog-intro">
                Cada skill adapta la conversación y la estructura al tipo de
                iniciativa que quieres formular.
              </p>
            </div>
            <Link className="agora-catalog-all" to="/skills">
              Ver todas las skills <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          {skillsQuery.isSuccess ? (
            <div className="agora-catalog-grid">
              {skillsQuery.data
                .filter((skill) => skill.id !== 'research-projects')
                .map((skill) => (
                  <LandingSkillCard key={skill.id} skill={skill} />
                ))}
            </div>
          ) : skillsQuery.isError ? (
            <div className="agora-catalog-feedback">
              <p>No pudimos cargar las skills disponibles.</p>
              <button type="button" onClick={() => void skillsQuery.refetch()}>
                Intentar nuevamente
              </button>
            </div>
          ) : (
            <p className="agora-catalog-feedback" role="status">
              Cargando skills…
            </p>
          )}
        </div>
      </section>
    </>
  )
}
