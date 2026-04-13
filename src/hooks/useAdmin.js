import { createContext, createElement, useContext, useMemo, useState } from 'react'

const ADMIN_STORAGE_KEY = 'kalam_admin_authenticated'
const defaultUsername = import.meta.env.VITE_ADMIN_USERNAME ?? 'KalamAdmin'
const defaultPassword = import.meta.env.VITE_ADMIN_PASSWORD ?? 'Kalam21321@'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem(ADMIN_STORAGE_KEY) === 'true',
  )

  const value = useMemo(
    () => ({
      isAuthenticated,
      login: (username, password) => {
        const valid = username === defaultUsername && password === defaultPassword
        if (valid) {
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true')
          setIsAuthenticated(true)
        }
        return valid
      },
      logout: () => {
        localStorage.removeItem(ADMIN_STORAGE_KEY)
        setIsAuthenticated(false)
      },
    }),
    [isAuthenticated],
  )

  return createElement(AdminContext.Provider, { value }, children)
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
