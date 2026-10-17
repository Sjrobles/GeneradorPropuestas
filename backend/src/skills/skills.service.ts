import { Injectable } from '@nestjs/common'

export interface SkillResponse {
  description: string
  enabled: boolean
  icon: string
  id: string
  name: string
}

const SKILLS: SkillResponse[] = [
  {
    id: 'international-calls',
    name: 'Convocatorias Internacionales y Banco de la República',
    description:
      'Estructura una propuesta orientada a oportunidades internacionales y convocatorias institucionales.',
    enabled: true,
    icon: 'landmark',
  },
  {
    id: 'research-projects',
    name: 'Proyectos de investigación',
    description:
      'Acompañamiento especializado para iniciativas académicas y científicas.',
    enabled: false,
    icon: 'flask-conical',
  },
  {
    id: 'social-innovation',
    name: 'Innovación social',
    description:
      'Formulación de soluciones colaborativas para retos sociales y territoriales.',
    enabled: false,
    icon: 'users',
  },
  {
    id: 'technology-transfer',
    name: 'Transferencia tecnológica',
    description:
      'Estructuración de iniciativas para llevar conocimiento y tecnología al entorno.',
    enabled: false,
    icon: 'blocks',
  },
]

@Injectable()
export class SkillsService {
  list(): SkillResponse[] {
    return SKILLS.map((skill) => ({ ...skill }))
  }

  isEnabled(skillId: string): boolean {
    return SKILLS.some((skill) => skill.id === skillId && skill.enabled)
  }
}
