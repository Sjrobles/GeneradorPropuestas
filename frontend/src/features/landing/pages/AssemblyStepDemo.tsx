import {
  Check,
  FileCheck2,
  FileText,
  Layers,
  LoaderCircle,
  History,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import './assembly-step.css'

const sections = [
  'Marco teórico',
  'Objetivos y metodología',
  'Cronograma y presupuesto',
]

export function AssemblyStepDemo() {
  const container = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const element = container.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={container}
      className={`agora-assembly-demo${started ? ' is-assembling' : ''}`}
      data-ui
      aria-label="Demostración de ensamblaje del documento final"
    >
      <div className="agora-assembly-process">
        <div className="agora-assembly-heading">
          <span className="agora-assembly-icon">
            <Layers size={23} aria-hidden="true" />
          </span>
          <div>
            <h4>Documento final</h4>
            <p>Tus componentes, en un solo documento.</p>
          </div>
        </div>
        <div className="agora-assembly-state">
          <span className="agora-assembly-working">
            <LoaderCircle size={16} aria-hidden="true" /> Integrando las últimas
            versiones…
          </span>
          <span className="agora-assembly-ready">
            <FileCheck2 size={17} aria-hidden="true" /> Documento consolidado
          </span>
        </div>
        <div className="agora-assembly-track" aria-hidden="true">
          <span />
        </div>
        <div className="agora-assembly-sections">
          {sections.map((section, index) => (
            <div
              className={`agora-assembly-section agora-assembly-section-${index}`}
              key={section}
            >
              <FileText size={16} aria-hidden="true" />
              <span>{section}</span>
              <Check size={17} aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="agora-assembly-document">
          <div className="agora-assembly-document-title">
            <FileCheck2 size={20} aria-hidden="true" />
            <span>Proyecto de Ciencia, Tecnología e Innovación</span>
          </div>
          <p>Talleres de inteligencia artificial en colegios públicos</p>
          <span className="agora-assembly-document-note">
            Contenido revisado y aprobado
          </span>
        </div>
        <div className="agora-assembly-phases">
          <span>
            <History size={14} aria-hidden="true" /> Recuperar versiones
          </span>
          <span>Ordenar secciones</span>
          <span>Consolidar documento</span>
        </div>
      </div>
      <article
        className="agora-assembly-preview"
        aria-label="Vista previa del documento consolidado"
      >
        <div className="agora-document-finished">
          <FileCheck2 size={16} aria-hidden="true" /> Documento consolidado
        </div>
        <p className="agora-document-kind">
          Proyecto de Ciencia, Tecnología e Innovación
        </p>
        <h4>Talleres de inteligencia artificial en colegios públicos</h4>
        <div className="agora-document-meta">
          <span>Idioma: ES</span>
          <span>Contenido aprobado</span>
        </div>
        <div className="agora-document-section">
          <span className="agora-document-index">1</span>
          <h5>Marco teórico</h5>
        </div>
        <p className="agora-document-paragraph">
          La alfabetización en inteligencia artificial permite a los estudiantes
          comprender estas tecnologías y utilizarlas de manera crítica y
          responsable.
        </p>
        <div className="agora-document-section">
          <span className="agora-document-index">2</span>
          <h5>Metodología</h5>
        </div>
        <p className="agora-document-paragraph">
          Los talleres combinan actividades prácticas y evaluación de
          aprendizajes, de acuerdo con el contexto de cada colegio.
        </p>
        <div className="agora-document-footer">
          <Check size={14} aria-hidden="true" /> Componentes integrados en el
          orden correcto
        </div>
      </article>
    </div>
  )
}
