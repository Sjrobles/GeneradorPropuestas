import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  FileDown,
  Lightbulb,
  Search,
  Settings2,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'

interface HelpTopic {
  category: string
  description: string
  icon: typeof CircleHelp
  id: string
  keywords: string[]
  steps: string[]
  title: string
}

const helpTopics: HelpTopic[] = [
  {
    category: 'Inicio y cuenta',
    description:
      'Inicia sesión, selecciona una skill y encuentra los proyectos guardados en tu perfil.',
    icon: BookOpenCheck,
    id: 'start',
    keywords: ['cuenta', 'perfil', 'sesión', 'proyecto', 'skill', 'guardado'],
    steps: [
      'Inicia sesión con el mismo perfil con el que creaste el proyecto.',
      'En Skills, abre “Mis proyectos” para recuperar proyectos terminados o pendientes y continuar desde el último paso guardado.',
      'Selecciona la skill antes de crear un proyecto nuevo.',
    ],
    title: 'Acceso y proyectos guardados',
  },
  {
    category: 'Contexto y diagnóstico',
    description:
      'Completa la información base y resuelve las preguntas necesarias antes de formular.',
    icon: Lightbulb,
    id: 'context',
    keywords: ['contexto', 'diagnóstico', 'preguntas', 'duración', 'problema'],
    steps: [
      'Describe problema, población, territorio, solución, alcance, resultados y duración.',
      'Ejecuta el diagnóstico y responde las aclaraciones marcadas como necesarias.',
      'Confirma el contexto únicamente cuando el resumen represente fielmente el proyecto.',
    ],
    title: 'Completar contexto y diagnóstico',
  },
  {
    category: 'Metodología y presupuesto',
    description:
      'Alinea actividades, recursos, tiempos, entregables, evidencias y datos económicos.',
    icon: Settings2,
    id: 'execution',
    keywords: [
      'metodología',
      'presupuesto',
      'recursos',
      'cronograma',
      'actividades',
    ],
    steps: [
      'Consulta arriba los objetivos y actividades creados por Ideación.',
      'Responde las nueve preguntas operativas con cantidades y duraciones aproximadas.',
      'Confirma las respuestas para habilitar Metodología y Presupuesto.',
    ],
    title: 'Preparar metodología y presupuesto',
  },
  {
    category: 'Generación con agentes',
    description:
      'Comprende el orden de los agentes y cómo continuar si una generación se interrumpe.',
    icon: Sparkles,
    id: 'generation',
    keywords: ['agentes', 'generación', 'error', 'reintentar', 'api'],
    steps: [
      'Ágora ejecuta Investigación, Ideación, Metodología, Presupuesto e Impacto, en ese orden.',
      'Los agentes completados quedan persistidos aunque uno posterior falle.',
      'Usa “Reintentar desde el agente con error” para continuar sin repetir los anteriores.',
    ],
    title: 'Generar componentes y reanudar errores',
  },
  {
    category: 'Revisión y edición',
    description:
      'Edita, guarda y aprueba cada componente antes de ensamblar el documento.',
    icon: ClipboardCheck,
    id: 'review',
    keywords: [
      'editar',
      'guardar',
      'aprobar',
      'negrilla',
      'cursiva',
      'revisión',
    ],
    steps: [
      'Selecciona un componente en la columna izquierda y realiza los ajustes.',
      'Usa la barra de formato y guarda los cambios antes de cambiar de componente.',
      'Aprueba los trece componentes para habilitar el ensamblaje.',
    ],
    title: 'Revisar, editar y aprobar',
  },
  {
    category: 'Presupuesto',
    description:
      'Interpreta la tabla de costos y corrige únicamente el componente presupuestal.',
    icon: WalletCards,
    id: 'budget',
    keywords: [
      'presupuesto',
      'tabla',
      'costo',
      'rubro',
      'total',
      'estimado',
      'excel',
      'xlsx',
    ],
    steps: [
      'Verifica la relación Objetivo → Actividad → Rubro de cada partida.',
      'Comprueba costo unitario, unidad, cantidad y total; las estimaciones deben conservar un valor numérico.',
      'Usa “Descargar Excel” para editar el presupuesto por rubros. Conserva las ocho columnas y vuelve a cargar el .xlsx con “Subir Excel editado”; Ágora reconstruirá la tabla y recalculará los totales.',
      'Usa “Regenerar fragmento” si necesitas recalcularlo sin ejecutar los demás agentes. El proyecto dispone de tres regeneraciones de fragmentos en total.',
    ],
    title: 'Validar la tabla presupuestal',
  },
  {
    category: 'Documento y exportación',
    description:
      'Ensambla el documento y conserva formato al descargarlo en DOCX o PDF.',
    icon: FileDown,
    id: 'document',
    keywords: ['documento', 'ensamblar', 'docx', 'pdf', 'exportar', 'formato'],
    steps: [
      'Aprueba todos los componentes antes de ensamblar.',
      'Revisa el documento consolidado y realiza los últimos ajustes de formato.',
      'Exporta a DOCX para edición posterior o a PDF para una versión final de lectura.',
    ],
    title: 'Ensamblar y exportar documentos',
  },
]

function topicForPath(pathname: string): string {
  if (/\/execution-details$/.test(pathname)) return 'execution'
  if (/\/generation$/.test(pathname)) return 'generation'
  if (/\/(review|components\/[^/]+)$/.test(pathname)) return 'review'
  if (/\/(document(?:\/assemble)?|translation|export|complete)$/.test(pathname))
    return 'document'
  if (/\/(chat|context)$/.test(pathname)) return 'context'
  return 'start'
}

export function HelpCenterPage() {
  const { search } = useLocation()
  const parameters = useMemo(() => new URLSearchParams(search), [search])
  const requestedFrom = parameters.get('from') ?? ''
  const safeFrom = requestedFrom.startsWith('/') ? requestedFrom : '/skills'
  const requestedTopic = parameters.get('topic')
  const contextualTopicId =
    requestedTopic && helpTopics.some(({ id }) => id === requestedTopic)
      ? requestedTopic
      : topicForPath(safeFrom)
  const contextualTopic = helpTopics.find(({ id }) => id === contextualTopicId)!
  const [query, setQuery] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const filteredTopics = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return helpTopics
    return helpTopics.filter((topic) =>
      [topic.title, topic.category, topic.description, ...topic.keywords]
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(normalized),
    )
  }, [query])

  const copyDiagnostic = async () => {
    const diagnostic = [
      'Diagnóstico de soporte de Ágora',
      `Pantalla: ${safeFrom}`,
      `Tema sugerido: ${contextualTopic.title}`,
      `Fecha: ${new Date().toISOString()}`,
      `Conectividad: ${navigator.onLine ? 'en línea' : 'sin conexión'}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(diagnostic)
      setCopyStatus('Diagnóstico copiado. Compártelo con el equipo técnico.')
    } catch {
      setCopyStatus(
        'No fue posible copiarlo. Incluye la ruta actual al reportar el caso.',
      )
    }
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#1e315f,#315be0)] px-6 py-9 text-white shadow-xl shadow-primary/15 sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#cddcff]">
                Ayuda práctica y contextual
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
                Centro de ayuda de Ágora
              </h1>
              <p className="mt-4 max-w-xl leading-7 text-[#e1e9ff]">
                Encuentra instrucciones por etapa, soluciones a bloqueos y
                criterios para revisar tu formulación.
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#20325e] no-underline"
              to={safeFrom}
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Volver a la pantalla anterior
            </Link>
          </div>
          <label className="relative mt-7 block max-w-3xl">
            <span className="sr-only">Buscar en el centro de ayuda</span>
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64728b]"
              size={20}
            />
            <input
              className="min-h-14 w-full rounded-2xl border-0 bg-white pl-12 pr-4 text-sm font-semibold text-[#25324b] outline-none ring-primary placeholder:text-[#8b98ad] focus:ring-4"
              placeholder="Buscar: presupuesto, exportar PDF, aprobar…"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <section className="mt-6 rounded-2xl border border-[#cddcf5] bg-[#edf4ff] p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
              <contextualTopic.icon aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">
                Ayuda para esta pantalla
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-[#20325e]">
                {contextualTopic.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#56657d]">
                {contextualTopic.description}
              </p>
              <ol className="mt-4 grid gap-2 text-sm text-[#33415b] lg:grid-cols-3">
                {contextualTopic.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-2 rounded-xl bg-white/80 p-3"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dfeaff] text-xs font-extrabold text-primary">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                  Guías paso a paso
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#20325e]">
                  ¿Qué necesitas resolver?
                </h2>
              </div>
              <span className="text-xs font-bold text-[#7d8aa0]">
                {filteredTopics.length} resultados
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {filteredTopics.map((topic) => (
                <details
                  key={topic.id}
                  open={topic.id === contextualTopicId && !query}
                  className="group rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-primary">
                      <topic.icon aria-hidden="true" size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <small className="block text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a97ab]">
                        {topic.category}
                      </small>
                      <strong className="mt-0.5 block text-base text-[#25324b]">
                        {topic.title}
                      </strong>
                    </span>
                    <span className="text-xl font-bold text-primary group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-[#e7ecf3] pt-4 text-sm leading-6 text-[#617089]">
                    {topic.description}
                  </p>
                  <ol className="mt-3 space-y-2">
                    {topic.steps.map((step) => (
                      <li
                        key={step}
                        className="flex gap-2 text-sm leading-6 text-[#34415a]"
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#18a975]"
                          size={16}
                        />
                        {step}
                      </li>
                    ))}
                  </ol>
                </details>
              ))}
              {!filteredTopics.length ? (
                <div className="rounded-2xl border border-dashed border-[#c9d4e5] bg-white p-8 text-center">
                  <CircleHelp
                    className="mx-auto text-[#8b98ad]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-bold text-[#34415a]">
                    No encontramos una guía con ese término.
                  </p>
                  <button
                    className="mt-3 text-sm font-extrabold text-primary"
                    type="button"
                    onClick={() => setQuery('')}
                  >
                    Ver todas las guías
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
            <section className="rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-[#20325e]">
                Accesos rápidos
              </h2>
              <div className="mt-3 grid gap-2">
                <Link
                  className="rounded-xl bg-[#f3f6fb] px-4 py-3 text-sm font-bold text-[#34415a] no-underline hover:bg-[#eaf1ff] hover:text-primary"
                  to="/skills"
                >
                  Mis proyectos y documentos
                </Link>
                <Link
                  className="rounded-xl bg-[#f3f6fb] px-4 py-3 text-sm font-bold text-[#34415a] no-underline hover:bg-[#eaf1ff] hover:text-primary"
                  to="/projects/new"
                >
                  Crear un proyecto
                </Link>
                <button
                  className="rounded-xl bg-[#f3f6fb] px-4 py-3 text-left text-sm font-bold text-[#34415a] hover:bg-[#eaf1ff] hover:text-primary"
                  type="button"
                  onClick={() => setQuery('presupuesto')}
                >
                  Ayuda con el presupuesto
                </button>
                <button
                  className="rounded-xl bg-[#f3f6fb] px-4 py-3 text-left text-sm font-bold text-[#34415a] hover:bg-[#eaf1ff] hover:text-primary"
                  type="button"
                  onClick={() => setQuery('exportar')}
                >
                  Ayuda con la exportación
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-[#20325e] p-5 text-white shadow-sm">
              <h2 className="text-base font-extrabold">
                ¿Necesitas escalar un error?
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#d7e1f5]">
                Copia un diagnóstico con la pantalla y el tema actual para que
                el equipo técnico pueda ubicar el caso rápidamente.
              </p>
              <button
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-[#20325e]"
                type="button"
                onClick={() => void copyDiagnostic()}
              >
                <ClipboardCheck aria-hidden="true" size={16} />
                Copiar diagnóstico técnico
              </button>
              {copyStatus ? (
                <p
                  className="mt-3 text-xs leading-5 text-[#d7e1f5]"
                  role="status"
                >
                  {copyStatus}
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
