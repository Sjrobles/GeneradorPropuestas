import {
  COMPONENT_TYPES,
  type ProjectComponent,
  type ValidationResult,
  type ValidationWarning,
} from '@/types/domain'
import { componentRegistry } from '@/features/formulation/domain/component-registry'

export function validateComponent(
  component: ProjectComponent,
): ValidationResult {
  const warnings: ValidationWarning[] = []

  if (!component.currentContent.trim()) {
    warnings.push({
      code: 'EMPTY_COMPONENT',
      severity: 'error',
      component: component.type,
      message: 'El componente no puede estar vacío.',
    })
  }

  if (
    component.type === COMPONENT_TYPES.THEORETICAL_FRAMEWORK ||
    component.type === COMPONENT_TYPES.STATE_OF_ART ||
    component.type === COMPONENT_TYPES.BACKGROUND ||
    component.type === COMPONENT_TYPES.BIBLIOGRAPHY
  ) {
    warnings.push({
      code: 'SOURCES_REQUIRED',
      severity: 'warning',
      component: component.type,
      message:
        'Incorpora y verifica fuentes académicas o institucionales antes de aprobar este componente.',
    })
  }

  if (component.type === COMPONENT_TYPES.METHODOLOGY) {
    const phases = component.structuredContent?.phases ?? []
    if (
      phases.length === 0 ||
      phases.some((phase) => phase.activities.length === 0)
    ) {
      warnings.push({
        code: 'METHODOLOGY_STRUCTURE',
        severity: 'error',
        component: component.type,
        message:
          'La metodología debe contener fases y actividades relacionadas con los objetivos.',
      })
    }
  }

  return {
    valid: !warnings.some(({ severity }) => severity === 'error'),
    warnings,
  }
}

export function validateComponents(
  components: ProjectComponent[],
): ValidationResult {
  const warnings = components.flatMap(
    (component) => validateComponent(component).warnings,
  )

  const expectedComponentCount = componentRegistry.length
  if (components.length !== expectedComponentCount) {
    warnings.unshift({
      code: 'COMPONENT_COUNT',
      severity: 'error',
      message: `El proyecto debe contener exactamente ${expectedComponentCount} apartados; actualmente tiene ${components.length}.`,
    })
  }

  return {
    valid: !warnings.some(({ severity }) => severity === 'error'),
    score: Math.max(
      0,
      100 -
        warnings.filter(({ severity }) => severity === 'warning').length * 5 -
        warnings.filter(({ severity }) => severity === 'error').length * 20,
    ),
    warnings,
  }
}
