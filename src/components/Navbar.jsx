import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'

const links = [
  { to: '/', label: 'Home' },
  { to: '/schedule', label: 'Events' },
  { to: '/gulf-war', label: 'Gulf War' },
  { to: '/register', label: 'Register' },
  { to: '/speakers', label: 'Speakers' },
  { to: '/#organisers', label: 'Organisers' },
  { to: '/admin', label: 'Admin' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-accent/15 bg-gradient-to-b from-[rgba(14,12,8,0.97)] to-transparent backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <NavLink to="/" className="flex items-center gap-2.5 font-display text-3xl leading-none tracking-[0.04em] text-accent">
          <img alt="Kalam Conclave logo" className="h-10 w-auto rounded-sm object-contain" src={EVENT_LOGO_URL} />
          <span>{EVENT_SHORT_TITLE}</span>
        </NavLink>

        <button
          className="rounded border border-sand/35 px-3 py-1 text-sm text-sand transition hover:border-accent hover:text-accent md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          Menu
        </button>

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

      {open && (
        <ul className="space-y-1 border-t border-accent/15 px-4 pb-4 md:hidden">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] ${
                    isActive
                      ? 'bg-primary/20 text-accent'
                      : 'text-sand/90 hover:bg-surface/55 hover:text-sand'
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
