import { describe, expect, it } from 'vitest'
import { componentInputError, componentTextLimit } from './component-input'

describe('component input limits', () => {
  it('accepts a methodology of exactly 10,000 characters', () => {
    expect(
      componentInputError('a'.repeat(10000), 'methodology'),
    ).toBeUndefined()
    expect(componentTextLimit('methodology')).toBe(10000)
  })
  it('provides a corrective message for excessive methodology text', () => {
    expect(componentInputError('a'.repeat(10001), 'methodology')).toContain(
      '10.000',
    )
  })
  it('requires meaningful content without restricting accents or punctuation', () => {
    expect(componentInputError('   ', 'methodology')).toContain('20')
    expect(
      componentInputError(
        'Evaluación, innovación y participación: ¿cómo?',
        'methodology',
      ),
    ).toBeUndefined()
  })
  it('does not apply the methodology limit to other generated sections', () => {
    expect(
      componentInputError('a'.repeat(10001), 'theoretical_framework'),
    ).toBeUndefined()
  })
})
