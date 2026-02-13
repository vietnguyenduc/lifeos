import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        setMessage('Đăng nhập thành công')
      } else {
        await signUp(email, password)
        setMessage('Tạo tài khoản thành công, hãy đăng nhập')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-width-md max-w-md p-6 rounded-lg shadow bg-white border border-slate-200">
        <h1 className="text-xl font-semibold mb-4">Life OS Login</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded border"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-3 py-2 rounded border"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
        <div className="mt-3 text-sm flex justify-between items-center">
          <span>{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
          <button
            className="text-blue-600 underline"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null) }}
          >
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
