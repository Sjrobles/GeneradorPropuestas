import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import type { AuthenticatedUser } from '../auth/auth.types'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe'
import { CreateProjectDto } from './dto/create-project.dto'
import { SelectLanguageDto } from './dto/select-language.dto'
import { SendChatMessageDto } from './dto/send-chat-message.dto'
import { UpdateProjectContextDto } from './dto/update-project-context.dto'
import { UpdateProjectComponentDto } from './dto/update-project-component.dto'
import { UpdateExecutionDetailsDto } from './dto/update-execution-details.dto'
import { TranslateProjectDocumentDto } from './dto/translate-project-document.dto'
import type { ProjectLanguage } from './domain/project.constants'
import { ProjectsService } from './projects.service'
import { GenerationJobsService } from './generation-jobs.service'
import { BUDGET_WORKBOOK_MAX_FILE_SIZE_BYTES } from './budget-workbook.service'

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly generationJobs: GenerationJobsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un proyecto Ágora' })
  @ApiCreatedResponse({ description: 'Proyecto creado' })
  @ApiBadRequestResponse({ description: 'Datos o skill inválidos' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, input)
  }

  @Get()
  @ApiOperation({ summary: 'Listar proyectos' })
  @ApiOkResponse({ description: 'Proyectos ordenados por actualización' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(user.id)
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Consultar un proyecto' })
  @ApiOkResponse({ description: 'Proyecto encontrado' })
  @ApiNotFoundResponse({ description: 'Proyecto inexistente' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.findOne(user.id, projectId)
  }

  @Patch(':projectId/language')
  @ApiOperation({ summary: 'Confirmar español como idioma de formulación' })
  @ApiOkResponse({ description: 'Flujo en español confirmado' })
  selectLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() input: SelectLanguageDto,
  ) {
    return this.projectsService.selectLanguage(
      user.id,
      projectId,
      input.language,
    )
  }

  @Get(':projectId/messages')
  @ApiOperation({ summary: 'Consultar la conversación del proyecto' })
  @ApiOkResponse({ description: 'Mensajes ordenados cronológicamente' })
  getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.getMessages(user.id, projectId)
  }

  @Post(':projectId/messages')
  @ApiOperation({ summary: 'Enviar una respuesta al asistente Ágora' })
  @ApiCreatedResponse({ description: 'Conversación y contexto actualizados' })
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() input: SendChatMessageDto,
  ) {
    return this.projectsService.sendMessage(user.id, projectId, input.content)
  }

  @Get(':projectId/context')
  @ApiOperation({ summary: 'Consultar el contexto recopilado' })
  @ApiOkResponse({ description: 'Contexto actual del proyecto' })
  getContext(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.getContext(user.id, projectId)
  }

  @Patch(':projectId/context')
  @ApiOperation({ summary: 'Actualizar el contexto recopilado' })
  @ApiOkResponse({ description: 'Contexto actualizado' })
  updateContext(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() input: UpdateProjectContextDto,
  ) {
    return this.projectsService.updateContext(user.id, projectId, input)
  }

  @Post(':projectId/diagnosis')
  @ApiOperation({ summary: 'Diagnosticar el contexto con Ágora' })
  @ApiCreatedResponse({ description: 'Diagnóstico estructurado y persistido' })
  diagnoseContext(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.diagnoseContext(user.id, projectId)
  }

  @Post(':projectId/context/confirm')
  @ApiOperation({ summary: 'Confirmar el contexto del proyecto' })
  @ApiCreatedResponse({ description: 'Contexto confirmado' })
  confirmContext(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.confirmContext(user.id, projectId)
  }

  @Get(':projectId/execution-details')
  @ApiOperation({
    summary: 'Consultar respuestas para metodología y presupuesto',
  })
  @ApiOkResponse({ description: 'Respuestas operativas del proyecto' })
  getExecutionDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.getExecutionDetails(user.id, projectId)
  }

  @Patch(':projectId/execution-details')
  @ApiOperation({
    summary: 'Guardar respuestas para metodología y presupuesto',
  })
  @ApiOkResponse({ description: 'Respuestas operativas actualizadas' })
  updateExecutionDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() input: UpdateExecutionDetailsDto,
  ) {
    return this.projectsService.updateExecutionDetails(
      user.id,
      projectId,
      input,
    )
  }

  @Post(':projectId/execution-details/confirm')
  @ApiOperation({
    summary: 'Confirmar respuestas y habilitar metodología',
  })
  @ApiCreatedResponse({ description: 'Respuestas operativas confirmadas' })
  confirmExecutionDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.confirmExecutionDetails(user.id, projectId)
  }

  @Get(':projectId/components')
  @ApiOperation({ summary: 'Consultar los componentes del proyecto' })
  @ApiOkResponse({ description: 'Componentes y progreso de generación' })
  getComponents(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.getComponents(user.id, projectId)
  }

  @Get(':projectId/components/budget/workbook')
  @ApiOperation({
    summary: 'Descargar el presupuesto editable en Excel por rubros',
  })
  @ApiOkResponse({ description: 'Libro .xlsx con una pestaña por rubro' })
  async exportBudgetWorkbook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, fileName } =
      await this.projectsService.exportBudgetWorkbook(user.id, projectId)
    response.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(buffer.length),
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    return new StreamableFile(buffer)
  }

  @Post(':projectId/components/budget/workbook')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: BUDGET_WORKBOOK_MAX_FILE_SIZE_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Importar el presupuesto editado desde Excel',
  })
  @ApiCreatedResponse({
    description: 'Tabla presupuestal reconstruida y persistida',
  })
  importBudgetWorkbook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; size: number },
  ) {
    return this.projectsService.importBudgetWorkbook(user.id, projectId, file)
  }

  @Get(':projectId/components/:componentId')
  @ApiOperation({ summary: 'Consultar un componente del proyecto' })
  @ApiOkResponse({ description: 'Componente encontrado' })
  @ApiNotFoundResponse({ description: 'Componente inexistente' })
  getComponent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.projectsService.getComponent(user.id, projectId, componentId)
  }

  @Patch(':projectId/components/:componentId')
  @ApiOperation({ summary: 'Guardar los cambios de un componente' })
  @ApiOkResponse({ description: 'Componente actualizado' })
  @ApiNotFoundResponse({ description: 'Componente inexistente' })
  updateComponent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('componentId') componentId: string,
    @Body() input: UpdateProjectComponentDto,
  ) {
    return this.projectsService.updateComponent(
      user.id,
      projectId,
      componentId,
      input.content,
    )
  }

  @Post(':projectId/components/:componentId/approve')
  @ApiOperation({ summary: 'Aprobar un componente del proyecto' })
  @ApiCreatedResponse({ description: 'Componente aprobado' })
  @ApiNotFoundResponse({ description: 'Componente inexistente' })
  approveComponent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.projectsService.approveComponent(
      user.id,
      projectId,
      componentId,
    )
  }

  @Post(':projectId/components/budget/regenerate')
  @ApiOperation({ summary: 'Regenerar únicamente el presupuesto del proyecto' })
  @ApiCreatedResponse({ description: 'Presupuesto regenerado y persistido' })
  @ApiBadRequestResponse({
    description: 'Faltan respuestas operativas o agentes previos',
  })
  regenerateBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.regenerateBudget(user.id, projectId)
  }

  @Post(':projectId/components/:componentId/regenerate')
  @ApiOperation({ summary: 'Regenerar un fragmento específico del proyecto' })
  @ApiCreatedResponse({ description: 'Fragmento regenerado y persistido' })
  @ApiBadRequestResponse({
    description: 'Se alcanzó el límite de tres regeneraciones',
  })
  regenerateComponent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.projectsService.regenerateComponent(
      user.id,
      projectId,
      componentId,
    )
  }

  @Post(':projectId/components/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Generar los 13 componentes con cinco agentes' })
  @ApiOkResponse({ description: 'Generación aceptada para segundo plano' })
  generateComponents(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.generationJobs.start(user.id, projectId)
  }

  @Post(':projectId/document/assemble')
  @ApiOperation({ summary: 'Ensamblar y persistir el documento del proyecto' })
  @ApiCreatedResponse({ description: 'Documento consolidado y persistido' })
  assembleDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.assembleDocument(user.id, projectId)
  }

  @Get(':projectId/document')
  @ApiOperation({ summary: 'Consultar el documento persistido del proyecto' })
  @ApiOkResponse({ description: 'Documento asociado al usuario autenticado' })
  @ApiNotFoundResponse({ description: 'Documento todavía no ensamblado' })
  getDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Query('language') language?: ProjectLanguage,
  ) {
    return this.projectsService.getDocument(user.id, projectId, language)
  }

  @Post(':projectId/document/translate')
  @ApiOperation({ summary: 'Traducir y persistir el documento del proyecto' })
  @ApiCreatedResponse({ description: 'Documento traducido y persistido' })
  translateDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
    @Body() input: TranslateProjectDocumentDto,
  ) {
    return this.projectsService.translateDocument(
      user.id,
      projectId,
      input.targetLanguage,
    )
  }

  @Post(':projectId/complete')
  @ApiOperation({ summary: 'Finalizar un proyecto con documento persistido' })
  @ApiCreatedResponse({ description: 'Proyecto completado' })
  completeProject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.completeProject(user.id, projectId)
  }

  @Post(':projectId/regenerate')
  @ApiOperation({
    summary: 'Preparar la única regeneración completa permitida',
  })
  @ApiCreatedResponse({ description: 'Proyecto preparado para regenerarse' })
  @ApiBadRequestResponse({
    description: 'El proyecto no está terminado o ya usó su regeneración',
  })
  regenerateProject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId', ParseObjectIdPipe) projectId: string,
  ) {
    return this.projectsService.regenerateProject(user.id, projectId)
  }
}
