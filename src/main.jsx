import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'
import { AdminProvider } from './hooks/useAdmin'
import { AppDataProvider } from './context/AppDataContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <AppDataProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#121c33',
                color: '#f8fafc',
                border: '1px solid #1f2f52',
              },
            }}
          />
        </AppDataProvider>
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>,
)
