import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAdmin } from '../hooks/useAdmin'

function Admin() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    navigate('/admin/dashboard')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const ok = login(username.trim(), password)
    if (!ok) {
      toast.error('Invalid admin credentials')
      return
    }
    toast.success('Logged in successfully')
    navigate('/admin/dashboard')
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-14">
      <form className="mx-auto w-full max-w-md rounded-2xl border border-blue-900 bg-navyLight/70 p-6 shadow-soft" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-gold">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-300">Use your dashboard credentials to continue.</p>

        <label className="mt-6 block text-sm">
          Username
          <input className="input mt-1" onChange={(event) => setUsername(event.target.value)} required value={username} />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <input
            className="input mt-1"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button className="mt-6 w-full rounded bg-electricBlue px-4 py-2 font-semibold" type="submit">
          Login
        </button>
      </form>
    </section>
  )
}

export default Admin
