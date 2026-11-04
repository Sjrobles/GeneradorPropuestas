import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Brand } from './Brand'
import './landing-header.css'

interface LandingHeaderProps {
  signedIn: boolean
  onLogout: () => void
}

const links = [
  { label: 'Producto', href: '/#producto' },
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Mis proyectos', href: '/projects' },
]

export function LandingHeader({ signedIn, onLogout }: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 16)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  const menuButton = useRef<HTMLButtonElement>(null)

  return (
    <>
      <div
        className={`agora-header-scroll-fade${scrolled ? ' is-visible' : ''}`}
        aria-hidden="true"
      />
      <header
        className="agora-floating-header"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false)
            menuButton.current?.focus()
          }
        }}
      >
        <div className="agora-floating-bar">
          <Brand />
          <nav className="agora-floating-nav" aria-label="Navegación principal">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="agora-floating-actions">
            {signedIn ? (
              <button
                type="button"
                className="agora-header-access"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            ) : (
              <Link className="agora-header-access" to="/auth">
                Iniciar sesión <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            )}
            <button
              ref={menuButton}
              type="button"
              className="agora-header-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X size={21} aria-hidden="true" />
              ) : (
                <Menu size={21} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <nav
          id="landing-mobile-navigation"
          className="agora-floating-mobile"
          aria-label="Navegación móvil"
          hidden={!menuOpen}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>
    </>
  )
}
