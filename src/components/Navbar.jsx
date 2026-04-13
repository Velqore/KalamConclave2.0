import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/register', label: 'Register' },
  { to: '/speakers', label: 'Speakers' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/admin', label: 'Admin' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-blue-950 bg-navy/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <NavLink to="/" className="font-display text-lg font-bold text-gold">
          1st Kalam Conclave 2.0
        </NavLink>

        <button
          className="rounded border border-blue-900 px-3 py-1 text-sm md:hidden"
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
                  `text-sm transition ${isActive ? 'text-electricBlue' : 'text-slate-300 hover:text-white'}`
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
        <ul className="space-y-2 border-t border-blue-950 px-4 pb-4 md:hidden">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-electricBlue text-white' : 'text-slate-200 hover:bg-blue-950'}`
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
