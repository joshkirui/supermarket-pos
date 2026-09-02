import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !pin) return toast.error('Enter username and PIN')
    setLoading(true)
    try {
      await login(username, pin)
      toast.success('Welcome back!')
      navigate('/')
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-forest-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">POS System</h1>
          <p className="text-slate-500 text-sm mt-1">Kenyan Supermarket</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-xs text-slate-400 text-center">Demo: admin / 1234</p>
        </form>
      </div>
    </div>
  )
}
