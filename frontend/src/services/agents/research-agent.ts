import { COMPONENT_TYPES } from '@/types/domain'

import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { requireContext } from './contracts'

export class ResearchAgent implements FormulationSubagent {
  generate({ context, type }: AgentGenerationInput) {
    const data = requireContext(context)

    if (type === COMPONENT_TYPES.THEORETICAL_FRAMEWORK) {
      return {
        type,
        content: `El marco conceptual de esta propuesta debe articular tres ejes derivados del contexto confirmado: el problema (${data.problem}), la población destinataria (${data.targetPopulation}) y la solución planteada (${data.proposedSolution}).\n\nEn esta versión mock no se incorporan autores, estadísticas ni referencias externas. Antes de presentar la propuesta, estos ejes deberán respaldarse con fuentes académicas e institucionales verificables y pertinentes para ${data.location}.`,
      }
    }

    if (type === COMPONENT_TYPES.STATE_OF_ART) {
      return {
        type,
        content: `El contexto disponible no incluye estudios previos ni fuentes documentales verificadas sobre ${data.problem.toLowerCase()}. Por esta razón, el estado del arte se conserva como una guía de investigación pendiente.\n\nLa revisión posterior deberá identificar experiencias comparables relacionadas con ${data.proposedSolution.toLowerCase()}, valorar sus resultados y precisar el vacío que atenderá el proyecto. No se generan referencias, DOI, autores o cifras ficticias.`,
      }
    }

    if (type === COMPONENT_TYPES.PROBLEM_STATEMENT) {
      return {
        type,
        content: `El proyecto parte del siguiente problema confirmado: ${data.problem}\n\nEsta situación afecta a ${data.targetPopulation} en ${data.location}. El alcance inicial es ${data.initialScope}. La formulación deberá profundizar sus causas y efectos únicamente con evidencia verificable, sin incorporar cifras o relaciones causales no aportadas por el usuario.`,
      }
    }

    if (type === COMPONENT_TYPES.BACKGROUND) {
      return {
        type,
        content: `Los antecedentes deben documentar iniciativas previas relacionadas con ${data.proposedSolution.toLowerCase()} y su respuesta frente a ${data.problem.toLowerCase()}.\n\nEl contexto confirmado todavía no aporta experiencias, resultados o evaluaciones verificables. Durante la revisión deberán añadirse antecedentes institucionales, territoriales o académicos pertinentes para ${data.location}, diferenciándolos del estado actual del conocimiento.`,
      }
    }

    if (type === COMPONENT_TYPES.BIBLIOGRAPHY) {
      return {
        type,
        content: `Bibliografía pendiente de verificación.\n\nIncluye aquí las fuentes académicas, institucionales y normativas utilizadas para sustentar el marco teórico, el estado del arte, el planteamiento del problema y los antecedentes. Cada referencia deberá comprobarse y presentarse con un estilo bibliográfico uniforme. Ágora no genera autores, títulos, DOI ni enlaces ficticios.`,
      }
    }

    throw new Error(`ResearchAgent no genera el componente ${type}.`)
  }
}
