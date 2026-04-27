import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { EVENT_LOGO_URL } from '../config/branding'

const links = [
  { to: '/', label: 'Home' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/events', label: 'Events' },
  { to: '/gulf-war', label: 'Gulf War' },
  { to: '/register', label: 'Register' },
  { to: '/guests', label: 'Guests' },
  { to: '/#social-media', label: 'Follow Us' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/#organisers', label: 'Organisers' },
  { to: '/admin', label: 'Admin' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLinkClick = (link, e) => {
    setOpen(false)
    if (!link.to.startsWith('/#')) return
    e.preventDefault()
    const id = link.to.slice(2)
    const scrollToSection = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
    if (location.pathname === '/') {
      scrollToSection()
    } else {
      // Allow React Router to finish navigating to '/' before scrolling
      const NAVIGATION_SCROLL_DELAY = 300
      navigate('/')
      setTimeout(scrollToSection, NAVIGATION_SCROLL_DELAY)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-accent/20 bg-[rgba(8,15,26,0.97)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink
          to="/"
          onClick={() => setOpen(false)}
          className="min-w-0 flex-1 overflow-hidden"
        >
          <img
            src={EVENT_LOGO_URL}
            alt="Kalam Conclave 2.0 logos"
            className="h-14 w-auto max-w-full object-contain sm:h-12 sm:max-w-[240px]"
          />
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
        <ul className="hidden items-center gap-3 lg:gap-5 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `font-mono text-[0.68rem] uppercase tracking-[0.14em] transition lg:text-xs lg:tracking-[0.18em] ${
                    isActive ? 'text-accent' : 'text-sand/80 hover:text-sand'
                  }`
                }
                to={link.to}
                onClick={(e) => handleLinkClick(link, e)}
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
                onClick={(e) => handleLinkClick(link, e)}
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
