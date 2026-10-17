import { componentRegistry } from '@/features/formulation/domain/component-registry'
import type {
  Project,
  ProjectComponent,
  ProjectDocument,
  ProjectLanguage,
} from '@/types/domain'

export class DocumentAssembler {
  assemble(
    project: Project,
    components: ProjectComponent[],
    language: ProjectLanguage,
  ): ProjectDocument {
    if (components.length !== componentRegistry.length) {
      throw new Error(
        `El proyecto debe tener los ${componentRegistry.length} apartados antes de ensamblar el documento.`,
      )
    }

    const sections = componentRegistry.map((definition) => {
      const component = components.find(({ type }) => type === definition.type)
      if (!component?.currentContent.trim()) {
        throw new Error(`El componente ${definition.label} está vacío.`)
      }

      return {
        id: definition.type,
        componentId: component.id,
        order: definition.order,
        title: language === 'en' ? definition.englishLabel : definition.label,
        content: component.currentContent,
      }
    })
    const generatedAt = new Date().toISOString()
    const content = sections
      .map(
        ({ order, title, content: sectionContent }) =>
          `${order}. ${title.toUpperCase()}\n\n${sectionContent}`,
      )
      .join('\n\n')

    return {
      id: `${project.id}-${language}`,
      projectId: project.id,
      title: project.title,
      language,
      status: 'ready',
      generatedAt,
      sections,
      content,
    }
  }
}

export const documentAssembler = new DocumentAssembler()
