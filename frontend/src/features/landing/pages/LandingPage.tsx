import {
  ArrowRight,
  Bot,
  Check,
  FileSearch,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { SkillCard } from '@/features/skills/components/SkillCard'
import { useSkillsQuery } from '@/features/skills/hooks/use-skills-query'

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
const PROCESS_DURATION = 3_600

const processSteps = [
  {
    icon: Lightbulb,
    number: '01',
    title: 'Comparte tu idea',
    text: 'Selecciona una skill y describe el punto de partida de tu proyecto.',
    detail: 'Ágora escucha y organiza tu intención inicial.',
  },
  {
    icon: MessageSquareText,
    number: '02',
    title: 'Construye el contexto',
    text: 'Ágora identifica vacíos y te hace preguntas concretas para completarlo.',
    detail: 'Cada respuesta fortalece la coherencia del proyecto.',
  },
  {
    icon: FileSearch,
    number: '03',
    title: 'Revisa el borrador',
    text: 'Edita, valida y aprueba cada componente antes de consolidar el documento.',
    detail: 'Tú mantienes la última palabra antes de avanzar.',
  },
] as const

function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0)
  const [displayedPrompt, setDisplayedPrompt] = useState('')

  useEffect(() => {
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
    <div className="relative mx-auto min-h-[560px] w-full max-w-[680px] lg:mx-0">
      <div className="absolute left-0 top-0 h-[370px] w-[82%] rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <h2 className="text-xl font-extrabold text-[#1f3268]">
          Formulación de proyectos
        </h2>
        <ol className="mt-7 space-y-4" aria-label="Progreso del proyecto">
          {steps.map((step, index) => {
            const isActive = index === activeStep
            const isComplete = index < activeStep

            return (
              <li key={step.label} className="flex items-center gap-4">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-all duration-500 ${
                    isActive
                      ? 'agora-workflow-active bg-[#2864ef] text-white shadow-[0_0_0_6px_rgba(40,100,239,0.12)]'
                      : isComplete
                        ? 'bg-[#2864ef] text-white'
                        : 'bg-[#eef3f8] text-[#95a6bf]'
                  }`}
                  aria-label={
                    isComplete
                      ? `${step.label}, completado`
                      : isActive
                        ? `${step.label}, en progreso`
                        : step.label
                  }
                >
                  {isComplete ? (
                    <Check aria-hidden="true" size={16} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-lg transition-colors duration-500 ${
                    isActive || isComplete
                      ? 'font-bold text-[#1f3268]'
                      : 'font-medium text-[#95a6bf]'
                  }`}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div
        key={activeStep}
        className="agora-chat-enter absolute right-0 top-14 w-[57%] rounded-[1.45rem] border border-[#dce4f0] bg-white px-6 py-5 shadow-card"
      >
        <p
          className="min-h-10 text-base font-extrabold leading-5 text-[#1f3268] sm:text-lg"
          aria-live="polite"
        >
          {displayedPrompt}
          <span className="agora-typing-cursor ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-0.5 bg-[#2864ef]" />
        </p>
        <div className="mt-3 h-px bg-[#dce4f0]" />
        <div className="mt-3 flex items-center gap-2" aria-hidden="true">
          <span className="agora-thinking-dot size-2 rounded-full bg-[#2864ef]" />
          <span className="agora-thinking-dot size-2 rounded-full bg-[#2864ef]" />
          <span className="agora-thinking-dot size-2 rounded-full bg-[#2864ef]" />
          <span className="ml-1 text-xs font-semibold text-[#72819b]">
            Analizando respuesta
          </span>
        </div>
        <div className="agora-generated-line mt-3 h-2 w-4/5 rounded-full bg-[#edf1f6]" />
        <div className="agora-generated-line mt-2 h-2 w-3/5 rounded-full bg-[#edf1f6]" />
        <span className="absolute -bottom-4 -right-3 grid size-16 place-items-center rounded-[1.1rem] bg-[#2864ef] text-white shadow-lg">
          <Sparkles aria-hidden="true" size={29} />
        </span>
      </div>

      <div className="absolute bottom-6 right-[10%] grid h-[230px] w-[170px] place-items-center overflow-hidden bg-gradient-to-br from-[#dceef8] to-[#82a8c5] text-[#2864ef] shadow-sm">
        <div className="absolute -bottom-16 size-44 rounded-full bg-[#245fdb]/20 blur-xl" />
        <FlaskConical
          className="relative drop-shadow-lg"
          aria-hidden="true"
          size={105}
          strokeWidth={1.2}
        />
      </div>

      <div className="absolute bottom-10 left-[28%] flex w-[54%] items-start gap-4 rounded-[1.35rem] border border-[#dce4f0] bg-white p-5 shadow-card">
        <span className="grid size-12 shrink-0 place-items-center rounded-[1rem] bg-[#eef3f8] text-[#2864ef]">
          <Bot aria-hidden="true" size={23} />
        </span>
        <div>
          <p className="text-lg font-extrabold text-[#1f3268]">
            Asistente Ágora
          </p>
          <p className="mt-1 text-sm leading-5 text-[#52617c]">
            Te ayuda a estructurar tu idea y convertirla en un proyecto.
          </p>
        </div>
      </div>
    </div>
  )
}

function HowItWorksDemo() {
  const [activeProcessStep, setActiveProcessStep] = useState(0)

  useEffect(() => {
    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false
    ) {
      return
    }

    const cycle = window.setInterval(() => {
      setActiveProcessStep(
        (currentStep) => (currentStep + 1) % processSteps.length,
      )
    }, PROCESS_DURATION)

    return () => window.clearInterval(cycle)
  }, [])

  return (
    <div className="relative mt-12">
      <div
        className="pointer-events-none absolute left-[15%] top-[-4.5rem] size-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-3rem] right-[8%] size-56 rounded-full bg-[#8eb5ff]/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative hidden h-1 overflow-hidden rounded-full bg-[#dfe6f3] md:block">
        <span
          className="agora-process-progress absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#2864ef] via-[#6d8eff] to-[#2864ef] shadow-[0_0_18px_rgba(40,100,239,0.65)]"
          style={{
            width: `${((activeProcessStep + 1) / processSteps.length) * 100}%`,
          }}
        />
      </div>

      <div className="relative mt-5 grid gap-5 md:grid-cols-3">
        {processSteps.map((item, index) => {
          const Icon = item.icon
          const isActive = index === activeProcessStep
          const isComplete = index < activeProcessStep

          return (
            <button
              key={item.number}
              type="button"
              aria-pressed={isActive}
              aria-label={`Paso ${item.number}: ${item.title}`}
              className={`agora-process-card group relative flex min-h-[21rem] flex-col overflow-hidden rounded-[1.4rem] border p-6 text-left text-foreground transition-all duration-700 focus-visible:outline-none md:min-h-[23rem] md:p-8 ${
                isActive
                  ? 'is-active -translate-y-3 border-[#a9bdf8] bg-[linear-gradient(145deg,#ffffff_0%,#f8faff_55%,#eef3ff_100%)] shadow-[0_30px_75px_rgba(40,74,170,0.18)] ring-4 ring-primary/10'
                  : 'border-border bg-card text-foreground shadow-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-card'
              }`}
              onClick={() => setActiveProcessStep(index)}
            >
              <span
                className={`pointer-events-none absolute inset-2 rounded-[1rem] border transition-opacity duration-500 ${
                  isActive
                    ? 'border-primary/10 opacity-100'
                    : 'border-transparent opacity-0'
                }`}
                aria-hidden="true"
              />
              <span
                className="agora-process-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#8ba9ff]/20 to-transparent"
                aria-hidden="true"
              />
              <span
                className={`agora-process-orbit pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border transition-all duration-700 ${
                  isActive
                    ? 'scale-100 border-primary/15 bg-[radial-gradient(circle_at_center,rgba(40,100,239,0.1),transparent_68%)]'
                    : 'scale-75 border-primary/5 bg-secondary/40'
                }`}
                aria-hidden="true"
              >
                <span className="absolute inset-8 rounded-full border border-dashed border-primary/15" />
              </span>

              <span className="relative flex items-center justify-between">
                <span
                  className={`agora-process-icon grid size-14 place-items-center rounded-[1rem] transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#2864ef] to-[#7695f8] text-white shadow-[0_15px_35px_rgba(40,100,239,0.3)] ring-4 ring-white'
                      : isComplete
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-primary'
                  }`}
                >
                  {isComplete && !isActive ? (
                    <Check aria-hidden="true" size={25} />
                  ) : (
                    <Icon aria-hidden="true" size={25} />
                  )}
                </span>
                <span
                  className={`text-5xl font-black tracking-[-0.06em] transition-colors duration-500 ${
                    isActive ? 'text-primary/20' : 'text-[#dce3f0]'
                  }`}
                >
                  {item.number}
                </span>
              </span>

              <span className="relative mt-8 block md:mt-10">
                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] transition-all duration-500 ${
                    isActive
                      ? 'translate-y-0 bg-primary/10 text-primary opacity-100'
                      : 'translate-y-2 text-primary opacity-0'
                  }`}
                >
                  Paso activo
                </span>
                <span className="mt-2 block text-2xl font-extrabold">
                  {item.title}
                </span>
                <span
                  className={`mt-4 block leading-7 transition-colors duration-500 ${
                    isActive ? 'text-[#52617c]' : 'text-muted-foreground'
                  }`}
                >
                  {item.text}
                </span>
              </span>

              <span
                className={`relative mt-auto flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-500 ${
                  isActive
                    ? 'translate-y-0 border-primary/10 bg-white/75 text-[#3158c8] opacity-100 shadow-sm backdrop-blur'
                    : 'translate-y-2 border-transparent bg-transparent text-primary opacity-0'
                }`}
              >
                <Sparkles aria-hidden="true" size={16} />
                {item.detail}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className="mt-7 flex justify-center gap-2"
        aria-label="Seleccionar etapa"
      >
        {processSteps.map((item, index) => (
          <button
            key={item.number}
            type="button"
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index === activeProcessStep
                ? 'w-10 bg-primary'
                : 'w-2.5 bg-[#cbd5e6] hover:bg-primary/50'
            }`}
            aria-label={`Mostrar ${item.title}`}
            aria-pressed={index === activeProcessStep}
            onClick={() => setActiveProcessStep(index)}
          />
        ))}
      </div>
    </div>
  )
}

export function LandingPage() {
  const skillsQuery = useSkillsQuery()

  return (
    <>
      <section
        id="producto"
        className="relative overflow-hidden border-b border-border bg-[#f4f7fd]"
      >
        <div className="relative mx-auto grid max-w-[90rem] gap-16 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[760px] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-12 lg:py-24 xl:gap-16">
          <div className="max-w-[50rem]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#dfebff] px-4 py-2 text-sm font-bold text-[#2864ef] sm:text-base">
              <Network aria-hidden="true" size={19} strokeWidth={2.6} />
              IA para la Ciencia, Tecnología e Innovación
            </span>
            <h1 className="mt-8 font-sans text-[3.35rem] font-extrabold leading-[1.04] tracking-[-0.025em] text-[#1f3268] sm:text-[4.1rem] lg:text-[4.1rem]">
              <span className="lg:block">Formula proyectos CTeI</span>{' '}
              <span className="lg:block">
                de alto impacto con{' '}
                <span className="agora-ia-impact whitespace-nowrap">IA</span>
              </span>
            </h1>
            <p className="mt-7 max-w-[47rem] text-lg leading-8 text-[#52617c] sm:text-[1.35rem] sm:leading-9">
              Ágora te acompaña en cada etapa de la formulación de proyectos de
              Ciencia, Tecnología e Innovación, integrando inteligencia
              artificial y conocimiento especializado.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
              <Link
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-[#21356d] px-8 text-lg font-bold text-white no-underline transition hover:bg-[#172958]"
                to="/skills"
              >
                <Sparkles aria-hidden="true" size={20} />
                Comenzar gratis
              </Link>
              <a
                className="inline-flex min-h-14 items-center justify-center gap-3 px-2 text-lg font-bold text-[#21356d] no-underline transition hover:text-[#2864ef]"
                href="#skills"
              >
                Explorar Skills
                <ArrowRight aria-hidden="true" size={21} />
              </a>
            </div>
            <div className="mt-14 grid gap-5 text-sm font-medium text-[#52617c] sm:grid-cols-3 sm:gap-6">
              <span className="inline-flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/70 text-[#2864ef]">
                  <GraduationCap aria-hidden="true" size={20} />
                </span>
                Rigurosidad académica y metodológica
              </span>
              <span className="inline-flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/70 text-[#2864ef]">
                  <ShieldCheck aria-hidden="true" size={20} />
                </span>
                Confidencialidad y seguridad
              </span>
              <span className="inline-flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/70 text-[#2864ef]">
                  <UserRound aria-hidden="true" size={20} />
                </span>
                Diseñado para investigadores
              </span>
            </div>
          </div>

          <WorkflowDemo />
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-b border-border bg-background"
      >
        <div className="mx-auto max-w-(--content-width) px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Cómo funciona
            </p>
            <h2 className="mt-3 font-sans text-4xl font-extrabold tracking-tight sm:text-5xl">
              Estructura sin quitarte el control
            </h2>
          </div>
          <HowItWorksDemo />
        </div>
      </section>

      <section id="skills" className="bg-card">
        <div className="mx-auto max-w-(--content-width) px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Skills especializadas
              </p>
              <h2 className="mt-3 font-sans text-4xl font-extrabold tracking-tight sm:text-5xl">
                Un acompañamiento para cada reto
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Cada skill adapta la conversación y la estructura al tipo de
                iniciativa.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 font-bold text-primary"
              to="/skills"
            >
              Ver todas las skills
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          {skillsQuery.isSuccess ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {skillsQuery.data.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="mt-10 min-h-48 animate-pulse rounded-lg bg-muted" />
          )}
        </div>
      </section>
    </>
  )
}
