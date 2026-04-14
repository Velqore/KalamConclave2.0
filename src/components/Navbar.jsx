import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'

const links = [
  { to: '/', label: 'Home' },
  { to: '/schedule', label: 'Events' },
  { to: '/gulf-war', label: 'Gulf War' },
  { to: '/register', label: 'Register' },
  { to: '/guests', label: 'Guests' },
  { to: '/#organisers', label: 'Organisers' },
  { to: '/admin', label: 'Admin' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-accent/15 bg-[rgba(14,12,8,0.97)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink
          to="/"
          onClick={() => setOpen(false)}
          className="flex min-w-0 items-center gap-2.5 font-display text-xl leading-none tracking-[0.03em] text-accent sm:text-2xl md:text-3xl"
        >
          <img alt="Kalam Conclave logo" className="h-8 w-auto rounded-sm object-contain sm:h-10" src={EVENT_LOGO_URL} />
          <span className="truncate">{EVENT_SHORT_TITLE}</span>
        </NavLink>

        {/* Hamburger / close button — mobile only */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded border border-sand/25 transition hover:border-accent md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          {open ? (
            /* ✕ close icon */
            <svg className="h-5 w-5 text-sand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            /* ☰ hamburger icon */
            <svg className="h-5 w-5 text-sand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-[0.18em] transition ${
                    isActive ? 'text-accent' : 'text-sand/80 hover:text-sand'
                  }`
                }
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <ul className="border-t border-accent/15 px-3 pb-3 pt-1 md:hidden">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] transition ${
                    isActive
                      ? 'bg-primary/25 text-accent'
                      : 'text-sand/90 hover:bg-surface/60 hover:text-sand'
                  }`
                }
                onClick={() => setOpen(false)}
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

export default Navbar
