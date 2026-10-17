import type {
  DocumentSection,
  ProjectDocument,
  ProjectLanguage,
} from '@/types/domain'

const englishTitles: Record<string, string> = {
  executive_summary: 'Executive summary',
  general_objective: 'General objective',
  specific_objectives: 'Specific objectives',
  problem_statement: 'Problem statement',
  theoretical_framework: 'Theoretical framework',
  state_of_art: 'State of the art',
  expected_impacts: 'Expected impacts',
  beneficiary_population: 'Beneficiary population',
  sustainability: 'Sustainability strategy',
  methodology: 'Implementation methodology',
}

export class TranslationAgent {
  translate(
    document: ProjectDocument,
    targetLanguage: ProjectLanguage,
  ): ProjectDocument {
    if (document.language === targetLanguage) return { ...document }

    const sections: DocumentSection[] = document.sections.map((section) => ({
      ...section,
      title:
        targetLanguage === 'en'
          ? (englishTitles[section.id] ?? section.title)
          : section.title,
      content:
        targetLanguage === 'en'
          ? `[Simulated English translation]\n\n${section.content}`
          : section.content.replace(
              /^\[Simulated English translation\]\n\n/,
              '',
            ),
    }))

    return {
      ...document,
      id: `${document.projectId}-${targetLanguage}`,
      language: targetLanguage,
      translatedFrom: document.language,
      generatedAt: new Date().toISOString(),
      sections,
      content: sections
        .map(
          ({ order, title, content }) =>
            `${order}. ${title.toUpperCase()}\n\n${content}`,
        )
        .join('\n\n'),
    }
  }
}

export const translationAgent = new TranslationAgent()
