import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './admin.css'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'Dizain@2026'

export default function AdminLogin() {
  const nav = useNavigate()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      setLoading(true)
      sessionStorage.setItem('dizain_admin', '1')
      setTimeout(() => nav('/admin/dashboard'), 400)
    } else {
      setErr('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="al-page">
      <div className="al-card">
        <div className="al-brand">
          <span className="al-hex">⬡</span>
          <div>
            <h1>Dizain Constructions</h1>
            <p>Admin Content Panel</p>
          </div>
        </div>
        <form className="al-form" onSubmit={handleSubmit} autoComplete="on">
          <div className="al-field">
            <label htmlFor="al-u">Username</label>
            <input
              id="al-u"
              type="text"
              autoComplete="username"
              value={u}
              onChange={e => setU(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="al-field">
            <label htmlFor="al-p">Password</label>
            <input
              id="al-p"
              type="password"
              autoComplete="current-password"
              value={p}
              onChange={e => setP(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {err && <p className="al-error" role="alert">{err}</p>}
          <button className="al-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <a className="al-back" href="/">← Back to public site</a>
      </div>
    </div>
  )
}
