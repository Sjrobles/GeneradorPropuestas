import {
  AlignLeft,
  Bold,
  Check,
  Italic,
  List,
  ShieldCheck,
  Lightbulb,
  PencilLine,
  Underline,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import './review-step.css'

export function ReviewStepDemo() {
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
      className={`agora-review-demo${started ? ' is-reviewing' : ''}`}
      data-ui
      aria-label="Demostración de revisión y aprobación de una metodología"
    >
      <div className="agora-review-heading">
        <h4>Metodología</h4>
        <div className="agora-review-status">
          <span className="agora-review-pending">En revisión</span>
          <span className="agora-review-approved">
            <ShieldCheck size={13} aria-hidden="true" /> Aprobado
          </span>
        </div>
      </div>
      <p className="agora-review-subtitle">
        Enfoque, fases y evidencias de ejecución.
      </p>
      <div className="agora-review-editor">
        <div className="agora-review-toolbar" aria-hidden="true">
          <span>Párrafo</span>
          <Bold size={14} />
          <Italic size={14} />
          <Underline size={14} />
          <List size={15} />
          <AlignLeft size={15} />
          <span className="agora-review-ai">
            <PencilLine size={14} /> Sugerir por IA
          </span>
        </div>
        <div className="agora-review-document">
          <p>
            El proyecto se desarrollará mediante talleres de inteligencia
            artificial en colegios públicos.
          </p>
          <div className="agora-review-edit">
            <p className="agora-review-before">
              Se realizarán actividades prácticas con los estudiantes.
            </p>
            <p className="agora-review-after">
              Cada taller incluirá una actividad práctica y una evaluación de
              los aprendizajes adquiridos.
            </p>
          </div>
          <p>
            Las evidencias de participación y los resultados de evaluación
            permitirán revisar el avance del proyecto.
          </p>
        </div>
      </div>
      <div className="agora-review-suggestion">
        <Lightbulb size={16} aria-hidden="true" />
        <p>
          <strong>Sugerencia de mejora</strong>
          <span>Define cómo comprobarás los resultados de cada taller.</span>
        </p>
      </div>
      <div className="agora-review-checks">
        <p>Criterios que debe cumplir:</p>
        <div>
          <span>Redacción clara y verificable</span>
          <Check
            size={17}
            className="agora-review-check-first"
            aria-hidden="true"
          />
        </div>
        <div>
          <span>Coherencia con el contexto</span>
          <Check
            size={17}
            className="agora-review-check-second"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
