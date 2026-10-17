import { useEffect, useRef } from 'react'

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize(options: {
        callback: (response: GoogleCredentialResponse) => void
        client_id: string
      }): void
      renderButton(
        parent: HTMLElement,
        options: Record<string, string | number>,
      ): void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

interface GoogleSignInButtonProps {
  clientId: string
  disabled?: boolean
  onCredential: (credential: string) => void
  onError: (message: string) => void
}

const SCRIPT_ID = 'google-identity-services'
const SCRIPT_URL = 'https://accounts.google.com/gsi/client?hl=es'

export function GoogleSignInButton({
  clientId,
  disabled = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  const errorRef = useRef(onError)

  useEffect(() => {
    callbackRef.current = onCredential
    errorRef.current = onError
  }, [onCredential, onError])

  useEffect(() => {
    const render = () => {
      if (!window.google || !containerRef.current) return
      containerRef.current.replaceChildren()
      window.google.accounts.id.initialize({
        callback: (response) => {
          if (response.credential) callbackRef.current(response.credential)
          else errorRef.current('Google no devolvió una credencial válida.')
        },
        client_id: clientId,
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        locale: 'es',
        logo_alignment: 'left',
        shape: 'pill',
        size: 'large',
        text: 'continue_with',
        theme: 'outline',
        width: Math.min(400, containerRef.current.clientWidth || 320),
      })
    }

    const existingScript = document.getElementById(SCRIPT_ID)
    if (window.google) {
      render()
      return
    }
    if (existingScript) {
      existingScript.addEventListener('load', render)
      return () => existingScript.removeEventListener('load', render)
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_URL
    script.async = true
    script.defer = true
    script.addEventListener('load', render)
    script.addEventListener('error', () =>
      errorRef.current('No fue posible cargar el acceso con Google.'),
    )
    document.head.append(script)
    return () => script.removeEventListener('load', render)
  }, [clientId])

  return (
    <div
      className={`h-10 min-h-10 w-full max-w-[400px] overflow-hidden rounded-full transition ${
        disabled ? 'pointer-events-none opacity-60' : 'opacity-100'
      }`}
      aria-disabled={disabled}
      ref={containerRef}
    />
  )
}
