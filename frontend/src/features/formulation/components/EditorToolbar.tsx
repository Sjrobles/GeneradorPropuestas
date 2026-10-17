import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Underline,
} from 'lucide-react'
import type { ReactNode, RefObject } from 'react'

import {
  applyEditorCommand,
  type EditorCommand,
} from '@/features/formulation/utils/editor-formatting'

const editorTools: Array<{
  command: EditorCommand
  icon: typeof Bold
  label: string
}> = [
  { command: 'bold', label: 'Negrita', icon: Bold },
  { command: 'italic', label: 'Cursiva', icon: Italic },
  { command: 'underline', label: 'Subrayado', icon: Underline },
  { command: 'bullet-list', label: 'Lista con viñetas', icon: List },
  { command: 'numbered-list', label: 'Lista numerada', icon: ListOrdered },
  { command: 'align-left', label: 'Alinear a la izquierda', icon: AlignLeft },
  { command: 'align-center', label: 'Centrar texto', icon: AlignCenter },
  { command: 'align-right', label: 'Alinear a la derecha', icon: AlignRight },
  { command: 'align-justify', label: 'Justificar texto', icon: AlignJustify },
  { command: 'link', label: 'Insertar enlace', icon: Link2 },
]

interface EditorToolbarProps {
  disabled?: boolean
  onChange: (value: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  trailing?: ReactNode
  value: string
}

export function EditorToolbar({
  disabled,
  onChange,
  textareaRef,
  trailing,
  value,
}: EditorToolbarProps) {
  const apply = (command: EditorCommand) => {
    const textarea = textareaRef.current
    if (!textarea || disabled) return

    let linkUrl: string | undefined
    if (command === 'link') {
      const supplied = window.prompt('Pega la URL del enlace:')
      if (!supplied?.trim()) return
      linkUrl = /^https?:\/\//i.test(supplied.trim())
        ? supplied.trim()
        : `https://${supplied.trim()}`
    }

    const result = applyEditorCommand(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      command,
      linkUrl,
    )
    onChange(result.value)
    window.requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-[#e0e3d2] bg-[#fcfcfa] px-3 py-2"
      role="toolbar"
      aria-label="Herramientas de edición"
    >
      <span className="mr-1 inline-flex items-center gap-2 border-r border-[#dfe2cb] pr-3 text-xs font-bold text-[#5b6980]">
        <Pilcrow aria-hidden="true" size={16} /> Párrafo
      </span>
      {editorTools.map(({ command, label, icon: Icon }) => (
        <button
          key={command}
          className="grid size-8 place-items-center rounded-lg text-[#53617a] transition hover:bg-[#edf2fb] hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={() => apply(command)}
        >
          <Icon aria-hidden="true" size={16} />
        </button>
      ))}
      {trailing}
    </div>
  )
}
