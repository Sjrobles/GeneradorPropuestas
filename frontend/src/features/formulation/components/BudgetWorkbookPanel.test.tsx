import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BudgetWorkbookPanel } from './BudgetWorkbookPanel'

const mutations = vi.hoisted(() => ({
  download: {
    error: null as Error | null,
    isPending: false,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  },
  upload: {
    error: null as Error | null,
    isPending: false,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  },
}))

vi.mock('@/features/formulation/hooks/use-components', () => ({
  useDownloadBudgetWorkbookMutation: () => mutations.download,
  useImportBudgetWorkbookMutation: () => mutations.upload,
}))

const importedComponent = {
  currentContent: 'Presupuesto importado',
  id: 'budget-id',
  modifiedBy: 'user',
  status: 'needs_revision',
  type: 'budget',
  updatedAt: new Date().toISOString(),
}

describe('BudgetWorkbookPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutations.download.error = null
    mutations.download.isPending = false
    mutations.upload.error = null
    mutations.upload.isPending = false
    mutations.upload.mutateAsync.mockResolvedValue(importedComponent)
  })

  it('protege el borrador y permite reintentar el mismo archivo', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    render(<BudgetWorkbookPanel hasUnsavedChanges projectId="project-id" />)
    const input = screen.getByLabelText('Seleccionar presupuesto Excel editado')
    const file = validWorkbookFile()

    await user.upload(input, file)
    expect(confirm).toHaveBeenCalledOnce()
    expect(mutations.upload.mutateAsync).not.toHaveBeenCalled()
    expect(
      screen.getByText(
        'Importación cancelada. Tus cambios sin guardar se conservaron.',
      ),
    ).toBeInTheDocument()

    confirm.mockReturnValueOnce(true)
    await user.upload(input, file)
    await waitFor(() =>
      expect(mutations.upload.mutateAsync).toHaveBeenCalledWith(file),
    )
  })

  it('informa el estado de carga para bloquear las acciones de la página', async () => {
    const user = userEvent.setup()
    const onImportingChange = vi.fn()
    let resolveUpload: (value: typeof importedComponent) => void = () => {}
    mutations.upload.mutateAsync.mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = resolve
      }),
    )
    render(
      <BudgetWorkbookPanel
        onImportingChange={onImportingChange}
        projectId="project-id"
      />,
    )

    await user.upload(
      screen.getByLabelText('Seleccionar presupuesto Excel editado'),
      validWorkbookFile(),
    )

    expect(onImportingChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Importando…' })).toBeDisabled()

    resolveUpload(importedComponent)
    await waitFor(() =>
      expect(onImportingChange).toHaveBeenLastCalledWith(false),
    )
  })

  it('permite reintentar el mismo archivo después de un error de carga', async () => {
    const user = userEvent.setup()
    const file = validWorkbookFile()
    mutations.upload.mutateAsync
      .mockRejectedValueOnce(new Error('Carga fallida'))
      .mockResolvedValueOnce(importedComponent)
    render(<BudgetWorkbookPanel projectId="project-id" />)
    const input = screen.getByLabelText('Seleccionar presupuesto Excel editado')

    await user.upload(input, file)
    await waitFor(() =>
      expect(mutations.upload.mutateAsync).toHaveBeenCalledTimes(1),
    )
    await user.upload(input, file)
    await waitFor(() =>
      expect(mutations.upload.mutateAsync).toHaveBeenCalledTimes(2),
    )
  })

  it('valida formato y tamaño antes de enviar el archivo', () => {
    render(<BudgetWorkbookPanel projectId="project-id" />)
    const input = screen.getByLabelText('Seleccionar presupuesto Excel editado')

    fireEvent.change(input, {
      target: { files: [new File(['texto'], 'presupuesto.csv')] },
    })
    expect(
      screen.getByText('El presupuesto debe cargarse en formato .xlsx.'),
    ).toBeInTheDocument()

    fireEvent.change(input, {
      target: {
        files: [
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'presupuesto.xlsx'),
        ],
      },
    })
    expect(
      screen.getByText('El archivo Excel no puede superar 5 MB.'),
    ).toBeInTheDocument()
    expect(mutations.upload.mutateAsync).not.toHaveBeenCalled()
  })
})

function validWorkbookFile() {
  return new File(['xlsx'], 'presupuesto.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
