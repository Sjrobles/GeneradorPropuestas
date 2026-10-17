import { Module } from '@nestjs/common'
import { AgentExecutorService } from './application/agent-executor.service'
import { ProjectOrchestratorService } from './application/project-orchestrator.service'
import { PromptCatalogService } from './prompts/prompt-catalog.service'

@Module({
  providers: [
    AgentExecutorService,
    ProjectOrchestratorService,
    PromptCatalogService,
  ],
  exports: [ProjectOrchestratorService, PromptCatalogService],
})
export class OrchestrationModule {}
