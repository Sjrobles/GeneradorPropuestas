import { Injectable, OnModuleInit } from '@nestjs/common'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FORMULATION_AGENTS,
  type FormulationAgent,
} from '../domain/formulation.constants'

export interface AgentPromptResource {
  agent: FormulationAgent
  content: string
  provisional: boolean
  version: string
}

const PROMPT_METADATA: Record<
  FormulationAgent,
  Pick<AgentPromptResource, 'provisional' | 'version'>
> = {
  research: { provisional: false, version: '1.0.0' },
  ideation: { provisional: false, version: '1.3.0' },
  methodology: { provisional: false, version: '1.0.0' },
  budget: { provisional: false, version: '2.3.0' },
  impact: { provisional: false, version: '1.1.0' },
}

@Injectable()
export class PromptCatalogService implements OnModuleInit {
  private readonly cache = new Map<FormulationAgent, AgentPromptResource>()

  onModuleInit(): void {
    this.getAll()
  }

  get(agent: FormulationAgent): AgentPromptResource {
    const cached = this.cache.get(agent)
    if (cached) return cached

    const content = readFileSync(
      join(__dirname, 'resources', `${agent}.md`),
      'utf-8',
    ).trim()
    if (content.length < 500) {
      throw new Error(`El prompt del agente ${agent} está vacío o incompleto`)
    }

    const resource: AgentPromptResource = {
      agent,
      content,
      ...PROMPT_METADATA[agent],
    }
    this.cache.set(agent, resource)
    return resource
  }

  getAll(): AgentPromptResource[] {
    return FORMULATION_AGENTS.map((agent) => this.get(agent))
  }
}
