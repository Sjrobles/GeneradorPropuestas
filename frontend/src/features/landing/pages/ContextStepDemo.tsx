import { AgoraAssistantIcon } from '@/components/icons/AgoraAssistantIcon'
import { CircleDot, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import './context-step.css'

export function ContextStepDemo() {
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
    <div ref={container} className="agora-context-demo" data-ui>
      <div className="agora-context-chat-header">
        <span className="agora-context-avatar">
          <AgoraAssistantIcon size={23} aria-hidden="true" />
        </span>
        <div>
          <p>Asistente Ágora</p>
          <span>
            <CircleDot size={11} aria-hidden="true" /> En línea · Construyendo
            tu idea
          </span>
        </div>
      </div>
      <div
        className={`agora-context-conversation ${started ? 'is-playing' : ''}`}
        aria-label="Ejemplo de conversación guiada"
      >
        <div className="agora-context-message agora-context-intro">
          <AgoraAssistantIcon size={18} aria-hidden="true" />
          <p>
            ¡Hola! Soy Ágora. Te haré preguntas breves para comprender y
            estructurar tu idea.
          </p>
        </div>
        <div className="agora-context-message agora-context-question">
          <AgoraAssistantIcon size={18} aria-hidden="true" />
          <p>¿Qué problema o necesidad quieres resolver?</p>
        </div>
        <div className="agora-context-reply">
          <p>Quiero llevar talleres de IA a colegios públicos.</p>
          <span>Tú</span>
        </div>
        <div className="agora-context-message agora-context-followup">
          <AgoraAssistantIcon size={18} aria-hidden="true" />
          <p>
            ¿A qué estudiantes quieres llegar y qué oportunidades tienen hoy?
          </p>
        </div>
      </div>
      <div className="agora-context-input" aria-hidden="true">
        <span>Tu idea es el punto de partida…</span>
        <Send size={17} />
      </div>
    </div>
  )
}
