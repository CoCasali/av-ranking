import { useEffect, useState } from 'react'
import { Trophy, CirclePlus, Settings as SettingsIcon } from 'lucide-react'
import Settings from './pages/Settings'
import NewResult from './pages/NewResult'
import Rankings from './pages/Rankings'
import Login from './pages/Login'
import logo from './assets/logo.png'
import { supabase } from './supabaseClient'

const TABS = [
  { key: 'rankings', label: 'Classement', Icon: Trophy, Component: Rankings },
  { key: 'newResult', label: 'Match', Icon: CirclePlus, Component: NewResult },
  { key: 'settings', label: 'Réglages', Icon: SettingsIcon, Component: Settings },
]

function App() {
  const [tab, setTab] = useState('rankings')
  const [session, setSession] = useState(undefined)
  const [guest, setGuest] = useState(() => localStorage.getItem('av-guest') === 'true')
  const Active = TABS.find((t) => t.key === tab).Component

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function logout() {
    supabase.auth.signOut()
  }

  function exitGuest() {
    localStorage.removeItem('av-guest')
    setGuest(false)
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Chargement…</p>
      </div>
    )
  }

  if (guest && !session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800">
          <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
            <img src={logo} alt="" className="h-9 w-9" />
            <h1 className="text-xl font-semibold tracking-tight flex-1">AV Ranking</h1>
            <button onClick={exitGuest} className="text-xs text-slate-500 hover:text-slate-300">
              Quitter
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-md px-4 py-6">
          <Rankings />
        </main>
      </div>
    )
  }

  if (!session) {
    return (
      <Login
        onGuestAccess={() => {
          localStorage.setItem('av-guest', 'true')
          setGuest(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <img src={logo} alt="" className="h-9 w-9" />
          <h1 className="text-xl font-semibold tracking-tight flex-1">AV Ranking</h1>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-24">
        <Active canEdit />
      </main>

      <nav className="fixed bottom-0 inset-x-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-md flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-label={t.label}
              aria-current={tab === t.key ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition ${
                tab === t.key ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <t.Icon size={22} strokeWidth={tab === t.key ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
