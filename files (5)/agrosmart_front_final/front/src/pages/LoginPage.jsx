import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('admin@agriculture.local')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)

      const res  = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.detail || 'Identifiants incorrects'); return }
      if (!data.access_token) { setError('Token manquant'); return }

      login(data.access_token)   // stocke token + extrait role
      navigate('/dashboard')
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div>
            <h1>AgroSmart</h1>
            <p>Système de gestion agricole intelligente</p>
          </div>
        </div>

        <h2>Connexion</h2>
        <p className="login-sub">Bienvenue. Entrez vos identifiants pour continuer.</p>

        {error && (
          <div className="alert-banner error" style={{ marginBottom:16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label className="form-label">Adresse email</label>
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com" required/>
          </div>
          <div className="form-field">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg"
            disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:8 }}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Connexion...</> : 'Se connecter'}
          </button>
        </form>

        <div className="login-hint"><span>🔒</span> Connexion sécurisée — AgroSmart v1.0</div>
      </div>

      <style>{`
        .login-card { background:white; border-radius:24px; padding:40px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(15,46,23,0.12),0 4px 16px rgba(0,0,0,0.06); border:1px solid var(--border); }
        .login-brand { display:flex; align-items:center; gap:14px; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid var(--border); }
        .login-logo { width:52px; height:52px; background:linear-gradient(145deg,var(--green-600),var(--green-800)); border-radius:18px; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-green); flex-shrink:0; }
        .login-brand h1 { font-size:1.4rem; font-weight:800; color:var(--text-1); letter-spacing:-0.5px; }
        .login-brand p { font-size:0.72rem; color:var(--text-3); margin-top:2px; }
        .login-card h2 { font-size:1.3rem; font-weight:800; color:var(--text-1); letter-spacing:-0.3px; }
        .login-sub { color:var(--text-3); font-size:0.85rem; margin-top:4px; margin-bottom:24px; }
        .login-form { display:flex; flex-direction:column; gap:16px; }
        .login-hint { margin-top:24px; text-align:center; font-size:0.72rem; color:var(--text-4); display:flex; align-items:center; justify-content:center; gap:6px; }
      `}</style>
    </div>
  )
}

export default LoginPage
