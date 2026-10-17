import { COMPONENT_TYPES } from '@/types/domain'

import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { requireContext } from './contracts'

export class ImpactAgent implements FormulationSubagent {
  generate({ context, type }: AgentGenerationInput) {
    const data = requireContext(context)

    if (type === COMPONENT_TYPES.BENEFICIARIES) {
      return {
        type,
        content: `La población beneficiaria definida para el proyecto es ${data.targetPopulation}. Su vinculación se concentra en ${data.location} y responde directamente al problema formulado: ${data.problem}\n\nLa caracterización detallada deberá validarse con información levantada durante la ejecución, sin asumir cantidades ni características no suministradas por el usuario.`,
      }
    }

    if (type === COMPONENT_TYPES.RISKS) {
      return {
        type,
        content: `La gestión de riesgos deberá considerar, como mínimo, la participación efectiva de ${data.targetPopulation}, la disponibilidad de información para comprender ${data.problem.toLowerCase()} y la viabilidad operativa de ${data.proposedSolution.toLowerCase()}.\n\nPara cada riesgo se deberá definir probabilidad, impacto, responsable, señal de alerta y acción de tratamiento. Esta versión no asigna niveles ni responsables que no hayan sido confirmados por el usuario.`,
      }
    }

    if (type === COMPONENT_TYPES.EXPECTED_IMPACTS) {
      return {
        type,
        content: `El impacto esperado se deriva de implementar ${data.proposedSolution.toLowerCase()} con ${data.targetPopulation}. El cambio buscado se expresa en los resultados confirmados por el usuario: ${data.expectedResults}\n\nLa medición deberá definir indicadores y evidencias durante la revisión metodológica, respetando el alcance inicial del proyecto.`,
      }
    }

    throw new Error(`ImpactAgent no genera el componente ${type}.`)
  }
}
