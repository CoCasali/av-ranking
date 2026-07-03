import { useState } from 'react'
import logo from '../assets/logo.png'
import { supabase } from '../supabaseClient'

export default function Login({ onGuestAccess }) {
  const [mode, setMode] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitAdmin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) setError('Identifiants incorrects')
  }

  function submitGuest(e) {
    e.preventDefault()
    setError('')
    if (passcode === import.meta.env.VITE_GUEST_PASSCODE) {
      onGuestAccess()
    } else {
      setError('Code incorrect')
    }
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="" className="h-52 w-52" />
          <h1 className="text-lg font-semibold">AV Ranking</h1>
        </div>

        {mode === 'admin' ? (
          <form onSubmit={submitAdmin} className="space-y-6">
            <div className="space-y-3">
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium hover:bg-sky-400 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitGuest} className="space-y-6">
            <input
              autoFocus
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Code d'accès"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium hover:bg-amber-400"
            >
              Voir le classement
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'admin' ? 'guest' : 'admin')
            setError('')
          }}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
        >
          {mode === 'admin' ? "J'ai un code d'accès invité" : 'Connexion admin'}
        </button>
      </div>
    </div>
  )
}
