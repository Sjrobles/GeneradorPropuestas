import { Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { ProjectsService } from './projects.service'

export interface GenerationJobResponse {
  generationId: string
  projectId: string
  status: 'accepted' | 'processing'
}

@Injectable()
export class GenerationJobsService {
  private readonly activeJobs = new Map<string, GenerationJobResponse>()
  private readonly logger = new Logger(GenerationJobsService.name)

  constructor(private readonly projects: ProjectsService) {}

  start(ownerId: string, projectId: string): GenerationJobResponse {
    const key = `${ownerId}:${projectId}`
    const current = this.activeJobs.get(key)
    if (current) return current

    const job: GenerationJobResponse = {
      generationId: randomUUID(),
      projectId,
      status: 'accepted',
    }
    this.activeJobs.set(key, job)

    void Promise.resolve()
      .then(() => {
        job.status = 'processing'
        return this.projects.generateComponents(
          ownerId,
          projectId,
          job.generationId,
        )
      })
      .catch((error: unknown) => {
        this.logger.error(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'unknown error',
            event: 'generation_job_failed',
            generationId: job.generationId,
            projectId,
          }),
        )
      })
      .finally(() => this.activeJobs.delete(key))

    return job
  }
}
