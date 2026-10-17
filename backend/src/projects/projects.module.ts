import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module'
import { AiModule } from '../ai/ai.module'
import { SkillsModule } from '../skills/skills.module'
import { OrchestrationModule } from '../orchestration/orchestration.module'
import { ProjectsController } from './projects.controller'
import { BudgetWorkbookService } from './budget-workbook.service'
import { GenerationJobsService } from './generation-jobs.service'
import { ProjectsService } from './projects.service'
import { Project, ProjectSchema } from './schemas/project.schema'

@Module({
  imports: [
    AiModule,
    AuthModule,
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    OrchestrationModule,
    SkillsModule,
  ],
  controllers: [ProjectsController],
  providers: [BudgetWorkbookService, ProjectsService, GenerationJobsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
