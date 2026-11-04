import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ProjectDocument } from '@/types/domain'
import { DocumentDownloadActions } from './DocumentDownloadActions'
const download = vi.hoisted(() => vi.fn())
vi.mock('@/services/documents/document-download', () => ({
  downloadProjectDocument: download,
}))
const document = {
  title: 'Proyecto',
  language: 'en',
  sections: [],
} as unknown as ProjectDocument

describe('direct document downloads', () => {
  it('downloads PDF and Word from the document preview', async () => {
    download.mockResolvedValue(undefined)
    render(<DocumentDownloadActions document={document} />)
    await userEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }))
    await waitFor(() => expect(download).toHaveBeenCalledWith(document, 'pdf'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Descargar Word (.docx)' }),
    )
    await waitFor(() => expect(download).toHaveBeenCalledWith(document, 'docx'))
  })
  it('shows a controlled error and enables retry after a failed export', async () => {
    download.mockRejectedValueOnce(
      new Error('TypeError: internal renderer failure'),
    )
    render(<DocumentDownloadActions document={document} />)
    await userEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tu documento se conserva',
    )
    expect(screen.getByRole('alert')).not.toHaveTextContent('TypeError')
    expect(screen.getByRole('button', { name: 'Descargar PDF' })).toBeEnabled()
  })
})
