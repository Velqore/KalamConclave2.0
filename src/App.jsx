import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Register from './pages/Register'
import SubEventRegister from './pages/SubEventRegister'
import EventPassPage from './pages/EventPassPage'
import Speakers from './pages/Speakers'
import Schedule from './pages/Schedule'
import Events from './pages/Events'
import GulfWar from './pages/GulfWar'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import VolunteerLogin from './pages/VolunteerLogin'
import VolunteerDashboard from './pages/VolunteerDashboard'
import { useAdmin } from './hooks/useAdmin'
import { trackPageView } from './lib/pageViewService'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdmin()
  return isAuthenticated ? children : <Navigate to="/admin" replace />
}

function AppLayout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen bg-bg text-sand">
      <Navbar />
      <main className="guide-persuade-flow">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function App() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Home />
          </AppLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AppLayout>
            <Register />
          </AppLayout>
        }
      />
      <Route
        path="/register/:eventId"
        element={
          <AppLayout>
            <SubEventRegister />
          </AppLayout>
        }
      />
      <Route
        path="/pass/:passId"
        element={
          <AppLayout>
            <EventPassPage />
          </AppLayout>
        }
      />
      <Route
        path="/guests"
        element={
          <AppLayout>
            <Speakers />
          </AppLayout>
        }
      />
      <Route path="/speakers" element={<Navigate to="/guests" replace />} />
      <Route
        path="/schedule"
        element={
          <AppLayout>
            <Schedule />
          </AppLayout>
        }
      />
      <Route
        path="/events"
        element={
          <AppLayout>
            <Events />
          </AppLayout>
        }
      />
      <Route
        path="/gulf-war"
        element={
          <AppLayout>
            <GulfWar />
          </AppLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <AppLayout hideFooter>
            <Admin />
          </AppLayout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout hideFooter>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/volunteer" element={<VolunteerLogin />} />
      <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
