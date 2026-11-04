export const contextGuidance: Record<string, string> = {
  problem:
    'Describe brevemente qué necesidad existe, a quién afecta y qué ocurre hoy. No necesitas plantear todavía toda la solución. Ejemplo: estudiantes de colegios públicos no tienen oportunidades de aprender a usar inteligencia artificial.',
  initialScope:
    'Delimita qué sí harás en esta primera etapa y qué dejarás para otra. Indica actividades, cobertura o cantidades aproximadas. Ejemplo: realizar talleres en dos colegios; no desarrollar una plataforma ni ampliar la intervención a toda la ciudad.',
  targetPopulation:
    'Indica quiénes se beneficiarán, sus características y cuántas personas aproximadamente. Si aún no tienes una cifra, di que está pendiente de confirmar.',
  location:
    'Indica la ciudad, municipio, comunidad o institución donde se realizará. Si falta un lugar específico, describe el territorio que ya conoces.',
  proposedSolution:
    'Explica qué acciones propones para responder a la necesidad, cómo se relacionan con el problema y qué las hace pertinentes.',
  expectedResults:
    'Describe cambios o productos que se puedan comprobar al terminar. Evita prometer resultados que queden fuera del alcance del proyecto.',
  projectDuration:
    'Indica el tiempo total en semanas o meses y cualquier fecha límite. Ejemplo: seis meses, de marzo a agosto.',
}

export function guidanceForQuestion(question: string): string {
  const text = question.toLowerCase()
  if (/alcance|fuera|scope|excluded/.test(text))
    return contextGuidance.initialScope
  if (/duración|tiempo|duration|deadline/.test(text))
    return contextGuidance.projectDuration
  if (/población|quién|benefici|population|affected/.test(text))
    return contextGuidance.targetPopulation
  if (/dónde|lugar|ubicación|where|location/.test(text))
    return contextGuidance.location
  if (/solución|intervención|solution|intervention/.test(text))
    return contextGuidance.proposedSolution
  if (/resultado|result|outcome/.test(text))
    return contextGuidance.expectedResults
  return contextGuidance.problem
}
