import { ArrowLeft, Download, FileText, Languages, Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useDocumentQuery } from '@/features/documents/hooks/use-documents'
import {
  parseDocumentContent,
  parseInlineFormatting,
  type DocumentTextAlignment,
} from '@/services/documents/document-markup'

const alignmentClasses: Record<DocumentTextAlignment, string> = {
  center: 'text-center',
  justify: 'text-justify',
  left: 'text-left',
  right: 'text-right',
}

function inlineFormatting(text: string): ReactNode[] {
  return parseInlineFormatting(text).map((segment, index) => {
    const key = `${segment.bold}-${segment.italic}-${segment.underline}-${segment.content}-${index}`
    let formatted: ReactNode = segment.content
    if (segment.underline) formatted = <u>{formatted}</u>
    if (segment.italic) formatted = <em>{formatted}</em>
    if (segment.bold) {
      formatted = (
        <strong className="font-bold text-[#1d2f5c]">{formatted}</strong>
      )
    }
    if (segment.href) {
      formatted = (
        <a
          className="font-semibold text-primary underline"
          href={segment.href}
          rel="noreferrer"
          target="_blank"
        >
          {formatted}
        </a>
      )
    }
    return <span key={key}>{formatted}</span>
  })
}

function paragraphContent(text: string) {
  const label = text.match(/^([^:\n]{2,52}):\s+([\s\S]+)$/)
  if (!label) return inlineFormatting(text)

  return (
    <>
      <strong className="font-bold text-[#1d2f5c]">{label[1]}:</strong>{' '}
      {inlineFormatting(label[2])}
    </>
  )
}

function DocumentSectionContent({ content }: { content: string }) {
  return (
    <div className="mt-7 space-y-5">
      {parseDocumentContent(content).map((segment, index) => {
        const key = `${segment.type}-${segment.number ?? index}-${index}`
        if (segment.type === 'heading') {
          return (
            <h3
              key={key}
              className={`pt-3 font-sans text-sm font-extrabold uppercase leading-6 tracking-[0.08em] text-[#27488f] ${alignmentClasses[segment.alignment]}`}
            >
              {inlineFormatting(segment.content)}
            </h3>
          )
        }

        if (segment.type === 'table' && segment.headers && segment.rows) {
          return (
            <div
              key={key}
              className="overflow-x-auto rounded-xl border border-[#dbe3f0]"
            >
              <table className="min-w-[980px] border-collapse text-left font-sans text-xs text-[#34415a]">
                <thead className="bg-[#eaf1ff] text-[#1d2f5c]">
                  <tr>
                    {segment.headers.map((header) => (
                      <th
                        key={header}
                        className="border-b border-r border-[#cfd9eb] px-3 py-3 font-extrabold last:border-r-0"
                        scope="col"
                      >
                        {inlineFormatting(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {segment.rows.map((row, rowIndex) => (
                    <tr
                      key={`${row.join('-')}-${rowIndex}`}
                      className="even:bg-[#f8faff]"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          className="border-b border-r border-[#e1e7f0] px-3 py-3 align-top leading-5 last:border-r-0"
                        >
                          {inlineFormatting(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        if (segment.type === 'numbered' || segment.type === 'bullet') {
          return (
            <div
              key={key}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 rounded-2xl border border-[#e3e8f1] bg-[#f8faff] px-4 py-4 sm:px-5"
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#e6eeff] font-sans text-xs font-extrabold text-primary">
                {segment.type === 'bullet' ? '•' : segment.number}
              </span>
              <p className="font-serif text-[16px] leading-8 text-[#36445d] sm:text-[17px] sm:leading-[2rem] sm:text-justify">
                {paragraphContent(segment.content)}
              </p>
            </div>
          )
        }

        return (
          <p
            key={key}
            className={`font-serif text-[16px] leading-8 text-[#36445d] sm:text-[17px] sm:leading-[2.05rem] ${alignmentClasses[segment.alignment]}`}
          >
            {paragraphContent(segment.content)}
          </p>
        )
      })}
    </div>
  )
}

export function DocumentPreviewPage() {
  const { projectId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedLanguage = searchParams.get('language') === 'en' ? 'en' : 'es'
  const documentQuery = useDocumentQuery(projectId, requestedLanguage)
  const [navigationOpen, setNavigationOpen] = useState(false)

  if (documentQuery.isPending) {
    return <LoadingState label="Preparando la vista previa…" />
  }
  if (documentQuery.isError) {
    return (
      <ErrorState
        title="El documento aún no está listo"
        description="Completa primero el ensamblaje para consultar la vista previa."
      />
    )
  }

  const document = documentQuery.data

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#eef2f8] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 text-xs font-extrabold text-primary no-underline"
            to={`/projects/${projectId}/review`}
          >
            <ArrowLeft aria-hidden="true" size={15} /> Volver a revisión
          </Link>
          <div className="flex flex-wrap gap-2">
            {document.language === 'es' ? (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dbe3f0] bg-white px-4 text-xs font-extrabold text-[#20325e] no-underline"
                to={`/projects/${projectId}/translation`}
              >
                <Languages aria-hidden="true" size={16} /> Traducir al inglés
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dbe3f0] bg-white px-4 text-xs font-extrabold text-[#20325e] no-underline"
                to={`/projects/${projectId}/document`}
              >
                <Languages aria-hidden="true" size={16} /> Ver original en
                español
              </Link>
            )}
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold text-white no-underline"
              to={`/projects/${projectId}/export?language=${document.language}`}
            >
              <Download aria-hidden="true" size={16} /> Exportar
            </Link>
          </div>
        </div>

        <header className="mt-5 rounded-2xl border border-[#dbe3f0] bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf1ff] text-primary">
              <FileText aria-hidden="true" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                Documento consolidado · {document.language.toUpperCase()}
              </p>
              <h1 className="mt-1 truncate text-xl font-extrabold text-[#20325e] sm:text-2xl">
                {document.title}
              </h1>
            </div>
            <button
              className="ml-auto grid size-10 place-items-center rounded-xl border border-border bg-white text-[#52617a] lg:hidden"
              type="button"
              aria-label="Mostrar secciones"
              onClick={() => setNavigationOpen((open) => !open)}
            >
              <Menu aria-hidden="true" size={19} />
            </button>
          </div>
        </header>

        <div className="mt-5 grid items-start justify-center gap-6 lg:grid-cols-[280px_minmax(0,920px)]">
          <aside
            className={`${navigationOpen ? 'block' : 'hidden'} overflow-hidden rounded-2xl border border-[#dbe3f0] bg-white shadow-sm lg:sticky lg:top-[calc(var(--header-height)+1.25rem)] lg:block`}
          >
            <div className="border-b border-[#e7ebf2] bg-[#f8faff] px-5 py-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">
                Navegación
              </p>
              <h2 className="mt-1 text-sm font-extrabold text-[#20325e]">
                Contenido del proyecto
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-[#7a879b]">
                {document.sections.length} apartados consolidados
              </p>
            </div>
            <nav
              aria-label="Secciones del documento"
              className="max-h-[calc(100dvh-var(--header-height)-12rem)] space-y-1 overflow-y-auto p-3"
            >
              {document.sections.map((section) => (
                <a
                  key={section.id}
                  className="group flex min-h-11 items-center gap-3 rounded-xl px-2.5 text-xs font-bold leading-4 text-[#5e6c83] no-underline transition hover:bg-[#edf3ff] hover:text-primary"
                  href={`#section-${section.id}`}
                  onClick={() => setNavigationOpen(false)}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#dce4f4] bg-[#f4f7fc] text-[10px] font-extrabold text-[#71809a] transition group-hover:border-primary/25 group-hover:bg-white group-hover:text-primary">
                    {String(section.order).padStart(2, '0')}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="overflow-hidden rounded-[1.5rem] border border-[#d8deea] bg-[#fffefd] shadow-[0_22px_60px_rgba(30,49,95,0.11)]">
            <div className="border-b border-[#dfe3ec] bg-[linear-gradient(145deg,#ffffff_0%,#f7f9fe_100%)] px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
                Borrador de proyecto CTeI
              </p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.12] tracking-[-0.025em] text-[#172a55] sm:text-5xl">
                {document.title}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-[#66738a]">
                <span className="rounded-full border border-[#dfe5ef] bg-white px-3 py-1.5">
                  {document.sections.length} apartados
                </span>
                <span className="rounded-full border border-[#dfe5ef] bg-white px-3 py-1.5">
                  Idioma: {document.language.toUpperCase()}
                </span>
                <span className="rounded-full border border-[#dfe5ef] bg-white px-3 py-1.5">
                  Generado el{' '}
                  {new Date(document.generatedAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#e6e9f0] px-6 sm:px-10 lg:px-16">
              {document.sections.map((section) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-28 py-11 sm:py-14"
                >
                  <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf1ff] text-sm font-extrabold text-primary sm:size-14">
                      {String(section.order).padStart(2, '0')}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#8390a5]">
                        Apartado del proyecto
                      </p>
                      <h2 className="mt-1.5 font-sans text-2xl font-extrabold leading-tight tracking-[-0.02em] text-[#1c315f] sm:text-[2rem]">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <DocumentSectionContent content={section.content} />
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
