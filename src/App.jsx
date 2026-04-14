import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Register from './pages/Register'
import Speakers from './pages/Speakers'
import Schedule from './pages/Schedule'
import GulfWar from './pages/GulfWar'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import VolunteerLogin from './pages/VolunteerLogin'
import VolunteerDashboard from './pages/VolunteerDashboard'
import { useAdmin } from './hooks/useAdmin'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdmin()
  return isAuthenticated ? children : <Navigate to="/admin" replace />
}

function AppLayout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen bg-bg text-sand">
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function App() {
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
        path="/speakers"
        element={
          <AppLayout>
            <Speakers />
          </AppLayout>
        }
      />
      <Route
        path="/schedule"
        element={
          <AppLayout>
            <Schedule />
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
