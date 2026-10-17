import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { AgoraButton } from '@/components/ui/agora-button'
import {
  useDownloadBudgetWorkbookMutation,
  useImportBudgetWorkbookMutation,
} from '@/features/formulation/hooks/use-components'
import type { ProjectComponent } from '@/types/domain'

interface BudgetWorkbookPanelProps {
  disabled?: boolean
  hasUnsavedChanges?: boolean
  onImported?: (component: ProjectComponent) => void
  onImportingChange?: (importing: boolean) => void
  projectId: string
}

const MAX_WORKBOOK_SIZE_BYTES = 5 * 1024 * 1024
const DISCARD_DRAFT_CONFIRMATION =
  'Tienes cambios sin guardar en el presupuesto. Al importar el Excel, esos cambios serán reemplazados. ¿Deseas continuar?'

export function BudgetWorkbookPanel({
  disabled = false,
  hasUnsavedChanges = false,
  onImported,
  onImportingChange,
  projectId,
}: BudgetWorkbookPanelProps) {
  const download = useDownloadBudgetWorkbookMutation(projectId)
  const upload = useImportBudgetWorkbookMutation(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const busy = disabled || download.isPending || upload.isPending || isImporting

  const downloadWorkbook = async () => {
    setMessage('')
    setLocalError('')
    download.reset()
    upload.reset()
    try {
      const result = await download.mutateAsync()
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.fileName
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setMessage('Excel descargado. Puedes editar costos, cantidades y filas.')
    } catch {
      // React Query conserva el error para mostrarlo en el panel.
    }
  }

  const importWorkbook = async (file?: File) => {
    if (!file || isImporting || upload.isPending) return
    setMessage('')
    setLocalError('')
    download.reset()
    upload.reset()

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setLocalError('El presupuesto debe cargarse en formato .xlsx.')
      return
    }
    if (file.size > MAX_WORKBOOK_SIZE_BYTES) {
      setLocalError('El archivo Excel no puede superar 5 MB.')
      return
    }
    if (hasUnsavedChanges && !window.confirm(DISCARD_DRAFT_CONFIRMATION)) {
      setMessage(
        'Importación cancelada. Tus cambios sin guardar se conservaron.',
      )
      return
    }

    setIsImporting(true)
    onImportingChange?.(true)
    try {
      const component = await upload.mutateAsync(file)
      onImported?.(component)
      setMessage(
        'Excel importado. La tabla fue reconstruida y queda pendiente de aprobación.',
      )
    } catch {
      // React Query conserva el error para mostrarlo en el panel.
    } finally {
      if (inputRef.current) inputRef.current.value = ''
      setIsImporting(false)
      onImportingChange?.(false)
    }
  }

  const errorMessage =
    localError || download.error?.message || upload.error?.message

  return (
    <section
      aria-busy={isImporting}
      className="mt-5 rounded-2xl border border-[#bfd0f5] bg-[#f3f7ff] p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
          <FileSpreadsheet aria-hidden="true" size={21} />
        </span>
        <div>
          <h2 className="text-sm font-extrabold text-[#20325e]">
            Presupuesto editable en Excel
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#617089]">
            El archivo contiene una pestaña por rubro. Conserva las columnas y
            escribe cada actividad con su código, por ejemplo 1.1 o 2.3. Al
            subirlo, Ágora recalcula los totales y actualiza el documento final.
          </p>
          <details className="mt-2 text-xs leading-5 text-[#617089]">
            <summary className="cursor-pointer font-extrabold text-[#3652a3]">
              Requisitos del archivo
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Formato .xlsx y tamaño máximo de 5 MB.</li>
              <li>Máximo 40 filas presupuestales y 20 pestañas en total.</li>
              <li>
                Conserva las ocho columnas originales, sus nombres y su orden.
              </li>
              <li>Usa una pestaña independiente para cada rubro.</li>
              <li>
                Escribe el código al inicio de cada actividad, por ejemplo 1.1.
              </li>
            </ul>
          </details>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <AgoraButton
          variant="secondary"
          disabled={busy}
          onClick={() => void downloadWorkbook()}
        >
          <Download aria-hidden="true" size={16} />
          {download.isPending ? 'Preparando Excel…' : 'Descargar Excel'}
        </AgoraButton>
        <AgoraButton
          variant="secondary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" size={16} />
          {isImporting || upload.isPending
            ? 'Importando…'
            : 'Subir Excel editado'}
        </AgoraButton>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          aria-label="Seleccionar presupuesto Excel editado"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            void importWorkbook(file)
          }}
        />
      </div>

      {message ? (
        <p className="mt-3 text-xs font-bold text-success" role="status">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-3 text-xs font-bold text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}
