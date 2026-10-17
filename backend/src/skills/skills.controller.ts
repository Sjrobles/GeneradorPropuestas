import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SkillsService } from './skills.service'

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar skills disponibles para formulación' })
  @ApiOkResponse({ description: 'Catálogo público de skills' })
  list() {
    return this.skillsService.list()
  }
}
