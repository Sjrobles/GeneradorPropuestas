import { createHash } from 'node:crypto'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import type { Environment } from '../config/environment'
import {
  DIAGNOSIS_CONTEXT_FIELDS,
  type AiContextDiagnosis,
  type ComponentRegenerationInput,
  type ContextDiagnosisInput,
  type ContextReplyInput,
  type DocumentTranslationInput,
  type DocumentTranslationOutput,
} from './ai.types'

const contextDiagnosisSchema = z.object({
  ambiguities: z.array(z.string()),
  inconsistencies: z.array(z.string()),
  questions: z
    .array(
      z.object({
        field: z.enum(DIAGNOSIS_CONTEXT_FIELDS),
        id: z.string(),
        prompt: z.string(),
      }),
    )
    .max(3),
})

const documentTranslationSchema = z.object({
  projectTitle: z.string().min(1),
  sections: z.array(
    z.object({
      content: z.string(),
      id: z.string().min(1),
    }),
  ),
})

@Injectable()
export class AiService {
  private readonly client?: OpenAI
  private readonly logger = new Logger(AiService.name)
  private readonly model: string

  constructor(config: ConfigService<Environment, true>) {
    const apiKey = config.get('OPENAI_API_KEY', { infer: true })
    this.model = config.get('OPENAI_MODEL', { infer: true })
    this.client = apiKey ? new OpenAI({ apiKey }) : undefined
  }

  createSafetyIdentifier(userId: string): string {
    return createHash('sha256').update(userId).digest('hex')
  }

  async diagnoseContext(
    input: ContextDiagnosisInput,
  ): Promise<AiContextDiagnosis> {
    const fallback: AiContextDiagnosis = {
      ambiguities: [],
      inconsistencies: [],
      questions: [],
    }
    if (!this.client) return fallback

    try {
      const languageInstruction =
        input.language === 'en'
          ? 'Write every observation and question in English.'
          : 'Redacta todas las observaciones y preguntas en español.'
      const response = await this.withTransientRetries(
        () =>
          this.client!.responses.parse({
            model: this.model,
            instructions: [
              'You are Ágora, a rigorous reviewer of science, technology and innovation project contexts.',
              'Use only the supplied context. Never invent facts or external evidence.',
              'Identify only material ambiguities or contradictions that could affect project formulation.',
              'Ask at most three concise clarification questions and assign each one to the most relevant allowed field.',
              'Use empty arrays when there are no material findings.',
              languageInstruction,
            ].join(' '),
            input: `Project: ${input.projectTitle}\nContext:\n${JSON.stringify(input.context, null, 2)}`,
            max_output_tokens: 900,
            reasoning: { effort: 'low' },
            safety_identifier: input.safetyIdentifier,
            text: {
              format: zodTextFormat(
                contextDiagnosisSchema,
                'context_diagnosis',
              ),
              verbosity: 'low',
            },
          }),
        'context-diagnosis',
      )

      return response.output_parsed ?? fallback
    } catch (error) {
      this.logger.warn(
        `OpenAI no pudo diagnosticar el contexto; se continuará sin observaciones automáticas: ${error instanceof Error ? error.message : 'error desconocido'}`,
      )
      return fallback
    }
  }

  async composeContextReply(input: ContextReplyInput): Promise<string> {
    if (!this.client) return input.fallback

    try {
      const languageInstruction =
        input.language === 'en' ? 'Write in English.' : 'Escribe en español.'
      const nextInstruction = input.nextFieldLabel
        ? `Close with exactly one concise question about: ${input.nextFieldLabel}.`
        : 'Confirm that the essential context is complete and ready for analysis.'

      const response = await this.withTransientRetries(
        () =>
          this.client!.responses.create({
            model: this.model,
            instructions: [
              'You are Ágora, an assistant for formulating science, technology and innovation projects.',
              'Acknowledge the answer briefly and naturally. Do not invent facts, evaluate the proposal or ask more than one question.',
              languageInstruction,
              nextInstruction,
            ].join(' '),
            input: `Project: ${input.projectTitle}\nField answered: ${input.currentFieldLabel}\nUser answer: ${input.answer}`,
            max_output_tokens: 180,
            reasoning: { effort: 'low' },
            safety_identifier: input.safetyIdentifier,
            text: { verbosity: 'low' },
          }),
        'context-reply',
      )

      return response.output_text.trim() || input.fallback
    } catch (error) {
      this.logger.warn(
        `OpenAI no respondió; se usará el respaldo local: ${error instanceof Error ? error.message : 'error desconocido'}`,
      )
      return input.fallback
    }
  }

  async regenerateProjectComponent(
    input: ComponentRegenerationInput,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI no está configurado para regenerar componentes')
    }

    const response = await this.withTransientRetries(
      () =>
        this.client!.responses.create({
          model: this.model,
          instructions: [
            'Eres Ágora, especialista en formulación de proyectos de ciencia, tecnología e innovación.',
            `Regenera exclusivamente el fragmento «${input.componentLabel}» en español.`,
            'Entrega contenido final utilizable, coherente con el contexto confirmado y las respuestas operativas.',
            'Conserva Markdown válido para títulos, listas, énfasis y tablas cuando corresponda.',
            'No inventes hechos institucionales ni cifras presentadas como confirmadas. Puedes formular supuestos técnicos razonables y debes identificarlos con claridad.',
            'No expliques el proceso, no incluyas saludos y no agregues secciones ajenas al fragmento solicitado.',
          ].join(' '),
          input: JSON.stringify(
            {
              context: input.context,
              currentContent: input.currentContent,
              executionDetails: input.executionDetails,
              projectTitle: input.projectTitle,
            },
            null,
            2,
          ),
          max_output_tokens: 8_000,
          reasoning: { effort: 'low' },
          safety_identifier: input.safetyIdentifier,
          text: { verbosity: 'high' },
        }),
      'component-regeneration',
    )
    const content = response.output_text.trim()
    if (!content) throw new Error('La regeneración no devolvió contenido')
    return content
  }

  async translateProjectDocument(
    input: DocumentTranslationInput,
  ): Promise<DocumentTranslationOutput> {
    if (!this.client) {
      throw new Error('OpenAI no está configurado para traducir documentos')
    }

    try {
      const response = await this.withTransientRetries(
        () =>
          this.client!.responses.parse({
            model: this.model,
            instructions: [
              'You are Ágora TranslationAgent, a professional Spanish-to-English translator for science, technology, innovation and development project documents.',
              'Translate every Spanish user-visible sentence into natural, formal English without summarizing, expanding, correcting, interpreting or adding information.',
              'Preserve every section id exactly and return the same sections in the same order. Do not omit or merge sections.',
              'Preserve Markdown structure and formatting markers exactly: headings, paragraphs, numbered and bullet lists, tables, bold, italics, underline markers and links.',
              'Preserve all numbers, formulas, dates, currencies, quantities, URLs, DOIs, identifiers and official proper names. Translate table headers, labels and measurement-unit words when appropriate.',
              'Return only the structured output requested by the schema.',
            ].join(' '),
            input: JSON.stringify(
              {
                projectTitle: input.projectTitle,
                sections: input.sections,
                sourceLanguage: 'es',
                targetLanguage: 'en',
              },
              null,
              2,
            ),
            max_output_tokens: 40_000,
            reasoning: { effort: 'low' },
            safety_identifier: input.safetyIdentifier,
            text: {
              format: zodTextFormat(
                documentTranslationSchema,
                'translated_project_document',
              ),
              verbosity: 'medium',
            },
          }),
        'document-translation',
      )
      const translated = response.output_parsed
      if (!translated) throw new Error('La traducción no devolvió contenido')

      const sourceIds = input.sections.map(({ id }) => id)
      const translatedIds = translated.sections.map(({ id }) => id)
      if (
        translated.sections.length !== input.sections.length ||
        sourceIds.some((id, index) => translatedIds[index] !== id)
      ) {
        throw new Error('La traducción alteró la estructura del documento')
      }

      return translated
    } catch (error) {
      this.logger.error(
        `No fue posible traducir el documento: ${error instanceof Error ? error.message : 'error desconocido'}`,
      )
      throw error
    }
  }

  private async withTransientRetries<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await operation()
      } catch (error) {
        if (!this.isTransientOpenAIError(error) || attempt === maxAttempts) {
          throw error
        }
        const delayMs = 2_000 * 2 ** (attempt - 1)
        this.logger.warn(
          JSON.stringify({
            attempt,
            delayMs,
            event: 'openai_retry',
            operation: operationName,
          }),
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    throw new Error(`No fue posible completar ${operationName}`)
  }

  private isTransientOpenAIError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error)
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : undefined
    return (
      status === 408 ||
      status === 409 ||
      status === 429 ||
      (typeof status === 'number' && status >= 500 && status <= 599) ||
      /timeout|timed out|econnreset|connection reset|socket hang up|network error|fetch failed|temporar|incomplete response/i.test(
        message,
      )
    )
  }
}
